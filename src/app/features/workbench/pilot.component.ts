/**
 * @apt-labs/features/workbench/pilot — PilotComponent
 *
 * Local in-memory coordination journey with explicitly reported outcomes.
 * Reported work is not independently verified and is not shared or persistent.
 */
import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoordinationService, SelectionService } from '@apt-labs/shared/state';
import { InspectorComponent, InspectorEntity } from '@apt-labs/features/workspace/inspector.component';
import { RelationshipGraphComponent, GraphNode, GraphEdge } from '@apt-labs/features/workspace/relationship-graph.component';
import { CommandPaletteComponent } from '@apt-labs/features/workspace/command-palette.component';
import type { Journey } from '@apt-labs/domain';

@Component({
  selector: 'app-pilot',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    InspectorComponent,
    RelationshipGraphComponent,
    CommandPaletteComponent,
  ],
  template: `
    <app-command-palette (execute)="onPaletteExecute($event)"></app-command-palette>

    @if (journey(); as j) {
      <div class="pilot-page">
        <nav class="pilot-bread" aria-label="Breadcrumb">
          <a [routerLink]="['/workspace/workbench']" class="pilot-back">Workbench</a>
          @if (selection.hasSelection()) {
            <span class="pilot-sep">›</span>
            <a class="pilot-back" (click)="goBack()">{{ selection.selected()?.name }}</a>
          }
          <span class="pilot-current">{{ j.need?.data['need'] }}</span>
        </nav>

        <header class="pilot-head">
          <div class="pilot-meta">
            <span class="pilot-id">{{ needId }}</span>
            <span class="pilot-status" [class]="'pilot-status ' + status()">{{ status() }}</span>
          </div>
          <h1 class="pilot-title">{{ j.need?.data['need'] }}</h1>
          <p class="pilot-lede">
            This local record is held in memory only. Reported work is not independently verified.
          </p>
        </header>

        <section class="pilot-section pilot-graph">
          <h2 class="pilot-section-title">Relationship graph</h2>
          <app-relationship-graph
            [nodes]="graphNodes()"
            [edges]="graphEdges()"
            (nodeSelected)="onNodeSelected($event)"
          ></app-relationship-graph>
        </section>

        <section class="pilot-section pilot-chain">
          <h2 class="pilot-section-title">Coordination chain</h2>
          <ol class="chain">
            <li class="chain-step is-live">
              <span class="chain-k">Intention</span>
              <span class="chain-v">{{ j.need?.data['need'] }}</span>
              <span class="chain-note">need · {{ status() === 'fulfilled' ? 'reported' : status() }}</span>
            </li>
            @if (j.commitments[0]; as c) {
              <li class="chain-step is-live">
                <span class="chain-k">Commitment</span>
                <span class="chain-v">Provider {{ c.data['providerActorId'] }}</span>
                <span class="chain-note">{{ c.data['status'] }}</span>
              </li>
            } @else {
              <li class="chain-step">
                <span class="chain-k">Commitment</span>
                <span class="chain-v">Not yet accepted</span>
              </li>
            }
            @if (j.outcomes[0]; as o) {
              <li class="chain-step is-live">
                <span class="chain-k">Reported outcome</span>
                <span class="chain-v">{{ o.data['outcome'] }}</span>
                <span class="chain-note">{{ o.evidenceIds.length }} evidence references</span>
              </li>
            } @else {
              <li class="chain-step">
                <span class="chain-k">Outcome</span>
                <span class="chain-v">Not yet reported</span>
              </li>
            }
          </ol>
        </section>

        @if (j.outcomes[0]; as o) {
          <section class="pilot-section pilot-evidence">
            <h2 class="pilot-section-title">Evidence</h2>
            <div class="evidence-wrap">
              <ul class="evidence-list">
                @for (e of evidence(); track e.id) {
                  <li class="evidence-item">
                    <span class="evidence-title">{{ e.title }}</span>
                    <span class="evidence-layer">{{ e.layer }}</span>
                  </li>
                }
              </ul>
              @if (evidence().length === 0) {
                <p class="pilot-evidence-note">No evidence artefacts are attached. The outcome is a participant report only.</p>
              } @else {
                <p class="pilot-evidence-note">These are evidence references only; the artefacts and any independent assessment are not connected.</p>
              }
            </div>
          </section>
        }

        @if (j.auditEvents.length > 0) {
          <section class="pilot-section pilot-audit">
            <h2 class="pilot-section-title">Audit trail</h2>
            <ul class="audit">
              @for (ev of j.auditEvents; track ev.id) {
                <li class="audit-item">
                  <span class="audit-action">{{ ev.action }}</span>
                  <span class="audit-time">{{ ev.timestamp }}</span>
                </li>
              }
            </ul>
          </section>
        }

        <app-inspector
          [open]="inspectorOpen()"
          [entity]="inspectorEntity()"
        ></app-inspector>

        <div class="pilot-actions">
          @if (status() === 'open') {
            <button class="pilot-btn pilot-btn--primary" type="button" (click)="accept()">Record commitment</button>
          } @else if (status() === 'committed') {
            <input class="pilot-outcome-input" [ngModel]="outcomeText()" (ngModelChange)="outcomeText.set($event)" placeholder="Record the reported outcome…" aria-label="Outcome" />
            <button class="pilot-btn pilot-btn--primary" type="button" (click)="fulfil()">Record reported outcome</button>
          } @else if (status() === 'fulfilled') {
            <span class="pilot-delivered">Reported outcome — {{ j.outcomes[0]?.data['outcome'] }}. Independent verification is not recorded.</span>
          }
        </div>
      </div>
    } @else {
      <div class="pilot-page">
        <div class="pilot-empty">
          <p>No journey found for this need.</p>
          <a [routerLink]="['/workspace/workbench']" class="pilot-back">Back to Workbench</a>
        </div>
      </div>
    }
  `,
  styles: [
    `
    .pilot-page {
      font-family: var(--apt-font-sans);
      color: var(--apt-text-body);
      background: var(--apt-surface-default);
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
    }

    .pilot-bread {
      display: flex;
      align-items: center;
      gap: var(--apt-space-3);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-sm);
      color: var(--apt-text-dim);
      margin-bottom: var(--apt-space-6);
      padding-left: var(--apt-space-10);
    }
    .pilot-bread a {
      color: var(--apt-text-muted);
      text-decoration: none;
    }
    .pilot-bread a:hover { color: var(--apt-accent); }
    .pilot-sep { color: var(--apt-text-dim); }
    .pilot-current { color: var(--apt-text-body); }

    .pilot-head {
      margin-bottom: var(--apt-space-10);
      padding-left: var(--apt-space-10);
    }
    .pilot-meta {
      display: flex;
      gap: var(--apt-space-5);
      margin-bottom: var(--apt-space-3);
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-sm);
      align-items: center;
    }
    .pilot-id { color: var(--apt-text-muted); }
    .pilot-status {
      font-weight: var(--apt-weight-medium);
      text-transform: capitalize;
      padding: var(--apt-space-1) var(--apt-space-3);
      border-radius: var(--apt-button-radius);
      background: var(--apt-surface-raised);
      color: var(--apt-text-body);
      border: 1px solid var(--apt-border);
    }
    .pilot-status.open { color: var(--apt-text-muted); border-color: var(--apt-border-faint); }
    .pilot-status.committed { background: var(--apt-surface-info); color: var(--apt-text-info); border-color: var(--apt-accent); }
    .pilot-status.fulfilled { background: var(--apt-surface-success); color: var(--apt-text-success); border-color: var(--apt-state-canon); }

    .pilot-title {
      font-family: var(--apt-font-serif);
      font-size: var(--apt-size-display);
      font-weight: var(--apt-weight-semibold);
      color: var(--apt-text-strong);
      margin: 0 0 var(--apt-space-3);
      line-height: 1.05;
      letter-spacing: -0.02em;
    }
    .pilot-lede {
      font-size: var(--apt-size-body);
      color: var(--apt-text-muted);
      margin: 0;
      max-width: 72ch;
      line-height: var(--apt-line-relaxed);
    }

    .pilot-section {
      padding: var(--apt-space-6);
      border-radius: var(--apt-radius-md);
      border: 1px solid var(--apt-border);
      background: var(--apt-surface-page);
      margin-bottom: var(--apt-space-8);
      padding-left: var(--apt-space-10);
    }
    .pilot-section-title {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--apt-text-dim);
      margin: 0 0 var(--apt-space-4);
    }

    .chain {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--apt-space-4);
    }
    .chain-step {
      display: flex;
      flex-wrap: wrap;
      gap: var(--apt-space-3);
      align-items: baseline;
      padding: var(--apt-space-3) var(--apt-space-5);
      border: 1px solid var(--apt-border-faint);
      border-radius: var(--apt-button-radius);
      color: var(--apt-text-muted);
      background: var(--apt-surface-raised);
    }
    .chain-step.is-live { border-color: var(--apt-accent); background: color-mix(in srgb, var(--apt-accent) 6%, transparent); }
    .chain-k {
      font-family: var(--apt-font-mono);
      font-size: var(--apt-size-micro);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--apt-text-dim);
      min-width: 96px;
      font-weight: var(--apt-weight-medium);
    }
    .chain-v { font-size: var(--apt-size-body); color: var(--apt-text-strong); }
    .chain-note { margin-left: auto; font-size: var(--apt-size-micro); color: var(--apt-text-muted); text-transform: capitalize; }

    .evidence-wrap { display: flex; flex-direction: column; gap: var(--apt-space-5); }
    .evidence-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-space-2); }
    .evidence-item { display: flex; justify-content: space-between; gap: var(--apt-space-4); font-size: var(--apt-size-micro); padding: var(--apt-space-2) var(--apt-space-3); border: 1px solid var(--apt-border); border-radius: var(--apt-button-radius); background: var(--apt-surface-raised); }
    .evidence-title { color: var(--apt-text-strong); }
    .evidence-layer { color: var(--apt-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

    .audit { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-space-2); }
    .audit-item { display: flex; justify-content: space-between; gap: var(--apt-space-4); font-size: var(--apt-size-micro); padding: var(--apt-space-2) var(--apt-space-3); border: 1px solid var(--apt-border-faint); border-radius: var(--apt-button-radius); background: var(--apt-surface-default); }
    .audit-action { font-family: var(--apt-font-mono); color: var(--apt-text-body); }
    .audit-time { font-family: var(--apt-font-mono); color: var(--apt-text-muted); }

    .pilot-actions {
      display: flex;
      gap: var(--apt-space-4);
      flex-wrap: wrap;
      align-items: center;
      padding-left: var(--apt-space-10);
      margin-bottom: var(--apt-space-10);
    }
    .pilot-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--apt-space-2);
      padding: var(--apt-button-padding);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-button-radius);
      background: var(--apt-surface-raised);
      color: var(--apt-text-body);
      font-size: var(--apt-button-font-size);
      font-weight: var(--apt-button-font-weight);
      font-family: inherit;
      cursor: pointer;
    }
    .pilot-btn:hover { border-color: var(--apt-accent); }
    .pilot-btn--primary { background: var(--apt-accent); color: var(--apt-action-on-accent); border-color: var(--apt-accent); }
    .pilot-btn--primary:hover { background: color-mix(in srgb, var(--apt-accent) 90%, var(--apt-surface-default)); }
    .pilot-delivered { font-size: var(--apt-size-body); color: var(--apt-text-success); }

    .pilot-outcome-input {
      flex: 1;
      min-width: 200px;
      padding: var(--apt-space-3) var(--apt-space-5);
      border-radius: var(--apt-button-radius);
      border: 1px solid var(--apt-border);
      background: var(--apt-surface-raised);
      color: var(--apt-text-strong);
      font-size: var(--apt-size-body);
      font-family: inherit;
    }
    .pilot-outcome-input:focus { outline: none; border-color: var(--apt-accent); }

    .pilot-evidence-note { color: var(--apt-text-muted); font-size: var(--apt-size-body); margin: var(--apt-space-4) 0 0; }

    .pilot-empty {
      text-align: center;
      padding: var(--apt-space-22);
      color: var(--apt-text-muted);
      display: flex;
      flex-direction: column;
      gap: var(--apt-space-4);
      align-items: center;
    }

    @media (max-width: 760px) {
      .pilot-page { padding: var(--apt-space-8); }
      .pilot-head { padding-left: 0; }
      .pilot-section { padding-left: 0; }
      .pilot-actions { padding-left: 0; }
      .pilot-bread { padding-left: 0; }
      .pilot-actions { flex-direction: column; align-items: stretch; }
      .pilot-outcome-input { width: 100%; }
    }
    `,
  ],
})
export class PilotComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(CoordinationService);
  readonly selection = inject(SelectionService);

  readonly needId: string;
  private readonly journey_ = signal<Journey | null>(null);
  private readonly outcomeText = signal('');

  readonly journey = this.journey_;
  constructor() {
    this.needId = this.route.snapshot.paramMap.get('pilot') ?? '';
    const journey = this.service.journey(this.needId);
    this.journey_.set(journey.need ? journey : null);
  }

  readonly evidence = computed(() => {
    const j = this.journey_();
    const ids = j?.outcomes[0]?.evidenceIds ?? [];
    return ids.map((id) => ({ id, title: id, layer: 'unclassified' }));
  });

  status(): string {
    return (this.journey_()?.need?.data as { status?: string } | undefined)?.status ?? 'unknown';
  }

  readonly graphNodes = computed<GraphNode[]>(() => {
    const j = this.journey_();
    if (!j?.need) return [];
    const nodes: GraphNode[] = [
      { id: j.need.id, label: j.need.data['need'] as string, family: 'INTENTION', standing: 'reported', cycleStage: 'intention', authorityGated: true },
    ];
    for (const c of j.commitments) {
      nodes.push({ id: c.id, label: 'Commitment · ' + (c.data['providerActorId'] as string), family: 'COMMITMENT', standing: c.data['status'] as string, cycleStage: 'commitment', authorityGated: true });
    }
    for (const o of j.outcomes) {
      nodes.push({ id: o.id, label: 'Outcome · ' + (o.data['outcome'] as string), family: 'OUTPUT_OUTCOME', standing: 'reported', cycleStage: 'outcome', authorityGated: false });
    }
    for (const e of this.evidence()) {
      nodes.push({ id: e.id, label: e.title, family: 'EVIDENCE', standing: 'reported', cycleStage: 'evidence', authorityGated: false });
    }
    return nodes;
  });

  readonly graphEdges = computed<GraphEdge[]>(() => {
    const j = this.journey_();
    if (!j?.need) return [];
    const edges: GraphEdge[] = [];
    for (const c of j.commitments) {
      edges.push({ id: `e-${c.id}`, source: j.need.id, target: c.id, kind: 'COMMITTED_TO', sourceRole: 'commissioner', targetRole: 'provider' });
    }
    for (const o of j.outcomes) {
      const commitment = j.commitments[0];
      if (commitment) edges.push({ id: `e-${o.id}`, source: commitment.id, target: o.id, kind: 'FULFILLS', sourceRole: 'provider', targetRole: 'outcome' });
    }
    for (const e of this.evidence()) {
      const outcome = j.outcomes[0];
      if (outcome) edges.push({ id: `e-ev-${e.id}`, source: outcome.id, target: e.id, kind: 'SUPPORTED_BY', sourceRole: 'outcome', targetRole: 'evidence' });
    }
    return edges;
  });

  readonly inspectorOpen = computed(() => this.selection.hasSelection());

  readonly inspectorEntity = computed<InspectorEntity | null>(() => {
    const s = this.selection.selected();
    if (!s) return null;
    return {
      id: s.id,
      name: s.name,
      family: s.family,
      type: s.type,
      standing: s.standing,
      maturity: s.maturity,
      relationships: s.relationships,
      cycleStage: s.cycleStage,
      authorityGated: s.authorityGated,
    };
  });

  accept(): void {
    this.service.acceptNeed(this.needId, this.service.accountId());
    this.journey_.set(this.service.journey(this.needId));
  }

  fulfil(): void {
    const commitmentId = this.journey_()?.commitments[0]?.id;
    if (!commitmentId) return;
    const outcome = this.outcomeText().trim();
    if (!outcome) return;
    this.service.fulfilNeed(commitmentId, outcome);
    this.journey_.set(this.service.journey(this.needId));
  }

  onNodeSelected(nodeId: string): void {
    const node = this.graphNodes().find((n) => n.id === nodeId);
    if (node) {
      this.selection.select({
        id: node.id,
        name: node.label,
        family: node.family,
        type: node.family,
        standing: node.standing,
        cycleStage: node.cycleStage,
        authorityGated: node.authorityGated,
        source: 'workbench',
      });
    }
  }

  goBack(): void {
    const prev = this.selection.back();
    if (prev) {
      this.selection.select({
        id: prev.id,
        name: prev.name,
        family: prev.family,
        type: prev.type,
        standing: prev.standing,
        cycleStage: prev.cycleStage,
        authorityGated: prev.authorityGated,
        source: prev.source,
      });
    }
  }

  onPaletteExecute(exec: { action: string; payload?: any }): void {
    if (exec.action === 'create-need') {
      this.router.navigate(['/workspace/workbench']);
    }
  }
}
