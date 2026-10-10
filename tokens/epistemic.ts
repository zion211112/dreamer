/**
 * APT-LABS Epistemic Tokens — Single Source of Truth
 *
 * The epistemic framework IS the design system.
 * Every token serves the epistemics; nothing serves aesthetics.
 */

export const epistemicTokens = {
  // ══════════════════════════════════════════════════════════════════
  // SUBSTRATE — Near-black that absorbs unearned light
  // ══════════════════════════════════════════════════════════════════

  void: '#020408',        // Page background — warm near-black
  panel: '#060a12',       // Raised surfaces
  edge: '#0a101a',        // Hairlines, borders

  // ══════════════════════════════════════════════════════════════════
  // EMISSION — The ONLY interactive colour
  // ══════════════════════════════════════════════════════════════════

  emission: {
    base: '#14e8b8',        // Teal-jade — "this has evidence"
    dim: '#0fa882',         // Hover dim
    lit: '#5ff0d0',         // Active/focus bright
    a08: 'rgba(20, 232, 184, 0.08)',   // Subtle glow
    a15: 'rgba(20, 232, 184, 0.15)',   // Soft glow
    a30: 'rgba(20, 232, 184, 0.30)',   // Medium glow
  },

  // ══════════════════════════════════════════════════════════════════
  // INFORMATIONAL — Never interactive. Warm outlier (amber) + clash (red)
  // ══════════════════════════════════════════════════════════════════

  informational: {
    target: '#efb429',      // Amber — TARGET state, intended/unmeasured
    targetDim: 'rgba(239, 180, 41, 0.15)',
    clash: '#ef4444',       // Red — CONTRADICTION, guard failure
    clashDim: 'rgba(239, 68, 68, 0.15)',
  },

  // ══════════════════════════════════════════════════════════════════
  // INK LADDER — 4 tiers only. Strict luminance ladder.
  // ══════════════════════════════════════════════════════════════════

  ink: {
    ink: '#f1f5f9',   // Primary text
    dust: '#94a3b8',  // Secondary text
    ash: '#64748b',   // Muted text
    quiet: '#475569', // Lowest visible text
  },

  // ══════════════════════════════════════════════════════════════════
  // EVIDENCE STATES — Luminance-ordered, enforced by design
  // Critical invariant: L(UNKNOWN) < L(PLANNED) < L(TARGET) < L(VERIFIED) < L(PROTOTYPE)
  // ══════════════════════════════════════════════════════════════════

  evidence: {
    UNKNOWN:    { bg: '#1e293b', fg: '#475569', border: '#334155', emit: false, hairline: 'none' },
    PLANNED:    { bg: '#1e293b', fg: '#64748b', border: '#475569', emit: false, hairline: 'top' },
    TARGET:     { bg: '#1e293b', fg: '#efb429', border: '#efb429', emit: true, hairline: 'both' },  // Warm outlier (R/B > 1.25)
    VERIFIED:   { bg: '#020408', fg: '#14e8b8', border: '#14e8b8', emit: true, hairline: 'none' },
    PROTOTYPE:  { bg: '#020408', fg: '#f1f5f9', border: '#f1f5f9', emit: true, hairline: 'none', interactive: false },
  },

  // ══════════════════════════════════════════════════════════════════
  // TYPE — Single constant ratio: 2^(1/4)
  // ══════════════════════════════════════════════════════════════════

  type: {
    rSize: 1.189207115002721,  // 2^(1/4)
    rTrack: -0.0125,
    base: 16,
    caps: 0.08,
    ladder: [
      { name: 'micro',  size: 9.51,   ls:  0.0065 },
      { name: 'label',  size: 11.31,  ls:  0.00433 },
      { name: 'ui',     size: 13.45,  ls:  0.00217 },
      { name: 'body',   size: 16,     ls:  0 },
      { name: 'lead',   size: 19.03,  ls: -0.00217 },
      { name: 'h3',     size: 22.63,  ls: -0.00433 },
      { name: 'h2',     size: 26.91,  ls: -0.0065 },
      { name: 'h1',     size: 32,     ls: -0.00866 },
      { name: 'figure', size: 38.05,  ls: -0.01083 },
      { name: 'display',size: 45.25,  ls: -0.013 },
    ],
    hero: { clamp: 'clamp(2.8284rem, 1.15rem + 7.6vw, 11.3137rem)', bands: 4 },
  },

  // ══════════════════════════════════════════════════════════════════
  // SPACE — One constant: 8px base, 4px half-unit
  // ══════════════════════════════════════════════════════════════════

  space: { base: 8, half: 4, tokens: [4, 8, 16, 24, 32, 48, 64, 96, 128, 192] },

  // ══════════════════════════════════════════════════════════════════
  // MEASURE — Content widths
  // ══════════════════════════════════════════════════════════════════

  measure: { prose: '66ch', tight: '22ch', hero: '15ch' },

  // ══════════════════════════════════════════════════════════════════
  // FONTS — Self-hosted only
  // ══════════════════════════════════════════════════════════════════

  font: {
    sans: 'Inter',
    display: 'Space Grotesk',
    mono: 'JetBrains Mono',
  },

  // ══════════════════════════════════════════════════════════════════
  // MOTION — Atmospheric only, meaning in text
  // ══════════════════════════════════════════════════════════════════

  motion: {
    drift: '6s ease-in-out infinite',
    transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    reduced: '0.01ms',
  },

  // ══════════════════════════════════════════════════════════════════
  // Z-INDEX
  // ══════════════════════════════════════════════════════════════════

  z: { base: 0, plate: 10, guard: 100, trace: 200, modal: 300 },

  // ══════════════════════════════════════════════════════════════════
  // BREAKPOINTS — Arithmetic, not round numbers
  // ══════════════════════════════════════════════════════════════════

  bp: { rail: '1199px', strip: '1200px', canvas: '1400px' },
} as const;

// Type exports for consumers
export type EpistemicTokens = typeof epistemicTokens;
export type EvidenceState = keyof typeof epistemicTokens.evidence;
export type EmissionToken = keyof typeof epistemicTokens.emission;
export type InformationalToken = keyof typeof epistemicTokens.informational;
export type InkToken = keyof typeof epistemicTokens.ink;
export type TypeLadderStep = typeof epistemicTokens.type.ladder[number]['name'];
export type SpaceToken = typeof epistemicTokens.space.tokens[number];
export type FontFamily = keyof typeof epistemicTokens.font;