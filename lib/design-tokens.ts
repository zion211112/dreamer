/**
 * APT-LABS Design Tokens — Masterpiece Commercial Surface
 *
 * A distinctive, authoritative visual language for institutional infrastructure.
 * No generic tech aesthetics. No dashboard metaphors.
 * Every token is a deliberate choice that reinforces:
 *   - Sovereignty (local ownership, not cloud dependency)
 *   - Craft (built to last, not shipped to iterate)
 *   - Evidence (claims carry proof, not promise)
 */

export const tokens = {
  /* ──────────────────────────────────────────────────────────────
     COLOR — A restrained palette with one authoritative accent
     ────────────────────────────────────────────────────────────── */

  color: {
    /* Neutral spine — warm gray with subtle brown undertone */
    neutral: {
      50:  '#FAF9F7',   // page background
      100: '#F3F1ED',   // card background
      200: '#E8E4DC',   // subtle borders
      300: '#D4CEC3',   // dividers
      400: '#A8A090',   // muted text
      500: '#857C6A',   // secondary text
      600: '#6B6354',   // body text
      700: '#4D463A',   // heading text
      800: '#342F26',   // near-black
      900: '#1E1B16',   // true black (avoid pure #000)
      950: '#0F0D0A',   // deepest shadow
    },

    /* Accent — burnt umber / oxidized copper
       Conveys: permanence, patina, infrastructure that ages well */
    accent: {
      50:  '#FDF8F3',
      100: '#F9EDE3',
      200: '#F0D5BF',
      300: '#E4B88F',
      400: '#D6965E',
      500: '#C4783A',   // primary accent
      600: '#A6602E',   // hover/active
      700: '#844D26',
      800: '#673D22',
      900: '#53321E',
    },

    /* Evidence states — mapped to temperature scale (check-contrast.mjs) */
    evidence: {
      VERIFIED:   { bg: '#E8F5E9', fg: '#1B5E20', border: '#A5D6A7' },   // cool green
      PROTOTYPE:  { bg: '#FFF3E0', fg: '#E65100', border: '#FFB74D' },   // warm amber
      TARGET:     { bg: '#E3F2FD', fg: '#0D47A1', border: '#90CAF9' },   // cool blue
      PLANNED:    { bg: '#F3E5F5', fg: '#4A148C', border: '#CE93D8' },   // violet
      UNKNOWN:    { bg: '#FAFAFA', fg: '#616161', border: '#BDBDBD' },   // neutral gray
    },

    /* Semantic */
    semantic: {
      success:   '#2E7D32',
      warning:   '#F57F17',
      error:     '#C62828',
      focus:     '#C4783A',  // accent-500
    },

    /* Surface layering */
    surface: {
      page:      'neutral.50',
      card:      'neutral.100',
      elevated:  '#FFFFFF',
      overlay:   'rgba(30, 27, 22, 0.6)',
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

    /* Scale — modular, derived from 1.25 (major third) */
    scale: {
      xs:      '0.75rem',    // 12px
      sm:      '0.875rem',   // 14px
      base:    '1rem',       // 16px
      lg:      '1.125rem',   // 18px
      xl:      '1.25rem',    // 20px
      '2xl':   '1.563rem',   // 25px
      '3xl':   '1.953rem',   // 31px
      '4xl':   '2.441rem',   // 39px
      '5xl':   '3.052rem',   // 49px
      '6xl':   '3.815rem',   // 61px
      '7xl':   '4.768rem',   // 76px
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
     SHADOWS — Layered depth, not floaty cards
     ────────────────────────────────────────────────────────────── */

  shadow: {
    none:  'none',
    xs:    '0 1px 2px rgba(30,27,22,0.04)',
    sm:    '0 2px 4px rgba(30,27,22,0.06)',
    base:  '0 4px 8px rgba(30,27,22,0.08)',
    md:    '0 8px 16px rgba(30,27,22,0.10)',
    lg:    '0 16px 32px rgba(30,27,22,0.12)',
    xl:    '0 24px 48px rgba(30,27,22,0.14)',
    inner: 'inset 0 2px 4px rgba(30,27,22,0.06)',
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