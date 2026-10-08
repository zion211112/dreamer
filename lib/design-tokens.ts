/**
 * APT-LABS Design Tokens — Visionary 2050 Surface
 *
 * Synthesis: Dashboard's sovereign cyber-infrastructure aesthetic +
 * Current system's editorial precision + Evidence-based constraints
 *
 * Principles:
 *   - Sovereignty through visual authority (dark mode with purposeful glow)
 *   - Craft through mathematical harmony (2^(1/4) scale, 4px grid)
 *   - Evidence through temperature-coded states (never decorative)
 *   - Intelligence through data visualization (not decoration)
 *   - Future through present execution (no fake futures)
 */

export const tokens = {
  /* ──────────────────────────────────────────────────────────────
     COLOR — Sovereign dark mode with functional glow
     ────────────────────────────────────────────────────────────── */

  color: {
    /* Void spine — true black foundation with subtle warmth */
    neutral: {
      50:  '#FAF9F7',   // only for light-mode fallbacks
      100: '#F3F1ED',
      200: '#E8E4DC',
      300: '#D4CEC3',
      400: '#A8A090',   // muted text on dark
      500: '#857C6A',   // secondary text on dark
      600: '#6B6354',   // body text on dark
      700: '#4D463A',   // heading text on dark
      800: '#342F26',   // elevated surface
      900: '#1A1815',   // card surface
      950: '#0D0C0A',   // page background (void)
      975: '#060605',   // deepest void
    },

    /* Accent — oxidized copper / burnt umber
       Conveys: permanence, patina, infrastructure that ages well */
    accent: {
      50:  '#FDF8F3',
      100: '#F9EDE3',
      200: '#F0D5BF',
      300: '#E4B88F',
      400: '#D6965E',
      500: '#C4783A',   // primary — the sovereign signal
      600: '#A6602E',   // hover/active
      700: '#844D26',
      800: '#673D22',
      900: '#53321E',
      950: '#3D2515',   // deepest copper
    },

    /* Cyan/Teal — Network/Infrastructure signal (from dashboard) */
    cyan: {
      50:  '#F0FDFA',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',   // primary cyan
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',
      950: '#042F2E',
      glow:  'rgba(20, 184, 166, 0.4)',
      glowStrong: 'rgba(20, 184, 166, 0/7)',
    },

    /* Purple/Indigo — Identity/Governance signal (from dashboard) */
    violet: {
      50:  '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#A855F7',   // primary violet
      600: '#9333EA',
      700: '#7E22CE',
      800: '#6B21A8',
      900: '#581C87',
      950: '#3B0764',
      glow:  'rgba(168, 85, 247, 0.4)',
      glowStrong: 'rgba(168, 85, 247, 0.7)',
    },

    /* Amber/Gold — Treasury/Allocation signal (from dashboard) */
    amber: {
      50:  '#FFFDF5',
      100: '#FEF9E7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',   // primary amber
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03',
      glow:  'rgba(245, 158, 11, 0.4)',
      glowStrong: 'rgba(245, 158, 11, 0.7)',
    },

    /* Evidence states — temperature scale (check-contrast.mjs compliant) */
    evidence: {
      VERIFIED:   { bg: 'rgba(16, 185, 129, 0.12)', fg: '#10B981', border: 'rgba(16, 185, 129, 0.3)', glow: 'rgba(16, 185, 129, 0.25)' },   // emerald
      PROTOTYPE:  { bg: 'rgba(245, 158, 11, 0.12)', fg: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)', glow: 'rgba(245, 158, 11, 0.25)' },   // amber
      TARGET:     { bg: 'rgba(59, 130, 246, 0.12)', fg: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)', glow: 'rgba(59, 130, 246, 0.25)' },    // blue
      PLANNED:    { bg: 'rgba(124, 58, 237, 0.12)', fg: '#7C3AED', border: 'rgba(124, 58, 237, 0.3)', glow: 'rgba(124, 58, 237, 0.25)' },    // violet
      UNKNOWN:    { bg: 'rgba(107, 114, 128, 0.12)', fg: '#6B7280', border: 'rgba(107, 114, 128, 0.3)', glow: 'rgba(107, 114, 128, 0.25)' },  // warm gray
    },

    /* Semantic — functional, not decorative */
    semantic: {
      success:   '#10B981',
      warning:   '#F59E0B',
      error:     '#EF4444',
      focus:     '#C4783A',  // accent-500
    },

    /* Surface layering — depth through opacity, not shadows alone */
    surface: {
      page:      'neutral.975',
      card:      'neutral.900',
      elevated:  'neutral.800',
      overlay:   'rgba(10, 10, 10, 0.85)',
      glass:     'rgba(26, 24, 21, 0.7)',
      glassStrong: 'rgba(26, 24, 21, 0.9)',
      border:    'rgba(168, 160, 144, 0.08)',
      borderStrong: 'rgba(168, 160, 144, 0.15)',
    },

    /* Signal system — for data visualization */
    signal: {
      network:   'cyan.500',
      networkGlow: 'cyan.glow',
      identity:  'violet.500',
      identityGlow: 'violet.glow',
      treasury:  'amber.500',
      treasuryGlow: 'amber.glow',
    },
  },

  /* ──────────────────────────────────────────────────────────────
     TYPOGRAPHY — Editorial authority, not UI kit
     ────────────────────────────────────────────────────────────── */

  typography: {
    /* Display: Sharp, distinctive serif for headlines
       "Sovereign" — editorial weight, not marketing fluff */
    display: {
      fontFamily: '"Fraunces", "Georgia", serif',
      fontWeight: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: 1.05, snug: 1.15, normal: 1.25 },
      letterSpacing: { tight: '-0.03em', normal: '-0.015em', wide: '0.01em' },
    },

    /* UI: Clean, highly legible sans for interface
       "Operational" — precise, not expressive */
    ui: {
      fontFamily: '"IBM Plex Sans", "Inter", system-ui, sans-serif',
      fontWeight: { regular: 400, medium: 500, semibold: 600 },
      lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.7 },
      letterSpacing: { tight: '-0.01em', normal: '0', wide: '0.02em' },
    },

    /* Mono: For evidence IDs, hashes, technical artifacts */
    mono: {
      fontFamily: '"IBM Plex Mono", "JetBrains Mono", "Fira Code", monospace',
      fontWeight: { regular: 400, medium: 500 },
      lineHeight: 1.6,
      letterSpacing: '0',
    },

    /* Scale — modular, derived from 2^(1/4) */
    scale: {
      xs:      '0.594375rem',    // 9.51px
      sm:      '0.706875rem',    // 11.31px
      base:    '1rem',           // 16px
      lg:      '1.189207115002721rem', // 19.03px
      xl:      '1.4157894736842105rem', // 22.63px
      '2xl':   '1.6835643564356436rem', // 26.91px
      '3xl':   '2.0025316455696203rem', // 32px
      '4xl':   '2.381443298969073rem',  // 38.05px
      '5xl':   '2.830508474576271rem',  // 45.25px
      '6xl':   '3.362817790360169rem',  // 53.82px
      '7xl':   '4.0050632911392406rem', // 64px
    },
  },

  /* ──────────────────────────────────────────────────────────────
     SPACING — 4px base, harmonious scale
     ────────────────────────────────────────────────────────────── */

  spacing: {
    0:   '0',
    1:   '0.25rem',   // 4px
    2:   '0.5rem',    // 8px
    3:   '0.75rem',   // 12px
    4:   '1rem',      // 16px
    5:   '1.25rem',   // 20px
    6:   '1.5rem',    // 24px
    8:   '2rem',      // 32px
    10:  '2.5rem',    // 40px
    12:  '3rem',      // 48px
    16:  '4rem',      // 64px
    20:  '5rem',      // 80px
    24:  '6rem',      // 96px
    32:  '8rem',      // 128px
  },

  /* ──────────────────────────────────────────────────────────────
     SIZING — Container widths, max widths
     ────────────────────────────────────────────────────────────── */

  sizing: {
    container: {
      sm:  '640px',
      md:  '768px',
      lg:  '1024px',
      xl:  '1280px',
      '2xl': '1440px',
      full: '100%',
    },
    prose: '65ch',     // optimal reading width
    narrow: '48ch',    // tight columns
  },

  /* ──────────────────────────────────────────────────────────────
     BORDER RADIUS — Restrained, architectural
     ────────────────────────────────────────────────────────────── */

  radius: {
    none:   '0',
    sm:     '2px',
    base:   '4px',
    md:     '8px',
    lg:     '12px',
    xl:     '16px',
    '2xl':  '24px',
    full:   '9999px',
  },

  /* ──────────────────────────────────────────────────────────────
     SHADOWS — Layered depth with glow support (dark mode)
     ────────────────────────────────────────────────────────────── */

  shadow: {
    none:  'none',
    xs:    '0 1px 2px rgba(0,0,0,0.3)',
    sm:    '0 2px 4px rgba(0,0,0,0.35)',
    base:  '0 4px 8px rgba(0,0,0,0.4)',
    md:    '0 8px 16px rgba(0,0,0,0.45)',
    lg:    '0 16px 32px rgba(0,0,0,0.5)',
    xl:    '0 24px 48px rgba(0,0,0,0.55)',
    inner: 'inset 0 2px 4px rgba(0,0,0,0.3)',
    /* Glow shadows for signal elements */
    glowSm:  '0 0 8px',
    glowMd:  '0 0 16px',
    glowLg:  '0 0 32px',
    glowXl:  '0 0 64px',
  },

  /* ──────────────────────────────────────────────────────────────
     TRANSITIONS — Precise, not bouncy
     ────────────────────────────────────────────────────────────── */

  transition: {
    fast:    '120ms cubic-bezier(0.4, 0, 0.2, 1)',
    base:    '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow:    '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower:  '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  /* ──────────────────────────────────────────────────────────────
     Z-INDEX — Explicit layering
     ────────────────────────────────────────────────────────────── */

  zIndex: {
    base:      0,
    dropdown:  100,
    sticky:    200,
    modal:     300,
    popover:   400,
    tooltip:   500,
    toast:     600,
  },

  /* ──────────────────────────────────────────────────────────────
     BREAKPOINTS
     ────────────────────────────────────────────────────────────── */

  breakpoint: {
    sm:  '640px',
    md:  '768px',
    lg:  '1024px',
    xl:  '1280px',
    '2xl': '1440px',
  },
} as const;

/* Type helpers */
export type ColorScale = keyof typeof tokens.color.neutral;
export type EvidenceState = keyof typeof tokens.color.evidence;
export type FontFamily = 'display' | 'ui' | 'mono';
export type Spacing = keyof typeof tokens.spacing;
export type FontSize = keyof typeof tokens.typography.scale;
export type Radius = keyof typeof tokens.radius;
export type Shadow = keyof typeof tokens.shadow;
export type Transition = keyof typeof tokens.transition;
export type ZIndex = keyof typeof tokens.zIndex;