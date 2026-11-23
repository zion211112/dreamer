/**
 * @apt-labs/features/workbench/pilot — PilotComponent
 *
 * Vertical slice: Intention → Commitment → Output/Outcome → Evidence.
 *
 * Renders the coordination journey live from the shared CoordinationService
 * and adds the ontology-driven UI:
 *   - Typed relationship graph (cytoscape)
 *   - Entity inspection (InspectorComponent, context-preserving via SelectionService)
 *   - Evidence standing with authority-gated transitions (EvidenceStandingComponent)
 *   - Command palette (Cmd-K, CommandPaletteComponent)
 *
 * All chain actions accept / fulfil come from CoordinationService (existing,
 * authoritative domain logic). Evidence standing transitions emit via
 * EvidenceStandingComponent.onTransition, to be wired to the domain/action
 * layer or n8n callback.
 */
import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoordinationService, SelectionService } from '@apt-labs/shared/state';
import { InspectorComponent, InspectorEntity } from '@apt-labs/features/workspace/inspector.component';
import { EvidenceStandingComponent, EvidenceActorRole } from '@apt-labs/features/workspace/evidence-standing.component';
import { RelationshipGraphComponent, GraphNode, GraphEdge } from '@apt-labs/features/workspace/relationship-graph.component';
import { CommandPaletteComponent } from '@apt-labs/features/workspace/command-palette.component';
import type { Journey, OperationalPilot } from '@apt-labs/domain';

@Component({
  selector: 'app-pilot',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    InspectorComponent,
    EvidenceStandingComponent,
    RelationshipGraphComponent,
    CommandPaletteComponent,
  ],
  template: `
    <app-command-palette (execute)="onPaletteExecute($event)"></app-command-palette>

    @if (journey(); as j) {
      <div class="pilot-page">
        <div class="pilot-breadcrumb">
          <a [routerLink]="['/workspace/workbench']" class="pilot-back">Back to Workbench</a>
          @if (selection.hasSelection()) {
            <span class="pilot-breadcrumb-sep">›</span>
            <a class="pilot-back" (click)="goBack()">Back to {{ selection.selected()?.name }}</a>
          }
        </div>

        <header class="pilot-head">
          <div class="pilot-pagehead">
            <p class="pilot-eyebrow">WORKSPACE · WORKBENCH · {{ j.need?.data['need'] }}</p>
            <h1 class="pilot-h1">{{ j.need?.data['need'] }}</h1>
            <p class="pilot-sub">
              Intention → Commitment → Output/Outcome → Evidence. One action ripples across every surface.
            </p>
          </div>
          <div class="pilot-actions">
            @if (status() === 'open') {
              <button class="pilot-btn pilot-btn--primary" type="button" (click)="accept()">Accept as provider</button>
            } @else if (status() === 'committed') {
              <input class="pilot-outcome-input" [ngModel]="outcomeText()" (ngModelChange)="outcomeText.set($event)" placeholder="Record the delivered outcome…" aria-label="Outcome" />
              <button class="pilot-btn pilot-btn--primary" type="button" (click)="fulfil()">Record outcome</button>
            } @else {
              <span class="pilot-delivered">Delivered & verified — {{ j.outcomes[0]?.data['outcome'] }}</span>
            }
          </div>
        </header>

        <!-- Relationship graph -->
        <section class="pilot-section">
          <h2 class="pilot-section-title">Relationship graph</h2>
          <app-relationship-graph
            [nodes]="graphNodes()"
            [edges]="graphEdges()"
            (nodeSelected)="onNodeSelected($event)"
          ></app-relationship-graph>
        </section>

        <!-- Coordination chain -->
        <section class="pilot-section">
          <h2 class="pilot-section-title">Coordination chain</h2>
          <ol class="chain">
            <li class="chain-step is-live">
              <span class="chain-k">Intention</span>
              <span class="chain-v">{{ j.need?.data['need'] }}</span>
              <span class="chain-note">need · {{ status() }}</span>
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
                <span class="chain-k">Outcome</span>
                <span class="chain-v">{{ o.data['outcome'] }}</span>
                <span class="chain-note">{{ o.evidenceIds.length }} evidence</span>
              </li>
            } @else {
              <li class="chain-step">
                <span class="chain-k">Outcome</span>
                <span class="chain-v">Not yet delivered</span>
              </li>
            }
          </ol>
        </section>

        <!-- Evidence with standing transitions -->
        @if (j.outcomes[0]; as o) {
          <section class="pilot-section">
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
              <app-evidence-standing
                [current]="evidenceStanding()"
                [actorRole]="actorRole"
                (onTransition)="onEvidenceTransition($event)"
              ></app-evidence-standing>
            </div>
          </section>
        }

        <!-- Audit trail -->
        @if (j.auditEvents.length > 0) {
          <section class="pilot-section">
            <h2 class="pilot-section-title">Audit trail (provenance)</h2>
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

        <!-- Inspector -->
        <app-inspector
          [open]="inspectorOpen()"
          [entity]="inspectorEntity()"
        ></app-inspector>
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
    .pilot-page { font-family: var(--apt-font-sans); color: var(--apt-text-body); background: var(--apt-surface-default); min-height: 100%; display: flex; flex-direction: column; }

    .pilot-breadcrumb { display: flex; align-items: center; gap: var(--apt-spacing-s3); font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); color: var(--apt-text-dim); margin-bottom: var(--apt-spacing-s4); }
    .pilot-breadcrumb a { color: var(--apt-text-muted); text-decoration: none; }
    .pilot-breadcrumb a:hover { color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .pilot-breadcrumb-sep { color: var(--apt-text-dim); }

    .pilot-head { margin-bottom: 0; }
    .pilot-pagehead { margin-bottom: var(--apt-spacing-s8); }
    .pilot-eyebrow { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); letter-spacing: 0.12em; color: var(--apt-text-dim); margin: 0 0 var(--apt-spacing-s2); text-transform: uppercase; }
    .pilot-h1 { font-family: var(--apt-font-serif); font-size: var(--apt-font-size-display); font-weight: var(--apt-font-weight-semibold); color: var(--apt-text-strong); margin: 0 0 var(--apt-spacing-s3); letter-spacing: -0.022em; line-height: 1.05; }
    .pilot-sub { font-size: var(--apt-font-size-body-md); color: var(--apt-text-muted); margin: 0; max-width: 72ch; line-height: var(--apt-line-height-relaxed); }
    .pilot-actions { display: flex; gap: var(--apt-spacing-s3); flex-wrap: wrap; align-items: center; }

    .pilot-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--apt-spacing-s2);
      padding: var(--apt-button-padding);
      border: 1px solid var(--apt-border);
      border-radius: var(--apt-radius-r1);
      background: var(--apt-surface-raised);
      color: var(--apt-text-body);
      font-size: var(--apt-font-size-body-sm);
      font-weight: var(--apt-font-weight-medium);
      font-family: inherit;
      cursor: pointer;
    }
    .pilot-btn:hover { border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .pilot-btn--primary { background: var(--apt-module-accent, var(--apt-color-brand-primary)); color: var(--apt-action-on-primary); border-color: var(--apt-module-accent, var(--apt-color-brand-primary)); }
    .pilot-btn--primary:hover { background: color-mix(in srgb, var(--apt-color-brand-primary) 90%, var(--apt-surface-default)); }

    .pilot-outcome-input { flex: 1; min-width: 200px; padding: var(--apt-spacing-s3) var(--apt-spacing-s5); border-radius: var(--apt-radius-r1); border: 1px solid var(--apt-border); background: var(--apt-surface-raised); color: var(--apt-text-strong); font-size: var(--apt-font-size-body-sm); font-family: inherit; }
    .pilot-outcome-input:focus { outline: none; border-color: var(--apt-module-accent); }

    .pilot-delivered { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-success); }

    .pilot-section { padding: var(--apt-spacing-s6); border-radius: var(--apt-radius-r2); border: 1px solid var(--apt-border); background: var(--apt-surface-page); margin-bottom: var(--apt-spacing-s8); }
    .pilot-section-title { font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.05em; color: var(--apt-text-muted); margin: 0 0 var(--apt-spacing-s4); }

    .chain { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-spacing-s4); }
    .chain-step { display: flex; flex-wrap: wrap; gap: var(--apt-spacing-s3); align-items: baseline; padding: var(--apt-spacing-s3); border: 1px solid var(--apt-border-faint); border-radius: var(--apt-radius-r1); color: var(--apt-text-muted); }
    .chain-step.is-live { border-color: var(--apt-module-accent); background: var(--apt-surface-raised); }
    .chain-k { font-family: var(--apt-font-mono); font-size: var(--apt-font-size-micro); text-transform: uppercase; letter-spacing: 0.05em; color: var(--apt-text-muted); min-width: 96px; }
    .chain-v { font-size: var(--apt-font-size-body-sm); color: var(--apt-text-strong); }
    .chain-note { margin-left: auto; font-size: var(--apt-font-size-micro); color: var(--apt-text-muted); text-transform: capitalize; }

    .evidence-wrap { display: flex; flex-direction: column; gap: var(--apt-spacing-s5); }
    .evidence-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-spacing-s2); }
    .evidence-item { display: flex; justify-content: space-between; gap: var(--apt-spacing-s4); font-size: var(--apt-font-size-micro); padding: var(--apt-spacing-s2) var(--apt-spacing-s3); border: 1px solid var(--apt-border); border-radius: var(--apt-radius-r1); background: var(--apt-surface-raised); }
    .evidence-title { color: var(--apt-text-strong); }
    .evidence-layer { color: var(--apt-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

    .audit { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--apt-spacing-s2); }
    .audit-item { display: flex; justify-content: space-between; gap: var(--apt-spacing-s4); font-size: var(--apt-font-size-micro); padding: var(--apt-spacing-s2) var(--apt-spacing-s3); border: 1px solid var(--apt-border-faint); border-radius: var(--apt-radius-r1); background: var(--apt-surface-default); }
    .audit-action { font-family: var(--apt-font-mono); color: var(--apt-text-body); }
    .audit-time { font-family: var(--apt-font-mono); color: var(--apt-text-muted); }

    .pilot-empty { text-align: center; padding: var(--apt-spacing-s16); color: var(--apt-text-muted); display: flex; flex-direction: column; gap: var(--apt-spacing-s4); align-items: center; }

    @media (max-width: 760px) {
      .pilot-page { padding: var(--apt-spacing-s8); }
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
  private readonly pilot_ = signal<OperationalPilot | undefined>(undefined);
  private readonly outcomeText = signal('');

  readonly journey = this.journey_;
  readonly pilot = this.pilot_;
  readonly actorRole: EvidenceActorRole = 'coordinator';

  constructor() {
    this.needId = this.route.snapshot.paramMap.get('pilot') ?? '';
    this.journey_.set(this.service.journey(this.needId));
    this.pilot_.set(this.service.pilot(this.needId));
  }

  readonly evidence = computed(() => {
    const j = this.journey_();
    const ids = j?.outcomes[0]?.evidenceIds ?? [];
    const catalog = this.pilot_()?.evidence ?? [];
    return ids.map((id) => {
      const found = catalog.find((e) => e.id === id);
      return { id, title: found?.title ?? id, layer: found?.layer ?? 'unknown' };
    });
  });

  readonly evidenceStanding = computed(() => {
    const j = this.journey_();
    const hasOutcome = j?.outcomes.length ?? 0 > 0;
    return hasOutcome ? 'reported' : 'unassessed';
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
    const provider = this.pilot_()?.institution.coordinatorId ?? 'provider';
    this.service.acceptNeed(this.needId, provider);
    this.journey_.set(this.service.journey(this.needId));
  }

  fulfil(): void {
    const commitmentId = this.journey_()?.commitments[0]?.id;
    if (!commitmentId) return;
    const fallback = this.pilot_()?.deliverables.join(' · ') ?? 'Delivered';
    const outcome = this.outcomeText().trim() || fallback;
    const evidenceIds = this.pilot_()?.evidence.map((e) => e.id);
    this.service.fulfilNeed(commitmentId, outcome, evidenceIds);
    this.journey_.set(this.service.journey(this.needId));
  }

  onEvidenceTransition(t: { from: string; to: string; reason: string; evidenceIds: string[] }): void {
    console.group('Evidence standing transition');
    console.log('Transition:', t);
    console.groupEnd();
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
