# Design Research Summary: Top SaaS Design Systems (2024-2025)

## Key Design Systems Analyzed

### 1. **GitHub Primer** (primer.style)
- **Color**: Blue primary (#0969da), extensive gray scales, functional semantic colors
- **Typography**: System UI font stack (SF Pro, Segoe UI, etc.), monospace for code
- **Spacing**: 4px base unit (0.25rem), consistent scale
- **Border Radius**: 6px base, 3px small, 12px large
- **Key Principle**: "Functional, not decorative" - color communicates meaning

### 2. **Linear** (linear.app)
- **Color**: Dark mode first, purple accent (#5e6ad2), sophisticated grays
- **Typography**: Inter font family, careful hierarchy
- **Spacing**: 4px base unit
- **Border Radius**: 6px base, 8px medium, 12px large
- **Key Principle**: Opinionated, craft-focused, dark-mode native

### 3. **Vercel Geist** (vercel.com/geist)
- **Color**: Clean neutrals, blue accent (#0070f3), careful dark mode
- **Typography**: **Geist** (custom font), Inter fallback, excellent variable font usage
- **Spacing**: 4px base unit
- **Border Radius**: 4px, 8px, 12px, 16px, full
- **Key Principle**: Developer-first, technical precision, variable fonts

### 4. **Stripe** (stripe.com)
- **Color**: Purple/indigo primary (#635bff), beautiful gradients, extensive scales
- **Typography**: Custom font (Stripe-owned), Inter for UI
- **Spacing**: 4px base unit
- **Border Radius**: 6px, 12px, 16px
- **Key Principle**: Polished, premium, gradient-rich, motion-aware

### 5. **Ethos** (ethosdesignsystem.com)
- **Color**: Teal/green primary, warm neutrals, accessible contrast
- **Typography**: Inter, careful scale
- **Spacing**: 8px base unit
- **Key Principle**: Human-centered, accessible, insurance/trust focus

---

## Common Patterns Across Top SaaS (2024-2025)

### Typography
- **Primary**: Inter (ubiquitous), Geist (Vercel), custom fonts for brand
- **Scale**: Fluid type with clamp(), typically 16px base
- **Line Height**: 1.5 for body, 1.1-1.2 for headings
- **Letter Spacing**: Negative for display (-0.02 to -0.03em), 0 for body
- **Weights**: 400, 500, 600, 700 - rarely more

### Color
- **Dark Mode First**: Most leading SaaS default to dark
- **Single Accent**: One brand color with full 50-950 scale
- **Neutral Scales**: 10-12 steps (50-950), warm or cool variants
- **Semantic Colors**: Success (green), Warning (amber), Error (red), Info (blue)
- **Background Layering**: page → card → elevated → overlay

### Spacing
- **Base Unit**: 4px (0.25rem) - universal standard
- **Scale**: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24 (in base units)
- **Container**: 1200-1440px max width typically

### Border Radius
- **Small**: 4px (inputs, badges)
- **Base**: 6-8px (cards, buttons)
- **Medium**: 12px (modals, larger cards)
- **Large**: 16-24px (hero elements)
- **Full**: 9999px (pills, avatars)

### Shadows/Elevation
- **Subtle**: 1-2 layers max
- **Pattern**: Small sharp shadow + larger diffuse shadow
- **Colors**: rgba(0,0,0,0.05-0.15) for light, rgba(0,0,0,0.2-0.4) for dark

### Hero Sections (2024-2025 Trends)
1. **Large Display Type**: 48-72px+ headlines, tight leading
2. **Subtle Background**: Mesh gradients, noise, or clean solid
3. **Clear CTAs**: Primary + secondary, obvious hierarchy
4. **Social Proof**: Logos, metrics, or trust indicators
5. **Product Preview**: Screenshot, demo, or interactive element
6. **Minimal Navigation**: Often hidden or minimal on landing

---

## Recommended Design Direction for APT-LABS

Based on the product truth (institutional infrastructure, evidence-based, sovereign records), I recommend a **hybrid approach** combining:

1. **Linear's dark-mode sophistication** - for technical credibility
2. **Vercel's typography excellence** - Geist/Inter for technical precision
3. **Stripe's premium polish** - gradients, careful motion, elevated feel
4. **GitHub's functional clarity** - color as meaning, not decoration

### Proposed Token System

```typescript
// Color - Deep technical dark mode with single teal/cyan accent
// Typography - Geist Variable for display, Inter for UI, JetBrains Mono for code
// Spacing - 4px base (consistent with all top systems)
// Radius - 6px base, 12px medium, 16px large
// Shadows - Subtle, layered, purposeful
```