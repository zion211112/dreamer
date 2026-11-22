/**
 * APT-LABS — Workspace module icons (lean masterpiece).
 *
 * Stroke icons on a 24×24 grid (fill none, currentColor). Each is an abstract
 * mark, not a literal object: the overview is the chain itself, value is a coin,
 * proof is a shield. Consistent 1.5 stroke weight so the rail reads as one set.
 */
import type { IconId } from './registry'

export const MODULE_ICONS: Record<IconId, string> = {
  // Operational core — the chain entering the model.
  overview:
    '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><path d="M13 16.5h7M16.5 13v7"/>',
  // Commons/Network — inquiry pulse + actor constellation.
  'commons-network':
    '<path d="M3 12h4l3-8 4 16 3-8h4"/><circle cx="5.5" cy="6" r="2.2"/><circle cx="18.5" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/>',
  // Workbench — the work unit, a defined undertaking.
  workbench:
    '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 9.5h16M8 13h8M8 16h5"/>',
  // Records/Intelligence — layered memory + the model looking and matching.
  'records-intelligence':
    '<path d="M4.5 4.5h15v3.5h-15zM4.5 12h9.5v7.5H4.5zM17 12h2.5v7.5H17z"/><path d="M12 3.5 5.5 8v8l6.5 4.5L18.5 16V8z"/>',
  // Value — a coin: what circulates in the open.
  value: '<circle cx="12" cy="12" r="8.2"/><path d="M9.5 8.5v7M14.5 8.5v7M9.5 12h5"/>',
}

/** Render an icon. `size` in px; stroke width kept constant at 1.5. */
export function iconSvg(id: IconId, size = 20): string {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MODULE_ICONS[id]}</svg>`
}
