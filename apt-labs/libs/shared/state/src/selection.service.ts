/**
 * @apt-labs/shared/state — SelectionService
 *
 * Tracks the currently selected entity across the shell for context-preserving
 * navigation. When a user selects an entity in any view (Network, Workbench,
 * Records, Inspector), the inspector opens with that entity's context and the
 * selection is preserved across route changes within the workspace.
 *
 * Framework-free: plain signals, no @angular/* reactivity dependencies beyond
 * the signal primitive itself.
 */
import { Injectable, signal, computed } from '@angular/core';

export interface SelectedEntity {
  id: string;
  name: string;
  family: string;
  type: string;
  standing?: string;
  maturity?: string;
  relationships?: Array<{
    kind: string;
    target: string;
    sourceRole?: string;
    targetRole?: string;
  }>;
  cycleStage?: string;
  authorityGated?: boolean;
  source: 'network' | 'workbench' | 'records' | 'inspector' | 'ontology';
}

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private readonly selected_ = signal<SelectedEntity | null>(null);
  private readonly history_ = signal<SelectedEntity[]>([]);

  readonly selected = this.selected_;
  readonly history = this.history_;
  readonly hasSelection = computed(() => this.selected_() !== null);

  /** Select an entity, pushing the previous selection onto the history stack. */
  select(entity: Omit<SelectedEntity, 'source'> & { source?: SelectedEntity['source'] }): void {
    const prev = this.selected_();
    if (prev) {
      this.history_.update((h) => [...h.slice(-9), prev]); // keep last 10
    }
    this.selected_.set({ ...entity, source: entity.source ?? 'workbench' });
  }

  /** Navigate back to the previous selection (context-preserving back). */
  back(): SelectedEntity | null {
    const hist = this.history_();
    if (hist.length === 0) return null;
    const prev = hist[hist.length - 1];
    this.history_.set(hist.slice(0, -1));
    this.selected_.set(prev);
    return prev;
  }

  /** Clear the selection and close the inspector. */
  clear(): void {
    this.selected_.set(null);
    this.history_.set([]);
  }

  /** Get the full breadcrumb path from root to current selection. */
  breadcrumb(): SelectedEntity[] {
    return this.history_().concat(this.selected_() ?? []);
  }
}
