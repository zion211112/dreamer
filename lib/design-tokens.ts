/**
 * APT-LABS Design Tokens — Masterpiece Commercial Surface
 *
 * Synthesis of best-in-class SaaS design systems:
 * - Linear: dark-mode sophistication, opinionated craft
 * - Vercel Geist: typography excellence, variable fonts, technical precision
 * - Stripe: premium polish, gradients, elevated feel, motion awareness
 * - GitHub Primer: functional clarity, color as meaning, not decoration
 * - Ethos: human-centered, accessible, trust-focused
 *
 * This token set creates a distinctive, beautiful, and credible visual language
 * for institutional infrastructure software.
 */

export const tokens = {
  /* ──────────────────────────────────────────────────────────────
     COLOR — Sophisticated Dark Mode with Teal/Cyan Accent
     ────────────────────────────────────────────────────────────── */

  color: {
    /* Neutral Spine — Warm dark grays (Linear-inspired warmth) */
    neutral: {
      0:   '#ffffff',    // Pure white (for text on dark)
      50:  '#f8fafc',    // Lightest surface
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',    // Primary dark surface
      950: '#020617',    // Deepest background
    },

    /* Accent — Teal/Cyan (distinctive, technical, trustworthy) */
    /* Single brand color with full semantic range */
    accent: {
      50:  '#f0fdfa',    // Lightest tint
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',    // Hover states, subtle accents
      500: '#14b8a6',    // Primary brand (default)
      600: '#0d9488',    // Primary hover, active states
      700: '#0f766e',    // Pressed states
      800: '#115e59',    // Dark mode text on light accent
      900: '#134e4a',
      950: '#042f2e',    // Deepest accent
    },

    /* Accent Glow — For subtle atmospheric effects */
    accentGlow: {
      subtle:  'rgba(20, 184, 166, 0.08)',
      soft:    'rgba(20, 184, 166, 0.15)',
      medium:  'rgba(20, 184, 166, 0.25)',
      strong:  'rgba(20, 184, 166, 0.4)',
    },

    /* Evidence States — Temperature Scale (never color-only) */
    /* Each has bg, fg, border for consistent application */
    evidence: {
      VERIFIED:   { bg: '#064e3b', fg: '#a7f3d0', border: '#065f46' },   // Emerald - deployed, proven
      PROTOTYPE:  { bg: '#78350f', fg: '#fde68a', border: '#92400e' },   // Amber - working, not deployed
      TARGET:     { bg: '#1e3a5f', fg: '#93c5fd', border: '#1e40af' },   // Blue - planned target
      PLANNED:    { bg: '#312e81', fg: '#c4b5fd', border: '#4f46e5' },   // Violet - early stage
      UNKNOWN:    { bg: '#1e293b', fg: '#94a3b8', border: '#334155' },   // Slate - not yet observed
    },

    /* Evidence Text Colors (for inline usage) */
    evidenceText: {
      VERIFIED:   '#34d399',
      PROTOTYPE:  '#fbbf24',
      TARGET:     '#60a5fa',
      PLANNED:    '#a78bfa',
      UNKNOWN:    '#64748b',
    },

    /* Semantic — Functional, not decorative */
    semantic: {
      success:   '#10b981',
      warning:   '#f59e0b',
      error:     '#ef4444',
      info:      '#3b82f6',
      focus:     '#14b8a6',  // Accent-500 for focus rings
    },

    /* Surface Layering — Depth through elevation */
    surface: {
      page:      'neutral.950',     // Base page background
      card:      'neutral.900',     // Card/panel background
      elevated:  'neutral.800',     // Elevated elements (dropdowns, modals)
      overlay:   'rgba(2, 6, 23, 0.8)',  // Modal overlays
      hover:     'neutral.800/50',  // Hover states
      active:    'neutral.700/50',  // Active/pressed states
      border:    'neutral.700/50',  // Default borders
      borderStrong: 'neutral.600',  // Stronger borders
    },

    /* Gradient System — Premium, purposeful gradients */
    gradient: {
      /* Hero background mesh */
      heroMesh: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(20, 184, 166, 0.15) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99, 91, 255, 0.1) 0%, transparent 60%), radial-gradient(ellipse 50% 30% at 10% 80%, rgba(167, 139, 250, 0.08) 0%, transparent 50%)',
      /* Card hover */
      cardHover: 'linear-gradient(135deg, rgba(20, 184, 166, 0.03) 0%, rgba(20, 184, 166, 0.01) 100%)',
      /* Button primary */
      btnPrimary: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      /* Button secondary */
      btnSecondary: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
      /* Text gradient for headlines */
      textBrand: 'linear-gradient(135deg, #ffffff 0%, #14b8a6 100%)',
      textMuted: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    },

    /* Signal System — For data visualization (distinct, accessible) */
    signal: {
      network:    '#14b8a6',  // Teal - network/infrastructure
      networkGlow: 'rgba(20, 184, 166, 0.3)',
      identity:   '#a78bfa',  // Violet - identity/people
      identityGlow: 'rgba(167, 139, 250, 0.3)',
      treasury:   '#fbbf24',  // Amber - value/allocation
      treasuryGlow: 'rgba(251, 191, 36, 0.3)',
      build:      '#60a5fa',  // Blue - builds/execution
      buildGlow:  'rgba(96, 165, 250, 0.3)',
      evidence:   '#34d399',  // Green - verified evidence
      evidenceGlow: 'rgba(52, 211, 153, 0.3)',
    },
  },

  /* ──────────────────────────────────────────────────────────────
     TYPOGRAPHY — Geist Variable + Inter + JetBrains Mono
     ────────────────────────────────────────────────────────────── */

  typography: {
    /* Display: Geist Variable (Vercel's font) - geometric, technical, beautiful */
    display: {
      fontFamily: '"Geist Variable", "Geist", "Inter", system-ui, sans-serif',
      fontWeight: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: 1.05, snug: 1.1, normal: 1.15, relaxed: 1.25 },
      letterSpacing: { tight: '-0.03em', normal: '-0.02em', wide: '0.01em' },
    },

    /* UI: Inter - clean, readable, ubiquitous */
    ui: {
      fontFamily: '"Inter Variable", "Inter", "IBM Plex Sans", system-ui, sans-serif',
      fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
      lineHeight: { tight: 1.3, normal: 1.6, relaxed: 1.75 },
      letterSpacing: { tight: '-0.01em', normal: '0', wide: '0.02em' },
    },

    /* Mono: JetBrains Mono - technical artifacts, evidence IDs */
    mono: {
      fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", "Fira Code", monospace',
      fontWeight: { regular: 400, medium: 500 },
      lineHeight: 1.7,
      letterSpacing: '0',
    },

    /* Type Scale — Fluid, geometric progression (ratio: 1.25) */
    /* Base: 16px (1rem). Each step ×1.25 */
    scale: {
      xs:      '0.75rem',    // 12px - labels, captions
      sm:      '0.875rem',   // 14px - small body, meta
      base:    '1rem',       // 16px - body text
      lg:      '1.125rem',   // 18px - large body
      xl:      '1.25rem',    // 20px - small heading
      '2xl':   '1.5rem',     // 24px - heading 5
      '3xl':   '1.875rem',   // 30px - heading 4
      '4xl':   '2.25rem',    // 36px - heading 3
      '5xl':   '3rem',       // 48px - heading 2
      '6xl':   '3.75rem',    // 60px - heading 1
      '7xl':   '4.5rem',     // 72px - display
      '8xl':   '6rem',       // 96px - hero display
      '9xl':   'clamp(4.5rem, 8vw, 9rem)', // 72-144px - fluid hero
    },

    /* Named sizes for semantic usage */
    sizes: {
      hero:      'clamp(3.5rem, 7vw, 7rem)',   // 56-112px
      h1:        'clamp(2.5rem, 5vw, 4rem)',   // 40-64px
      h2:        'clamp(2rem, 3.5vw, 3rem)',   // 32-48px
      h3:        'clamp(1.5rem, 2.5vw, 2.25rem)', // 24-36px
      h4:        'clamp(1.25rem, 2vw, 1.5rem)',   // 20-24px
      body:      '1rem',                        // 16px
      bodyLg:    '1.125rem',                    // 18px
      button:    '0.875rem',                    // 14px
      label:     '0.75rem',                     // 12px
      caption:   '0.75rem',                     // 12px
      mono:      '0.8125rem',                   // 13px - mono base
      monoSm:    '0.75rem',                     // 12px - mono small
    },
  },

  /* ──────────────────────────────────────────────────────────────
     SPACING — 4px Base Unit (Universal Standard)
     ────────────────────────────────────────────────────────────── */

  spacing: {
    0:     '0',
    0.5:   '0.125rem',  // 2px
    1:     '0.25rem',   // 4px  — BASE UNIT
    1.5:   '0.375rem',  // 6px
    2:     '0.5rem',    // 8px
    2.5:   '0.625rem',  // 10px
    3:     '0.75rem',   // 12px
    3.5:   '0.875rem',  // 14px
    4:     '1rem',      // 16px
    5:     '1.25rem',   // 20px
    6:     '1.5rem',    // 24px
    7:     '1.75rem',   // 28px
    8:     '2rem',      // 32px
    9:     '2.25rem',   // 36px
    10:    '2.5rem',    // 40px
    11:    '2.75rem',   // 44px
    12:    '3rem',      // 48px
    14:    '3.5rem',    // 56px
    16:    '4rem',      // 64px
    20:    '5rem',      // 80px
    24:    '6rem',      // 96px
    28:    '7rem',      // 112px
    32:    '8rem',      // 128px
    36:    '9rem',      // 144px
    40:    '10rem',     // 160px
    44:    '11rem',     // 176px
    48:    '12rem',     // 192px
    52:    '13rem',     // 208px
    56:    '14rem',     // 224px
    60:    '15rem',     // 240px
    64:    '16rem',     // 256px
    72:    '18rem',     // 288px
    80:    '20rem',     // 320px
    96:    '24rem',     // 384px
  },

  /* ──────────────────────────────────────────────────────────────
     SIZING — Container widths, max widths
     ────────────────────────────────────────────────────────────── */

  sizing: {
    container: {
      sm:   '640px',
      md:   '768px',
      lg:   '1024px',
      xl:   '1280px',
      '2xl': '1400px',
      '3xl': '1600px',
      full: '100%',
    },
    prose:   '70ch',      // Optimal reading width
    narrow:  '50ch',      // Tight columns
    wide:    '90ch',      // Wide content
    max:     '1400px',    // Maximum content width
  },

  /* ──────────────────────────────────────────────────────────────
     BORDER RADIUS — Purposeful Scale
     ────────────────────────────────────────────────────────────── */

  radius: {
    none:   '0',
    xs:     '0.125rem',   // 2px - tiny elements
    sm:     '0.25rem',    // 4px - badges, pills, small inputs
    base:   '0.375rem',   // 6px - buttons, inputs, cards (DEFAULT)
    md:     '0.5rem',     // 8px - medium cards, dropdowns
    lg:     '0.75rem',    // 12px - large cards, modals
    xl:     '1rem',       // 16px - hero elements, large modals
    '2xl':  '1.5rem',     // 24px - special elements
    '3xl':  '2rem',       // 32px - very large
    full:   '9999px',     // Pills, avatars
  },

  /* ──────────────────────────────────────────────────────────────
     SHADOWS — Subtle, Layered, Purposeful Elevation
     ────────────────────────────────────────────────────────────── */

  shadow: {
    none:  'none',
    /* xs - Barely perceptible, for subtle depth */
    xs:    '0 1px 2px rgba(0, 0, 0, 0.15), 0 1px 1px rgba(0, 0, 0, 0.1)',
    /* sm - Default card shadow */
    sm:    '0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15)',
    /* base - Standard elevation */
    base:  '0 4px 8px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15)',
    /* md - Dropdowns, popovers */
    md:    '0 8px 16px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.15)',
    /* lg - Modals, large elevated surfaces */
    lg:    '0 16px 32px rgba(0, 0, 0, 0.35), 0 8px 16px rgba(0, 0, 0, 0.15)',
    /* xl - Maximum elevation */
    xl:    '0 24px 48px rgba(0, 0, 0, 0.4), 0 12px 24px rgba(0, 0, 0, 0.1)',
    /* Inner shadows for inset states */
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
    /* Focus ring - always visible, uses accent */
    focus: '0 0 0 3px rgba(20, 184, 166, 0.4)',
    /* Glow shadows for accent elements */
    glowSm:  '0 0 12px rgba(20, 184, 166, 0.2)',
    glowMd:  '0 0 24px rgba(20, 184, 166, 0.25)',
    glowLg:  '0 0 48px rgba(20, 184, 166, 0.3)',
  },

  /* ──────────────────────────────────────────────────────────────
     TRANSITIONS — Precise, Not Bouncy (Stripe/Linear style)
     ────────────────────────────────────────────────────────────── */

  transition: {
    instant: '50ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast:    '120ms cubic-bezier(0.4, 0, 0.2, 1)',
    base:    '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow:    '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower:  '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    /* Spring-like for delightful interactions */
    spring:  '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    /* For reduced motion */
    reduced: '0.01ms',
  },

  /* ──────────────────────────────────────────────────────────────
     Z-INDEX — Explicit Layering
     ────────────────────────────────────────────────────────────── */

  zIndex: {
    base:      0,
    dropdown:  100,
    sticky:    200,
    fixed:     300,
    modal:     400,
    popover:   500,
    tooltip:   600,
    toast:     700,
    overlay:   800,
  },

  /* ──────────────────────────────────────────────────────────────
     BREAKPOINTS — Mobile-First
     ────────────────────────────────────────────────────────────── */

  breakpoint: {
    xs:   '320px',
    sm:   '640px',
    md:   '768px',
    lg:   '1024px',
    xl:   '1280px',
    '2xl': '1400px',
    '3xl': '1600px',
  },

  /* ──────────────────────────────────────────────────────────────
     OPACITY — Semantic Opacity Values
     ────────────────────────────────────────────────────────────── */

  opacity: {
    disabled:     '0.4',
    muted:        '0.6',
    subtle:       '0.7',
    normal:       '0.85',
    strong:       '0.95',
    full:         '1',
  },

  /* ──────────────────────────────────────────────────────────────
     BLUR — Backdrop Blur Values
     ────────────────────────────────────────────────────────────── */

  blur: {
    none:  '0',
    sm:    '4px',
    base:  '8px',
    md:    '12px',
    lg:    '16px',
    xl:    '24px',
    '2xl': '40px',
  },
};

/* Type helpers */
export type ColorScale = keyof typeof tokens.color.neutral;
export type AccentScale = keyof typeof tokens.color.accent;
export type EvidenceState = keyof typeof tokens.color.evidence;
export type FontFamily = 'display' | 'ui' | 'mono';
export type Spacing = keyof typeof tokens.spacing;
export type FontSize = keyof typeof tokens.typography.scale;
export type Radius = keyof typeof tokens.radius;
export type Shadow = keyof typeof tokens.shadow;
export type Transition = keyof typeof tokens.transition;
export type ZIndex = keyof typeof tokens.zIndex;
export type Breakpoint = keyof typeof tokens.breakpoint;