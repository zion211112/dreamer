/**
 * APT-LABS Design Tokens — Docker Desktop Exact
 *
 * Synthesis: Docker Desktop's visual design system +
 * APT-LABS' evidence-based infrastructure framework +
 * Editorial precision
 *
 * This token set aims to replicate Docker Desktop's exact visual language
 * while adapting it to APT-LABS' specific needs for evidence display and
 * institutional infrastructure messaging.
 *
 * Source: Extracted from Docker.com and Docker Desktop UI (via Raphael Bouchard's
 * Docker Design System documentation and live site inspection)
 */

export const tokens = {
  /* ──────────────────────────────────────────────────────────────
     COLOR — Docker Desktop Exact Palette
     ────────────────────────────────────────────────────────────── */

  color: {
    /* Neutral spine — extracted from Docker's UI */
    neutral: {
      50:  '#f8fafc',   // background - very light gray (from Docker's UI)
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',   // muted text
      500: '#64748b',   // secondary text
      600: '#475569',   // body text
      700: '#334155',   // heading text
      800: '#1e293b',   // dark text
      900: '#0f172a',   // darkest text
      950: '#020617',   // for deep shadows (rarely used)
    },

    /* Accent — Docker's brand blue
       From brand guidelines: Ocean Blue, Light Blue, Deep Blue */
    accent: {
      50:  '#eff6ff',   // Light Blue tint
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',   // Ocean Blue (primary)
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',   // Deep Blue
    },

    /* Docker's exact palette from inspiration/live site */
    docker: {
      dominant:   '#ea1013',   // red-orange (used for accents, buttons?)
      surface:    '#04123f',   // dark navy blue (backgrounds, panels)
      ink:        '#6992fb',   // bright blue (text, icons, primary actions)
      accent:     '#5f6584',   // muted purple (secondary accents)
      detail:     '#b2b8c4',   // light gray (borders, subtle elements)
    },

    /* Evidence states — temperature scale (adapted to Docker's aesthetic) */
    evidence: {
      VERIFIED:   { bg: '#dcfce7', fg: '#166534', border: '#bbf7d0' },   // emerald (green)
      PROTOTYPE:  { bg: '#fffbeb', fg: '#92400e', border: '#fde68a' },   // amber (yellow/orange)
      TARGET:     { bg: '#dbeafe', fg: '#1d4ed8', border: '#bfdbfe' },   // blue (Docker blue)
      PLANNED:    { bg: '#f5f3ff', fg: '#6d28d9', border: '#ddd6fe' },   // violet (purple)
      UNKNOWN:    { bg: '#f9fafb', fg: '#64748b', border: '#e2e8f0' },   // light gray
    },

    /* Semantic — functional, not decorative */
    semantic: {
      success:   '#166534',
      warning:   '#92400e',
      error:     '#dc2626',
      focus:     '#3b82f6',  // accent-500
    },

    /* Surface layering — depth through subtle shadows */
    surface: {
      page:      'neutral.50',
      card:      'neutral.100',
      elevated:  '#ffffff',
      overlay:   'rgba(15, 23, 42, 0.5)',
    },

    /* Signal system — for data visualization (using Docker's ink/accent) */
    signal: {
      network:   'docker.ink',
      networkGlow: 'rgba(105, 146, 251, 0.2)',
      identity:  'docker.accent',
      identityGlow: 'rgba(95, 101, 132, 0.2)',
      treasury:  'docker.dominant',
      treasuryGlow: 'rgba(234, 16, 19, 0.2)',
    },
  },

  /* ──────────────────────────────────────────────────────────────
     TYPOGRAPHY — Docker Desktop Exact
     ────────────────────────────────────────────────────────────── */

  typography: {
    /* Display: Repro (Docker's heading font) */
    display: {
      fontFamily: '"Repro", "Georgia", serif',
      fontWeight: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: 1.05, snug: 1.15, normal: 1.25 },
      letterSpacing: { tight: '-0.03em', normal: '-0.015em', wide: '0.01em' },
    },

    /* UI: Inter (Docker's body/font interface font) */
    ui: {
      fontFamily: '"Inter", "IBM Plex Sans", system-ui, sans-serif',
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

    /* Scale — from Docker's type ramp (converted to rem) */
    scale: {
      xs:      '0.75rem',    // 12px (but Docker uses 16px base, so we'll adjust)
      sm:      '0.875rem',   // 14px
      base:    '1rem',       // 16px (Docker body size)
      lg:      '1.25rem',    // 20px
      xl:      '1.5rem',     // 24px
      '2xl':   '1.75rem',    // 28px
      '3xl':   '2rem',       // 32px
      '4xl':   '2.5rem',     // 40px
      '5xl':   '3rem',       // 48px
      '6xl':   '3.5rem',     // 56px
      '7xl':   '4rem',       // 64px
    },
    /* Docker-specific sizes from their type ramp */
    sizes: {
      h1:      '3.1875rem',  // 51px
      h2:      '4rem',       // 64px
      h3:      '1.375rem',   // 22px
      body:    '1rem',       // 16px
      button:  '1rem',       // 16px
    },
  },

  /* ──────────────────────────────────────────────────────────────
     SPACING — Docker's 8px base unit
     ────────────────────────────────────────────────────────────── */

  spacing: {
    0:   '0',
    1:   '0.5rem',   // 8px  (Docker's base unit)
    2:   '1rem',     // 16px
    3:   '1.25rem',  // 20px
    4:   '1.75rem',  // 28px
    5:   '2.5rem',   // 40px
    6:   '3rem',     // 48px
    8:   '4rem',     // 64px
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
    /* Docker's max content width from inspiration */
    wide:    '1160px',
    prose:   '65ch',     // optimal reading width
    narrow:  '48ch',     // tight columns
  },

  /* ──────────────────────────────────────────────────────────────
     BORDER RADIUS — Docker's radius scale
     ────────────────────────────────────────────────────────────── */

  radius: {
    none:   '0',
    sm:     '0.25rem',   // 4px
    base:   '0.5rem',    // 8px
    md:     '1rem',      // 16px
    lg:     '1.125rem',  // 18px
    xl:     '2rem',      // 32px
    '2xl':  '3rem',      // 48px
    full:   '9999px',
  },

  /* ──────────────────────────────────────────────────────────────
     SHADOWS — Subtle, purposeful elevation (Docker-style)
     ────────────────────────────────────────────────────────────── */

  shadow: {
    none:  'none',
    xs:    '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
    sm:    '0 2px 4px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.12)',
    base:  '0 4px 8px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)',
    md:    '0 8px 16px rgba(0,0,0,0.12), 0 4px 6px rgba(0,0,0,0.08)',
    lg:    '0 16px 32px rgba(0,0,0,0.14), 0 8px 12px rgba(0,0,0,0.05)',
    xl:    '0 24px 48px rgba(0,0,0,0.16), 0 12px 16px rgba(0,0,0,0.02)',
    inner: 'inset 0 2px 4px rgba(0,0,0,0.06)',
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
};

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