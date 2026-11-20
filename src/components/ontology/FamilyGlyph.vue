<script setup lang="ts">
/**
 * FamilyGlyph — one vector glyph per ontology family.
 * Geometric marks only; no pictorial illustration, no emoji.
 * Colour comes from the caller via currentColor.
 */
import type { Family } from '@/lib/ontology';

defineProps<{ family: Family }>();

const PATHS: Record<string, string> = {
  // Actor — a node with three spokes: identity defined by relation
  ACTOR: 'M12 4.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm0 6.5c3 0 5.5 1.6 5.5 3.6V19h-11v-4.4C6.5 12.6 9 11 12 11Z',
  // Capability — an aperture: capacity opened to a direction
  CAPABILITY: 'M12 3.5 19 8v8l-7 4.5L5 16V8l7-4.5Zm0 4.2L9 9.4v5.2l3 1.9 3-1.9V9.4l-3-1.7Z',
  // Resource — a stacked vessel
  RESOURCE: 'M4 6h16v3H4V6Zm2 5h12v3H6v-3Zm2.5 5h7v3h-7v-3Z',
  // Place — a horizon line with a marker
  PLACE: 'M3 17h18v2H3v-2Zm4-6h2v6H7v-6Zm8 3h2v3h-2v-3Zm-4-6h2v9h-2V8Z',
  // Intention — an open bracket, nothing yet enclosed
  INTENTION: 'M9 3.5h2v17H9v-17Zm5 3h4v2h-4v-2Zm0 4.5h6v2h-6v-2Zm0 4.5h4v2h-4v-2Z',
  // Commitment — two strands bound
  COMMITMENT: 'M4 7h7v2H4V7Zm9 8h7v2h-7v-2ZM8 5c4 0 4 6 8 6M16 19c-4 0-4-6-8-6',
  // Work — an interlocking joint
  WORK: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM9.5 9.5h5v5h-5v-5ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  // Activity — a pulse trace
  ACTIVITY: 'M2 12h4l2-5 3 10 3-7 2 2h6',
  // Output & Outcome — one mark entered, one mark left
  OUTPUT_OUTCOME: 'M4 5h8v2H4V5Zm0 6h8v2H4v-2Zm0 6h8v2H4v-2Zm12-9 4 4-4 4v-3h-3v-2h3V8Z',
  // Exchange — two arrows crossing
  EXCHANGE: 'M4 8h13V5l3 4-3 4v-3H4V8Zm16 8H7v-3l-3 4 3 4v-3h13v-2Z',
  // Evidence — a seal with an inner mark
  EVIDENCE: 'M12 3.2l2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.4-4.6 2.4.9-5.2L4.5 8.7l5.2-.8L12 3.2Zm0 5.4-1.2 2.4-2.6.4 1.9 1.9-.4 2.6 2.3-1.2 2.3 1.2-.4-2.6 1.9-1.9-2.6-.4L12 8.6Z',
  // Knowledge — concentric rings, accumulated outward
  KNOWLEDGE: 'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 2.4a5.6 5.6 0 1 0 0 11.2 5.6 5.6 0 0 0 0-11.2Zm0 2.4a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4Z',
  // Governance — a column with a capital, standing
  GOVERNANCE: 'M5 4h14v2H5V4Zm1 4h2v9H6V8Zm5 0h2v9h-2V8Zm5 0h2v9h-2V8ZM4 19h16v2H4v-2Z',
};

const path = (family: Family) => PATHS[family] ?? PATHS.ACTOR;
</script>

<template>
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path :d="path(family)" />
  </svg>
</template>

<style scoped>
svg {
  width: 16px;
  height: 16px;
  flex: none;
  display: block;
}
</style>