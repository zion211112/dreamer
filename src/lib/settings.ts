/**
 * APT-LABS — Workspace settings (local-first).
 *
 * A reactive, persisted settings object for this browser only. No server,
 * no account: `aptlabs.workspace.settings` in localStorage. Every field
 * has a safe default; unknown or corrupted stored data falls back to
 * defaults field-by-field.
 */
import { reactive, watch } from 'vue';

export type Density = 'comfortable' | 'compact';

export interface WorkspaceSettings {
  /** Show the cross-module FlowRail on module pages. */
  showFlowRail: boolean;
  /** Shell density: comfortable (54px topbar) or compact. */
  density: Density;
  /** Open the Agent dock automatically when the shell mounts. */
  openDockOnStart: boolean;
}

const KEY = 'aptlabs.workspace.settings';

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  showFlowRail: true,
  density: 'comfortable',
  openDockOnStart: false,
};

function load(): WorkspaceSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<WorkspaceSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Reactive settings shared across the shell and its components. */
export const settings: WorkspaceSettings = reactive(load());

export function updateSettings(patch: Partial<WorkspaceSettings>): void {
  Object.assign(settings, patch);
}

// Persist on every change.
watch(
  settings,
  (val) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(val));
    } catch {
      /* storage unavailable (private mode) — settings stay in memory */
    }
  },
  { deep: true },
);

// Keep other tabs in sync.
window.addEventListener('storage', (e) => {
  if (e.key !== KEY || !e.newValue) return;
  try {
    Object.assign(settings, { ...DEFAULT_SETTINGS, ...JSON.parse(e.newValue) });
  } catch {
    /* ignore malformed cross-tab payloads */
  }
});
