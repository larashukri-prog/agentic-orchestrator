---
name: WCAG opacity floor
description: Minimum safe opacity modifiers for text to maintain WCAG 2.1 AA (4.5:1) on the dark palette.
---

# WCAG Opacity Floor for Text

## The Rule
Never apply opacity modifiers below `/80` to `text-muted-foreground`, and never apply them below `/70` to `text-foreground`, for any UI text (labels, metadata, section headers, body copy).

**Why:** `--muted-foreground` is calibrated to ~7:1 against the dark card background. At `/60` that falls to ~4.2:1, failing AA for all text sizes. At `/30` it's ~2.1:1 — a hard fail. Similarly for foreground-based classes at small sizes.

**How to apply:**
- Remove all `/30`, `/35`, `/40`, `/45`, `/50`, `/60`, `/65` opacity modifiers from text classes in pattern components.
- `/80` on `text-muted-foreground` = ~5.6:1 — passes AA for normal text (≥14px) only.
- `/60` on `text-foreground` (near-white) = ~9:1 × 0.6 = ~5.4:1 — borderline; use full token for small text.
- Decorative non-text elements (dots, divider lines, accent strips) are exempt from contrast requirements.
- Affected files historically: `ChainOfThoughtDrawer.tsx`, `HitlStagingCard.tsx`, `RuleOfThreeContainer.tsx`.
