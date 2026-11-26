/**
 * @apt-labs/features/ontology — ObjectExplorerComponent
 *
 * The live half of the ontology module: typed object sets queried through the
 * server's Studio engine, with an authorized neighborhood rendered as a graph.
 * It reads the same tables the schema documents beside it — nothing here is demo
 * data, and nothing is aggregated that the API did not authorize.
 */
import { Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import cytoscape, { type Core, type ElementDefinition } from 'cytoscape';
import { STUDIO_OBJECT_TYPES, type StudioObjectTypeId } from '@apt-labs/domain';
import { StudioDataService, type StudioGraph, type StudioObject, type StudioTypeDefinition } from '@apt-labs/shared/state';

const TYPE_COLORS: Record<StudioObjectTypeId, string> = {
  organization: '#2e4a3a',
  undertaking: '#ad8b55',
  person: '#5c6b5e',
  interest: '#8c8473',
  offer: '#c9a227',
  report: '#0891b2',
  review: '#7c5cbf',
  event: '#b9b2a3',
};

const GRAPH_STYLE = [
  {
    selector: 'node',
    style: {
      'background-color': 'data(color)',
      'border-width': 2,
      'border-color': '#faf8f2',
      width: 18,
      height: 18,
      label: 'data(short)',
      'font-family': 'ui-monospace, Consolas, monospace',
      'font-size': 8,
      color: '#3a352d',
      'text-valign': 'bottom',
      'text-margin-y': 5,
      'text-max-width': '92px',
      'text-wrap': 'ellipsis',
    },
  },
  {
    selector: 'node[root]',
    style: { width: 30, height: 30, 'border-width': 4, 'border-color': '#14130d', 'font-size': 9, 'font-weight': 'bold' },
  },
  {
    selector: 'edge',
    style: {
      width: 1,
      'line-color': '#d9d4c8',
      'target-arrow-color': '#d9d4c8',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'font-size': 7,
      color: '#8c8473',
      'text-rotation': 'autorotate',
      'text-background-color': '#ffffff',
      'text-background-opacity': 0.85,
      'text-background-padding': 2,
    },
  },
  { selector: 'node:selected', style: { 'border-color': '#2e4a3a', 'border-width': 3 } },
];

@Component({
  selector: 'app-object-explorer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './object-explorer.component.html',
  styleUrl: './object-explorer.component.css',
})
export class ObjectExplorerComponent {
  private readonly studio = inject(StudioDataService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly graphHost = viewChild<ElementRef<HTMLDivElement>>('graphHost');
  private graphInstance: Core | null = null;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly result = this.studio.result;
  readonly graph = this.studio.graph;
  readonly selected = this.studio.selected;
  readonly loading = this.studio.loading;
  readonly graphLoading = this.studio.graphLoading;
  readonly error = this.studio.error;

  readonly activeId = signal<StudioObjectTypeId>('undertaking');
  readonly search = signal('');
  readonly sort = signal<'recent' | 'title' | 'status'>('recent');
  readonly statuses = signal<string[]>([]);
  readonly depth = signal<1 | 2>(1);
  readonly objects = signal<StudioObject[]>([]);

  readonly types = computed<StudioTypeDefinition[]>(() => {
    const loaded = this.studio.overview()?.types;
    return loaded?.length ? loaded : [...STUDIO_OBJECT_TYPES] as unknown as StudioTypeDefinition[];
  });
  readonly counts = computed<Record<string, number>>(() => this.studio.overview()?.counts ?? {});
  readonly activeType = computed<StudioTypeDefinition>(() => this.types().find((type) => type.id === this.activeId()) ?? this.types()[0]!);
  readonly activeProperties = computed(() => this.activeType().properties);
  readonly facets = computed(() => this.result()?.facets ?? []);

  constructor() {
    afterNextRender(() => { void this.boot(); });

    effect(() => {
      const host = this.graphHost();
      const graph = this.graph();
      if (!host?.nativeElement) return;
      this.renderGraph(host.nativeElement, graph);
    });

    this.destroyRef.onDestroy(() => {
      this.graphInstance?.destroy();
      this.graphInstance = null;
      if (this.searchTimer) clearTimeout(this.searchTimer);
    });
  }

  typeColor(id: string): string { return TYPE_COLORS[id as StudioObjectTypeId] ?? '#8c8473'; }
  typeLabel(id: string): string { return this.types().find((type) => type.id === id)?.label ?? id; }

  async boot(): Promise<void> {
    await this.studio.loadOverview();
    await this.runQuery();
  }

  selectType(id: StudioObjectTypeId): void {
    if (id === this.activeId()) return;
    this.activeId.set(id);
    this.statuses.set([]);
    this.objects.set([]);
    this.studio.clearGraph();
    void this.runQuery();
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { void this.runQuery(); }, 220);
  }

  onSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as 'recent' | 'title' | 'status');
    void this.runQuery();
  }

  toggleStatus(value: string): void {
    this.statuses.update((current) => current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]);
    void this.runQuery();
  }

  async runQuery(offset = 0): Promise<void> {
    const set = await this.studio.query({
      type: this.activeId(),
      search: this.search().trim() || undefined,
      status: this.statuses().length ? this.statuses() : undefined,
      sort: this.sort(),
      limit: 40,
      offset,
    });
    if (!set) return;
    this.objects.update((current) => offset === 0 ? set.objects : [...current, ...set.objects]);
    if (offset === 0) {
      this.studio.selected.set(null);
      this.studio.clearGraph();
    }
  }

  loadMore(): void { void this.runQuery(this.objects().length); }

  inspect(object: StudioObject): void {
    this.studio.selected.set(object);
    this.depth.set(1);
    void this.studio.loadGraph(object.type, object.id, 1);
  }

  setDepth(depth: 1 | 2): void {
    const object = this.selected();
    if (!object) return;
    this.depth.set(depth);
    void this.studio.loadGraph(object.type, object.id, depth);
  }

  clearSelection(): void { this.studio.clearGraph(); }

  facetLabel(value: string): string { return value.replaceAll('_', ' '); }

  formatValue(key: string, value: string): string {
    if (key.endsWith('At')) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
      }
    }
    return value;
  }

  stateTone(status: string): string {
    const normal = status.toLowerCase();
    if (['accepted', 'active', 'open', 'canon'].includes(normal)) return 'ok';
    if (['pending', 'proposed', 'needs_revision', 'unreviewed'].includes(normal)) return 'wait';
    if (['declined', 'disputed', 'closed', 'risk', 'revoked'].includes(normal)) return 'risk';
    return 'muted';
  }

  private renderGraph(host: HTMLDivElement, graph: StudioGraph | null): void {
    this.graphInstance?.destroy();
    this.graphInstance = null;
    if (!graph || !graph.nodes.length) { host.innerHTML = ''; return; }

    const elements: ElementDefinition[] = [
      ...graph.nodes.map((node) => ({
        data: {
          id: node.type + ':' + node.id,
          label: node.title,
          short: node.title.length > 26 ? node.title.slice(0, 25) + '…' : node.title,
          color: this.typeColor(node.type),
        },
        classes: node.type + ':' + node.id === graph.root ? 'root' : '',
      })),
      ...graph.edges.map((edge) => ({ data: { id: edge.id, source: edge.source, target: edge.target, label: edge.label } })),
    ];

    this.graphInstance = cytoscape({
      container: host,
      elements,
      style: GRAPH_STYLE,
      layout: { name: 'cose', animate: false, fit: true, padding: 24, nodeRepulsion: () => 9000, idealEdgeLength: () => 80 },
      wheelSensitivity: 0.2,
      minZoom: 0.35,
      maxZoom: 2.2,
    } as unknown as cytoscape.CytoscapeOptions);
  }
}
