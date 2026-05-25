---
name: Cinematic Spiritualism
colors:
  surface: '#121315'
  surface-dim: '#121315'
  surface-bright: '#38393a'
  surface-container-lowest: '#0d0e0f'
  surface-container-low: '#1b1c1d'
  surface-container: '#1f2021'
  surface-container-high: '#292a2b'
  surface-container-highest: '#343536'
  on-surface: '#e3e2e3'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e3e2e3'
  inverse-on-surface: '#303032'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#94d3c1'
  on-secondary: '#00382e'
  secondary-container: '#0b5345'
  on-secondary-container: '#86c5b3'
  tertiary: '#c6cdeb'
  on-tertiary: '#283046'
  tertiary-container: '#aab2ce'
  on-tertiary-container: '#3c445c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#afefdd'
  secondary-fixed-dim: '#94d3c1'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#065043'
  tertiary-fixed: '#dae2ff'
  tertiary-fixed-dim: '#bec6e3'
  on-tertiary-fixed: '#131b30'
  on-tertiary-fixed-variant: '#3e465e'
  background: '#121315'
  on-background: '#e3e2e3'
  surface-variant: '#343536'
  obsidian-base: '#08090A'
  midnight-glass: '#111827'
  spiritual-gold: '#D4AF37'
  divine-ivory: '#F9F9F9'
  sacred-emerald: '#004D40'
  gold-shimmer: '#FFD700'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 60px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  arabic-quote:
    fontFamily: Noto Serif
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 48px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  margin-safe: 32px
  gutter: 24px
  stack-depth: 12px
  container-max: 1200px
---

## Brand & Style

The design system is anchored in the concept of "The Divine Light" (Nur). It balances the ethereal, spiritual nature of Islamic knowledge with a high-end, futuristic interface inspired by spatial computing. The personality is meditative, authoritative, and deeply polished, evoking a sense of calm focus and reverence.

The aesthetic follows a **Cinematic Glassmorphism** style. It utilizes deep layering, volumetric lighting, and subtle reflections to create an interface that feels physically present yet spiritually transcendent. Unlike standard SaaS layouts, this system prioritizes atmosphere and depth, using "light from within" as a primary metaphor for knowledge and discovery.

Key brand attributes:
- **Quiet Luxury:** Sophisticated, minimalist, and expensive-feeling.
- **Spiritual Depth:** Using verticality and transparency to suggest layers of meaning.
- **Human-Centric AI:** Technology that feels like an enlightened companion rather than a machine.

## Colors

The palette is rooted in a "Deep Night" philosophy, where knowledge appears as shimmering light emerging from the darkness.

- **Primary (Spiritual Gold):** Used for critical actions, sacred highlights, and brand iconography. It represents the "Nur" (Light).
- **Secondary (Sacred Emerald):** A subtle, deep green used for success states, source verification, and traditional Islamic accents.
- **Tertiary (Midnight Navy):** Provides depth to glass layers and serves as the bridge between pure black and glowing elements.
- **Neutral (Obsidian & Ivory):** The background is a near-pure black to maximize the contrast of glass effects. Ivory is used for all text to provide a softer, more readable experience than pure white.

**Color Application:**
- Backgrounds should use `#08090A` with a subtle radial gradient of `#1A2238` towards the center.
- Interactive elements utilize gold glows and ivory borders.

## Typography

The typographic hierarchy creates a dialogue between tradition and modernity.

**Headings (Serif):** Uses **Playfair Display** to convey authority and timelessness. Headlines should always use Ivory (`#F9F9F9`) and may occasionally feature a very subtle gold drop shadow to imply depth.

**UI & Body (Sans-Serif):** Uses **Inter** for its exceptional legibility and modern, technical feel. It provides a clean counterpoint to the decorative nature of the serif headings.

**Arabic Integration:** For Quranic verses or Hadith, use a high-contrast serif like **Noto Serif Arabic** to ensure the calligraphic weight matches the elegance of the Latin serif. Line heights for Arabic must be increased by at least 40% to accommodate diacritics.

## Layout & Spacing

This design system uses a **Fluid Spatial Grid**. Content is not strictly bound by hard boxes but floats within a defined spatial hierarchy.

- **Desktop:** A 12-column grid with 24px gutters. Content is centered with a max-width of 1200px to maintain focus.
- **Mobile:** A single column layout with 24px side margins. 
- **Z-Axis Spacing:** Depth is as important as horizontal spacing. Elements "stack" with 12px of perceived Z-space, indicated by increasing backdrop blur intensity and lighter border opacities for closer elements.

Padding within containers should be generous (minimum 32px for cards) to maintain a "calm" and "airy" atmosphere.

## Elevation & Depth

Elevation is achieved through **Volumetric Layering** rather than traditional drop shadows.

1.  **Backdrop Blur:** Every surface above the base layer must use a background blur (ranging from 12px to 40px).
2.  **Inner Glows:** Instead of outer shadows, use 1px inner borders with varying opacities. The "top" border of a card should be more opaque (30%) than the bottom (10%) to simulate a light source from above.
3.  **Reflections:** Primary cards should feature a subtle linear gradient overlay (diagonal, white to transparent at 5% opacity) to mimic the reflection of glass.
4.  **Shadows:** Use large, diffused "Ambient Occlusion" shadows (0px offset, 40px blur, 40% opacity) in a deep navy tint (`#000000`) rather than pure black.

## Shapes

The shape language is organic and inviting. We avoid sharp corners entirely to maintain the "spiritual softness" of the interface.

- **Base Radius:** 24px for all primary cards and containers.
- **Interactive Elements:** Buttons and input fields use a pill-shape (32px+ radius) to feel modern and accessible.
- **Iconography:** Icons should be thin-stroke (1.5px) with rounded terminals, matching the overall softness. Avoid filled/heavy icons unless they are in an active state.

## Components

### Buttons
- **Primary:** Solid Gold (`#D4AF37`) with Ivory text. Features a subtle outer glow of the same color.
- **Secondary:** Transparent with a 1px Ivory border (20% opacity) and heavy backdrop blur.
- **Tertiary:** Pure text with a gold underline on hover.

### Glass Cards
The signature component. Must include a 1px border gradient (Gold to Transparent), a 40px backdrop blur, and a subtle noise texture (3% opacity) to give the glass a tactile, "frosted" feel.

### Input Fields
Pill-shaped with a deep navy background (`#111827`). On focus, the border should glow Gold, and the backdrop blur should increase.

### Chips & Tags
Small, highly rounded (pill) elements. For "Verified Sources," use the Sacred Emerald (`#004D40`) as a subtle background tint with a matching border.

### Search/AI Input
The "Nur" bar should be the most prominent element. It uses a thicker 2px border and a constant, very slow pulsing gold glow to indicate it is "alive" and ready for input.