import type { Config } from "tailwindcss";
import { epistemicTokens } from "./tokens/epistemic";
import { tokens } from "./lib/design-tokens";

/**
 * Tailwind config merging epistemic tokens (core framework) + design tokens (marketing surface)
 * Single source of truth: both token systems combined
 */

// Extract only color properties from epistemic evidence states for Tailwind
const evidenceColors = {
  UNKNOWN: { bg: epistemicTokens.evidence.UNKNOWN.bg, fg: epistemicTokens.evidence.UNKNOWN.fg, border: epistemicTokens.evidence.UNKNOWN.border },
  PLANNED: { bg: epistemicTokens.evidence.PLANNED.bg, fg: epistemicTokens.evidence.PLANNED.fg, border: epistemicTokens.evidence.PLANNED.border },
  TARGET: { bg: epistemicTokens.evidence.TARGET.bg, fg: epistemicTokens.evidence.TARGET.fg, border: epistemicTokens.evidence.TARGET.border },
  VERIFIED: { bg: epistemicTokens.evidence.VERIFIED.bg, fg: epistemicTokens.evidence.VERIFIED.fg, border: epistemicTokens.evidence.VERIFIED.border },
  PROTOTYPE: { bg: epistemicTokens.evidence.PROTOTYPE.bg, fg: epistemicTokens.evidence.PROTOTYPE.fg, border: epistemicTokens.evidence.PROTOTYPE.border },
};

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./tokens/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ───────────────── COLORS ───────────────── */
      colors: {
        // Epistemic substrate
        void: epistemicTokens.void,
        panel: epistemicTokens.panel,
        edge: epistemicTokens.edge,

        // Emission — the ONLY interactive colour
        emission: epistemicTokens.emission,

        // Informational — never interactive
        informational: epistemicTokens.informational,

        // Ink ladder (4 tiers)
        ink: epistemicTokens.ink,

        // Evidence states — luminance-ordered, enforced
        evidence: evidenceColors,

        // Design tokens — full SaaS palette for marketing surface
        neutral: tokens.color.neutral,
        accent: tokens.color.accent,
        accentGlow: tokens.color.accentGlow,
        evidenceLegacy: tokens.color.evidence,
        evidenceText: tokens.color.evidenceText,
        semantic: tokens.color.semantic,
        surface: tokens.color.surface,
        gradient: tokens.color.gradient,
        signal: tokens.color.signal,

        // Alias success/warning/error for convenience
        success: tokens.color.semantic.success,
        warning: tokens.color.semantic.warning,
        error: tokens.color.semantic.error,
        info: tokens.color.semantic.info,
      },

      /* ───────────────── FONTS ───────────────── */
      fontFamily: {
        sans: [tokens.typography.ui.fontFamily.split(",")[0].replace(/"/g, ""), "system-ui", "sans-serif"],
        display: [tokens.typography.display.fontFamily.split(",")[0].replace(/"/g, ""), "system-ui", "sans-serif"],
        mono: [tokens.typography.mono.fontFamily.split(",")[0].replace(/"/g, ""), "ui-monospace", "monospace"],
      },

      /* ───────────────── TYPE SCALE — Merge both systems ───────────────── */
      fontSize: {
        // Epistemic type ladder (prefixed to avoid conflicts)
        "epistemic-micro": ["9.51px", { lineHeight: "1", letterSpacing: "0.0065em" }],
        "epistemic-label": ["11.31px", { lineHeight: "1", letterSpacing: "0.00433em" }],
        "epistemic-ui": ["13.45px", { lineHeight: "1", letterSpacing: "0.00217em" }],
        "epistemic-body": ["16px", { lineHeight: "1.6", letterSpacing: "0em" }],
        "epistemic-lead": ["19.03px", { lineHeight: "1.6", letterSpacing: "-0.00217em" }],
        "epistemic-h3": ["22.63px", { lineHeight: "1.3", letterSpacing: "-0.00433em" }],
        "epistemic-h2": ["26.91px", { lineHeight: "1.2", letterSpacing: "-0.0065em" }],
        "epistemic-h1": ["32px", { lineHeight: "1.15", letterSpacing: "-0.00866em" }],
        "epistemic-figure": ["38.05px", { lineHeight: "1.1", letterSpacing: "-0.01083em" }],
        "epistemic-display": ["45.25px", { lineHeight: "1.1", letterSpacing: "-0.013em" }],
        "epistemic-hero": [epistemicTokens.type.hero.clamp, { lineHeight: "1.05", letterSpacing: "-0.01516em" }],

        // Design tokens scale (semantic names: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl, 9xl)
        ...Object.fromEntries(
          Object.entries(tokens.typography.scale).map(([key, value]) => [
            key,
            [value, { lineHeight: "1.5" }],
          ])
        ),
        // Semantic sizes
        hero: [tokens.typography.sizes.hero, { lineHeight: "1.05" }],
        h1: [tokens.typography.sizes.h1, { lineHeight: "1.1" }],
        h2: [tokens.typography.sizes.h2, { lineHeight: "1.15" }],
        h3: [tokens.typography.sizes.h3, { lineHeight: "1.2" }],
        h4: [tokens.typography.sizes.h4, { lineHeight: "1.3" }],
        body: [tokens.typography.sizes.body, { lineHeight: "1.6" }],
        bodyLg: [tokens.typography.sizes.bodyLg, { lineHeight: "1.6" }],
        button: [tokens.typography.sizes.button, { lineHeight: "1.5" }],
        label: [tokens.typography.sizes.label, { lineHeight: "1.5" }],
        caption: [tokens.typography.sizes.caption, { lineHeight: "1.5" }],
        mono: [tokens.typography.sizes.mono, { lineHeight: "1.7" }],
        monoSm: [tokens.typography.sizes.monoSm, { lineHeight: "1.7" }],
      },

      /* ───────────────── SPACING ───────────────── */
      spacing: {
        // Epistemic space tokens (4px base unit)
        ...Object.fromEntries(
          epistemicTokens.space.tokens.map((t) => [t / 4, `${t}px`])
        ),
        // Design tokens spacing (full range)
        ...Object.fromEntries(
          Object.entries(tokens.spacing).map(([key, value]) => [key, value])
        ),
      },

      /* ───────────────── SIZING ───────────────── */
      maxWidth: {
        tight: epistemicTokens.measure.tight,
        hero: epistemicTokens.measure.hero,
        canvas: "1400px",
        ...Object.fromEntries(
          Object.entries(tokens.sizing.container).map(([key, value]) => [key, value])
        ),
        prose: tokens.sizing.prose,
        narrow: tokens.sizing.narrow,
        wide: tokens.sizing.wide,
        max: tokens.sizing.max,
      },

      /* ───────────────── BORDER RADIUS ───────────────── */
      borderRadius: {
        none: "0",
        xs: tokens.radius.xs,
        sm: tokens.radius.sm,
        base: tokens.radius.base,
        md: tokens.radius.md,
        lg: tokens.radius.lg,
        xl: tokens.radius.xl,
        "2xl": tokens.radius["2xl"],
        "3xl": tokens.radius["3xl"],
        full: tokens.radius.full,
      },

      /* ───────────────── SHADOWS ───────────────── */
      boxShadow: {
        none: tokens.shadow.none,
        xs: tokens.shadow.xs,
        sm: tokens.shadow.sm,
        DEFAULT: tokens.shadow.base,
        base: tokens.shadow.base,
        md: tokens.shadow.md,
        lg: tokens.shadow.lg,
        xl: tokens.shadow.xl,
        inner: tokens.shadow.inner,
        focus: tokens.shadow.focus,
        glowSm: tokens.shadow.glowSm,
        glowMd: tokens.shadow.glowMd,
        glowLg: tokens.shadow.glowLg,
      },

      /* ───────────────── TRANSITIONS ───────────────── */
      transitionDuration: {
        instant: "50ms",
        fast: "120ms",
        base: "200ms",
        slow: "300ms",
        slower: "500ms",
        reduced: "0.01ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      /* ───────────────── Z-INDEX ───────────────── */
      zIndex: {
        base: "0",
        plate: "10",
        guard: "100",
        trace: "200",
        modal: "300",
        ...Object.fromEntries(
          Object.entries(tokens.zIndex).map(([key, value]) => [key, String(value)])
        ),
      },

      /* ───────────────── BREAKPOINTS ───────────────── */
      screens: {
        rail: "1199px",
        strip: "1200px",
        canvas: "1400px",
        ...Object.fromEntries(
          Object.entries(tokens.breakpoint).map(([key, value]) => [key, value])
        ),
      },

      /* ───────────────── OPACITY ───────────────── */
      opacity: {
        disabled: "0.4",
        muted: "0.6",
        subtle: "0.7",
        normal: "0.85",
        strong: "0.95",
        full: "1",
        // Emission alphas
        a08: "0.08",
        a15: "0.15",
        a30: "0.30",
        ...Object.fromEntries(
          Object.entries(tokens.opacity).map(([key, value]) => [key, value])
        ),
      },

      /* ───────────────── BACKGROUND IMAGES ───────────────── */
      backgroundImage: {
        "emission-glow": "radial-gradient(ellipse at center, rgba(20, 232, 184, 0.15) 0%, transparent 70%)",
        "emission-glow-dim": "radial-gradient(ellipse at center, rgba(20, 232, 184, 0.08) 0%, transparent 70%)",
        "target-glow": "radial-gradient(ellipse at center, rgba(239, 180, 41, 0.15) 0%, transparent 70%)",
        "clash-glow": "radial-gradient(ellipse at center, rgba(239, 68, 68, 0.15) 0%, transparent 70%)",
        "hero-mesh": tokens.color.gradient.heroMesh,
        "card-hover": tokens.color.gradient.cardHover,
        "btn-primary": tokens.color.gradient.btnPrimary,
        "btn-secondary": tokens.color.gradient.btnSecondary,
        "text-brand": tokens.color.gradient.textBrand,
        "text-muted": tokens.color.gradient.textMuted,
        grain: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },

      /* ───────────────── ANIMATION ───────────────── */
      animation: {
        drift: "drift 6s ease-in-out infinite",
        transition: "transition 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in": "fadeIn 500ms ease-out",
        "slide-up": "slideUp 500ms ease-out",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(2px, -2px) scale(1.01)" },
          "50%": { transform: "translate(-1px, 3px) scale(0.99)" },
          "75%": { transform: "translate(-2px, -1px) scale(1.01)" },
        },
        transition: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },

      /* ───────────────── BLUR ───────────────── */
      backdropBlur: {
        none: "0",
        sm: "4px",
        base: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
        ...Object.fromEntries(
          Object.entries(tokens.blur).map(([key, value]) => [key, value])
        ),
      },
    },
  },
  plugins: [],
};

export default config;