# FRONTEND DESIGN SPECIFICATION & UI BLUEPRINT
**Project**: SYNERGY PROTOHACK  
**Version**: 1.0.0  
**Design Paradigm**: Neo-Obsidian Cyberpunk & Glassmorphism (Molten Amber on Obsidian Amethyst)

---

## 1. Design Overview & Core Philosophy
The frontend follows a **dark obsidian aesthetic** characterized by deep violet-black background surfaces, elevated glassmorphic cards with fine micro-borders, glowing molten amber primary accents, amethyst/lavender secondary accents, and strict typographic hierarchy.

- **Theme**: Pure Dark Mode (no light theme toggles).
- **Aesthetic**: Futuristic high-velocity developer platform with glow effects, crisp borders, and monospace data badges.
- **Micro-Interactions**: Smooth scale transforms (`scale-98` on click), glowing ambient backdrops (`blur-[140px]`), and animated pulse indicators.

---

## 2. Typography System

### Font Families
1. **Headings, Display & Hero**: `Space Grotesk` (Google Font)
   - Weights: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold)
   - CSS Variable: `--font-space-grotesk`
2. **Body, Form Controls & Paragraphs**: `Inter` (Google Font)
   - Weights: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold)
   - CSS Variable: `--font-inter`
3. **Data, Tokens, Code & Timers**: `JetBrains Mono` (Google Font)
   - Weights: `400` (Regular), `500` (Medium)
   - CSS Variable: `--font-jetbrains-mono`
4. **Iconography**: `Material Symbols Outlined` (bundled locally via `material-symbols/outlined.css`)
   - Default size: `24px` (utility: `text-base` `text-lg` `text-xl` `text-2xl`)

### Typography Scale Hierarchy

| Token Name | Size | Line Height | Letter Spacing | Weight | Font Family | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`display-hero`** | `64px` | `72px` | `-0.03em` | `700` | Space Grotesk | Desktop Hero Titles |
| **`display-hero-mobile`** | `38px` | `44px` | `-0.02em` | `700` | Space Grotesk | Mobile Hero Titles |
| **`headline-xl`** | `44px` | `52px` | `-0.02em` | `600` | Space Grotesk | Major Section Headers |
| **`headline-lg`** | `32px` | `40px` | `-0.01em` | `600` | Space Grotesk | Card Headers & Modal Titles |
| **`headline-md`** | `24px` | `32px` | `0em` | `600` | Space Grotesk | Subheadings & Tile Titles |
| **`headline-sm`** | `20px` | `28px` | `0em` | `500` | Space Grotesk | Small Section Titles |
| **`body-lg`** | `18px` | `28px` | `normal` | `400` | Inter | Lead Paragraphs |
| **`body-md`** | `15px` | `24px` | `normal` | `400` | Inter | Default Body Text & Forms |
| **`body-sm`** | `13px` | `20px` | `normal` | `400` | Inter | Form Help Text, Footers |
| **`label-caps`** / **`eyebrow`** | `11px` | `16px` | `0.12em` | `700` | Space Grotesk | Badges, Section Eyebrows (UPPERCASE) |
| **`label-code`** | `13px` | `18px` | `0.04em` | `500` | JetBrains Mono | Participant IDs, Hashes, Team Codes |

---

## 3. Color Palette & Design Tokens

### Core Surface & Neutral Tones
- **`surface` / `background`**: `#141317` (Deep Obsidian Black)
- **`surface-container-lowest`**: `#0f0e12` (Form Field Backgrounds & Input Wells)
- **`surface-container-low`**: `#1c1b1f`
- **`surface-container`**: `#201f23` (Standard Card Background)
- **`surface-container-high`**: `#2b292e` (Elevated Elements, Pill Chips)
- **`surface-container-highest`**: `#363438` (Hover States)
- **`outline`**: `#9f8e7a` (Muted Labels & Placeholders)
- **`outline-variant`**: `#524534` (Borders & Dividers, opacity 20%–40%)
- **`on-surface`**: `#e6e1e7` (Primary Text)
- **`on-surface-variant`**: `#d7c3ae` (Secondary Subtext)

### Primary Accent: Molten Amber
- **`primary`**: `#ffc880` / `#ffb95b` (Bright Amber Highlight)
- **`primary-container`**: `#f5a623` (Main CTA Button Color)
- **`on-primary`**: `#452b00` (Text on Primary Amber Buttons)
- **`on-primary-container`**: `#644000`
- **`primary-fixed`**: `#ffddb4`
- **`primary-glow`**: `rgba(245, 166, 35, 0.45)` (Box Shadow Glows)

### Secondary Accent: Royal Amethyst / Lavender
- **`secondary`**: `#e7b4fa` (Lavender Accent Text)
- **`secondary-container`**: `#613874` (Deep Amethyst Badge BG)
- **`on-secondary`**: `#471e59`
- **`on-secondary-container`**: `#d8a6eb`

### Semantic Feedback Colors
- **Success / Validated**: `#7ee0a1` (Success container: `rgba(126, 224, 161, 0.15)`, border: `rgba(126, 224, 161, 0.35)`)
- **Error / Danger**: `#ffb4ab` (Error container: `#93000a` / `rgba(147, 0, 10, 0.2)`)
- **Warning**: `#ffc881`

---

## 4. Spacing, Borders & Radius Scale

### Spacing Scale
- **`space-xs`**: `0.25rem` (4px)
- **`space-sm`**: `0.5rem` (8px)
- **`space-md`**: `1rem` (16px)
- **`space-lg`**: `1.5rem` (24px)
- **`space-xl`**: `2.5rem` (40px)
- **`space-xxl`**: `4rem` (64px)

### Border Radius Hierarchy
- **Inputs & Selects**: `rounded-lg` (`0.5rem` / 8px) or `rounded-xl` (`0.75rem` / 12px)
- **Cards & Modals**: `rounded-2xl` (`1rem` / 16px)
- **Badges & Pill Tags**: `rounded-full` (`9999px`)
- **Logo Avatars**: `rounded-lg` (`0.5rem` / 8px)

### Elevation & Glassmorphism Rules
- **Glass Card Recipe**:
  ```html
  <div class="bg-surface-container/95 border border-outline-variant/30 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8">
  ```
- **Amber Glow Button Recipe**:
  ```html
  <button class="px-8 py-3.5 rounded-xl bg-primary-container text-on-primary font-label-md uppercase tracking-wider font-bold hover:bg-primary transition-all shadow-[0_0_25px_rgba(245,166,35,0.45)] hover:shadow-[0_0_35px_rgba(245,166,35,0.7)] active:scale-98">
  ```

---

## 5. Global Layout & Ambient Backdrop

Every page features the **`AmbientGlow`** background layer:

```tsx
export function AmbientGlow({ variant = "full" }: { variant?: "full" | "subtle" | "admin" }) {
  if (variant === "admin") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 right-10 w-[500px] h-[300px] bg-primary-container/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-[160px]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top centered violet glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-secondary-container/20 rounded-full blur-[140px]" />
      {/* Right side molten amber glow */}
      <div className="absolute top-40 -right-20 w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[160px]" />
      {/* Subtle radial depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,166,35,0.06)_0%,transparent_60%)]" />
    </div>
  );
}
```

---

## 6. Core Component Blueprints

### A. Navigation Bar (`Navbar.tsx`)
- **Branding (Top-Left)**:
  - Strict display: `/finalsynergy1.png` logo image inside `w-8 h-8 rounded-lg ring-1 ring-outline-variant/40` + text `SYNERGY` (`font-bold tracking-wider text-on-surface`).
  - No sub-headers or extra labels attached to top-left brand.
- **Nav Links**: `#about`, `#rounds`, `#timeline`, `#rules`, `#faq` (hover: text-primary).
- **Auth Button (Right)**:
  - If signed in: Shows `Dashboard` button or user avatar.
  - If signed out: Amber `Register Now` CTA linking to `/auth?tab=register`.

### B. Form Inputs & Select Controls
```html
<div class="relative">
  <input
    type="text"
    placeholder="e.g. Alex V. Chen"
    class="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all"
  />
  <span class="material-symbols-outlined text-outline absolute left-3 top-3.5 text-lg">
    person
  </span>
</div>
```

### C. Status Badges & Pill Chips
- **Amber Glow Chip**:
  ```html
  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/15 border border-primary/30 text-primary text-xs uppercase font-bold tracking-wider">
    <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
    Round 1 Live
  </span>
  ```
- **Monospace Code Box**:
  ```html
  <div class="p-4 rounded-xl bg-surface-container-lowest border border-primary/50 shadow-inner font-mono text-2xl text-primary font-bold tracking-wider select-all text-center">
    PRT-2025-SRM-9045
  </div>
  ```

---

## 7. Page Layout & Viewport Specifications

### 1. Auth Page (`/auth` & `/login`)
- **Viewport Constraint**: Must fit 100% inside `h-screen max-h-screen overflow-hidden` without vertical scroll on desktop.
- **Components**:
  - Centered Glass Card (`max-w-[400px]`, `p-5 sm:p-6`).
  - Brand header with logo and `PROTOHACK`.
  - Tab switcher: `Sign In` / `Create Account`.
  - Google OAuth button (`Continue with Google`) with 4-color Google SVG.
  - Minimal top header (Back link) and minimal footer copyright.

### 2. Profile Completion Page (`/profile/complete`)
- **Header**: `Complete Your Profile` (clean without redundant sub-verification chips).
- **Grid Layout**: 2-column responsive form (Full Name, College, Department, Year, Phone, Locked Email).
- **CTA Action**: Single, clean right-aligned **`Submit`** button.

### 3. Landing Page (`/`)
- **Hero Section**: Clean title `PROTOHACK` with amber gradient highlights, direct countdown timer, and dual CTAs.
- **Rounds Breakdown Section**:
  - **Round 1 (Offline)**: 36 Teams, 120 Minutes, 100-Point Evaluation Matrix.
  - **Round 2 (Finals)**: Top 10 Shortlisted Teams, 180 Minutes, Live Product Deployment & Defense.
- **Rules Section**: Exact match with official competition rules.

### 4. Admin Portal (`/admin/*`)
- **Route Access**:
  - Login: `/admin/login`
  - Participants Roster: `/admin/participants`
  - Teams & Squads: `/admin/teams`
  - Round 2 Shortlisting: `/admin/shortlisting`
  - Live Event Controls & Timers: `/admin/event-controls`
- **Shell**: Obsidian sidebar with shield branding, navigation links with active amber glows, and real-time data tables.

---

## 8. Verbatim Tailwind Theme Config (`tailwind.config.ts`)

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface": "#141317",
        "surface-dim": "#141317",
        "surface-bright": "#3a383d",
        "surface-container-lowest": "#0f0e12",
        "surface-container-low": "#1c1b1f",
        "surface-container": "#201f23",
        "surface-container-high": "#2b292e",
        "surface-container-highest": "#363438",
        "surface-variant": "#363438",
        "on-surface": "#e6e1e7",
        "on-surface-variant": "#d7c3ae",
        "inverse-surface": "#e6e1e7",
        "inverse-on-surface": "#313034",
        "outline": "#9f8e7a",
        "outline-variant": "#524534",
        "primary": "#ffc880",
        "on-primary": "#452b00",
        "primary-container": "#f5a623",
        "on-primary-container": "#644000",
        "secondary": "#e7b4fa",
        "on-secondary": "#471e59",
        "secondary-container": "#613874",
        "on-secondary-container": "#d8a6eb",
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "card": "1rem",
        "input": "0.75rem",
      },
    },
  },
};

export default config;
```
