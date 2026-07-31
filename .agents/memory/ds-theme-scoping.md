---
name: DS theme scoping
description: The Design System page uses data-ds-theme on its container div to scope its own light/dark toggle independently from the global app theme.
---

# DS Theme Scoping

## The Rule
Always define BOTH `[data-ds-theme="light"]` AND `[data-ds-theme="dark"]` CSS blocks.

**Why:** CSS custom properties cascade from the closest ancestor. When the global app sets `[data-theme="light"]` on `<html>`, its light-mode values cascade into all descendants including the DS page container. If only `[data-ds-theme="light"]` exists, the DS page dark toggle has no CSS to override the inherited light values — so it appears stuck in light mode regardless of the toggle state.

**How to apply:** `[data-ds-theme="dark"]` on the DS container div must explicitly re-set all the dark token values (background, foreground, border, muted-foreground, primary, urgency tokens). Copy from `:root` dark defaults. Applied in `src/index.css` after the `[data-ds-theme="light"]` block.
