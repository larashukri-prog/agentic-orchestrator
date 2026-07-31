---
name: SVG gauge overflow
description: SVG half-arch gauge with overflow:visible looks fine in desktop screenshots but breaks visually on real mobile devices due to parent overflow-hidden clipping behavior differences.
---

# SVG Gauge Overflow

## The Rule
Never use a half-arc SVG gauge with `overflow: visible`. Use a full circular progress ring instead.

**Why:** With `sweep-flag=0` the arc is a downward U-cup that extends below the SVG viewBox. `overflow: visible` lets it render outside the SVG element. `overflow: hidden` on a parent container clips it differently depending on the parent's computed height — which varies between desktop (larger container, more accidental clipping) and mobile (smaller viewport, arc bleeds through). On desktop the bug was masked by the container height happening to clip the cup visually. On a real mobile device it showed through.

**How to apply:** Use a `<circle>` with `stroke-dasharray`/`stroke-dashoffset` for any circular progress indicator. Rotate SVG -90° so fill starts at 12 o'clock. Score text goes in a centered `absolute inset-0` div overlaid on the SVG. No `overflow: visible` needed.
