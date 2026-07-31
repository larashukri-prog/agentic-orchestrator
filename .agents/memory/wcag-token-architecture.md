---
name: WCAG token architecture
description: How the Cognitive Scaffold dark/light palette was made WCAG 2.1 AA compliant and how the theme toggle works.
---

# WCAG 2.1 AA Token Architecture

## The Rule
- Body/UI text on dark card (`hsl(0 0% 11%)`) needs **≥ 4.5:1**. Old `--muted-foreground: 30 5% 46%` was ~3.8:1 — failed.
- UI boundaries need **≥ 3:1** against adjacent bg. Old `--border: 0 0% 16.5%` was ~1.4:1 — failed.
- Opacity modifiers like `/45` on muted text compound failures. Min safe opacity against dark card is `/80` when base is `30 8% 64%`.

## Fixed Values (dark mode)
- `--muted-foreground: 30 8% 64%` → ~7:1 ✓ (was `30 5% 46%`)
- `--secondary-foreground`: same
- `--border: 0 0% 26%`, `--card-border: 0 0% 22%`, `--sidebar-border: 0 0% 22%`
- `--primitive-neutral-400: oklch(65% 0.004 60)` (was 49%)
- `--primitive-amber-600: oklch(60% 0.09 55)` (was 57%) — urgency-medium ≥4.5:1 ✓
- `--primitive-amber-700: oklch(56% 0.006 60)` (was 51%) — urgency-low ≥4.5:1 ✓
- Urgency styles in App.tsx switched to token classes (`text-urgency-high` etc) — no hardcoded hex

## Light Mode
- `[data-theme="light"]` on `<html>` triggers full light override in `index.css`
- Primary amber darkened: `--primary: 33 60% 33%` → ~5.4:1 against light bg ✓
- Muted text darkened: `--muted-foreground: 30 5% 32%` → ~8:1 against white ✓
- Card border raised: `--card-border: 0 0% 56%` → ~3.4:1 vs white ✓
- Urgency tokens inverted to dark amber: `oklch(38% 0.12 55)` etc → ≥5:1 vs white ✓
- Theme persisted via `useLocalStorageState("app:theme", "dark")`
- Toggle is ☀️/🌙 icon next to EN/AR in dashboard header

## Design System page scoped toggle
- `[data-ds-theme="light"]` on the page container div (not html) — only affects /design-system route
- Works independently from the app-level `[data-theme="light"]`

**Why:** CSS custom properties cascade, so scoping overrides to a container div keeps the rest of the app unaffected.
**How to apply:** Any future theme override should use `data-theme` on `<html>` (global) or `data-ds-theme` on a page container (scoped). Never hardcode hex for text or urgency colors — always use token classes so both modes inherit automatically.
