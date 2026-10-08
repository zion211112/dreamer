/**
 * APT-LABS Design Tokens — Docker-Inspired Light Mode
 *
 * Synthesis: Docker's clean, professional aesthetic +
 * APT-LABS' editorial precision + Evidence-based constraints
 *
 * Principles:
 *   - Clarity through generous whitespace and clear hierarchy
 *   - Trust through professional, restrained aesthetics
 *   - Evidence through temperature-coded states (never decorative)
 *   - Precision through mathematical harmony (2^(1/4) scale, 4px grid)
 */

export const tokens = {
  /* ──────────────────────────────────────────────────────────────
     COLOR — Clean light mode with Docker-inspired blue
     ────────────────────────────────────────────────────────────── */

  color: {
    /* Neutral spine — light gray foundation */
    neutral: {
      50:  '#f8fafc',   // background
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

    /* Accent — Docker blue
       Conveys: trust, reliability, professionalism */
    accent: {
      50:  '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',   // primary — Docker blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },

    /* Cyan/Teal — Network/Infrastructure signal (from dashboard) */
    cyan: {
      50:  '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',   // primary cyan
      600: '#0891b2',
      700: '#0e7a90',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
      glow:  'rgba(6, 182, 212, 0.2)',
      glowStrong: 'rgba(6, 182, 212, 0.4)',
    },

    /* Purple/Indigo — Identity/Governance signal (from dashboard) */
    violet: {
      50:  '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',   // primary violet
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
      glow:  'rgba(139, 92, 246, 0.2)',
      glowStrong: 'rgba(139, 92, 246, 0.4)',
    },

    /* Amber/Gold — Treasury/Allocation signal (from dashboard) */
    amber: {
      50:  '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',   // primary amber
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
      glow:  'rgba(245, 158, 11, 0.2)',
      glowStrong: 'rgba(245, 158, 11, 0.4)',
    },

    /* Evidence states — temperature scale (light mode adapted) */
    evidence: {
      VERIFIED:   { bg: '#dcfce7', fg: '#166534', border: '#bbf7d0' },   // emerald
      PROTOTYPE:  { bg: '#fffbeb', fg: '#92400e', border: '#fde68a' },   // amber
      TARGET:     { bg: '#dbeafe', fg: '#1d4ed8', border: '#bfdbfe' },   // blue
      PLANNED:    { bg: '#f5f3ff', fg: '#6d28d9', border: '#ddd6fe' },   // violet
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
     SHADOWS — Subtle, purposeful elevation
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