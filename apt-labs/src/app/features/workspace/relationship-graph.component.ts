/**
 * @apt-labs/features/workspace — RelationshipGraphComponent
 *
 * Renders the entities and typed relationships of a coordination journey as a
 * force-directed graph using cytoscape (already a project dependency).
 *
 * Each node is an entity (need, commitment, outcome, evidence). Each edge is a
 * first-class typed relationship (ANSWERS, FULFILLS, SUPPORTED_BY, etc.) with
 * its own metadata: kind, roles, authority, verification status.
 *
 * Clicking a node selects it in the SelectionService, opening the Inspector
 * with that entity's context. Clicking an edge shows its metadata.
 */
import { Component, input, output, effect, OnDestroy, inject } from '@angular/core';
import cytoscape from 'cytoscape';
import { SelectionService, type SelectedEntity } from '@apt-labs/shared/state';

export interface GraphNode {
  id: string;
  label: string;
  family: string;
  standing?: string;
  cycleStage?: string;
  authorityGated?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: string;
  sourceRole?: string;
  targetRole?: string;
  authority?: string;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'disputed' | 'rejected';
}

@Component({
  selector: 'app-relationship-graph',
  standalone: true,
  imports: [],
  template: `<div class="rg-container"><div id="rg-cy"></div></div>`,
  styles: [
    `
    .rg-container { width: 100%; height: 100%; position: relative; background: var(--apt-surface-page); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r2); }
    #rg-cy { width: 100%; height: 100%; display: block; }
    `,
  ],
})
export class RelationshipGraphComponent implements OnDestroy {
  private readonly selection = inject(SelectionService);

  readonly nodes = input<GraphNode[]>([]);
  readonly edges = input<GraphEdge[]>([]);
  readonly nodeSelected = output<string>();

  private cy: cytoscape.Core | null = null;
  private readonly containerId = 'rg-cy';

  constructor() {
    effect(() => {
      const n = this.nodes();
      const e = this.edges();
      if (this.cy && (n.length > 0 || e.length > 0)) {
        this.updateGraph(n, e);
      }
    });
  }

  private initCy(): void {
    if (this.cy) return;
    const cy = (cytoscape as any)({
      container: document.getElementById(this.containerId),
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': '#6366f1',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '10px',
            'width': '40px',
            'height': '40px',
            'border-width': '2px',
            'border-color': '#374151',
            'text-outline-width': '2px',
            'text-outline-color': '#6366f1',
          },
        },
        {
          selector: 'edge',
          style: {
            'label': 'data(kind)',
            'font-size': '8px',
            'text-rotation': 'autorotate',
            'color': '#6b7280',
            'line-color': '#9ca3af',
            'target-arrow-color': '#9ca3af',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
        {
          selector: '.selected',
          style: {
            'border-color': '#22c55e',
            'background-color': '#22c55e',
          },
        },
      ],
      layout: { name: 'cose', animate: false },
      wheelSensitivity: 0.2,
      boxSelectionEnabled: false,
    });
    this.cy = cy;

    cy.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      const id = node.id();
      const nodeData = this.nodes().find((n) => n.id === id);
      if (nodeData) {
        this.selection.select({
          id: nodeData.id,
          name: nodeData.label,
          family: nodeData.family,
          type: nodeData.family,
          standing: nodeData.standing,
          cycleStage: nodeData.cycleStage,
          authorityGated: nodeData.authorityGated,
          source: 'workbench',
        });
        this.nodeSelected.emit(id);
      }
      cy.elements().removeClass('selected');
      node.addClass('selected');
    });

    cy.on('tap', 'edge', (evt: any) => {
      const edge = evt.target;
      console.log('Edge tapped:', edge.data());
    });
  }

  private updateGraph(nodes: GraphNode[], edges: GraphEdge[]): void {
    if (!this.cy) this.initCy();
    const cy = this.cy!;

    const elements: any[] = [];
    for (const n of nodes) {
      elements.push({
        group: 'nodes',
        data: { id: n.id, label: n.label, family: n.family, standing: n.standing },
        classes: n.authorityGated ? 'gated' : '',
      });
    }
    for (const e of edges) {
      elements.push({
        group: 'edges',
        data: { id: e.id, source: e.source, target: e.target, kind: e.kind },
      });
    }

    cy.elements().remove();
    cy.add(elements);
    cy.layout({ name: 'cose', animate: false }).run();
  }

  ngOnDestroy(): void {
    if (this.cy) {
      this.cy.destroy();
      this.cy = null;
    }
  }
}
