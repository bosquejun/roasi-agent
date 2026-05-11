# Roasi Animation Improvements — Design Spec

**Date:** 2026-05-11
**Status:** Approved

## Overview

Improve the Roasi ambient animation to feel natural and realistic. Three areas of work: bug fixes (anchor point, duration inversion), velocity easing for walk, and horizontal boundary buffer.

## Bug Fixes

### Anchor Point
Set `sprite.anchor.set(0.5, 1)` — center-x, bottom-y. The current default (0, 0) causes the sprite to visually jump on direction flip because `scale.x = -1` reflects around the left edge. With center anchor, the flip is seamless. `sprite.y` is set to canvas height (128) so the feet sit at the canvas bottom.

### Duration Inversion
The current code has Idle 4–6s → Walk 8–12s. The spec requires Idle 8–12s → Walk 4–6s. Fix the timeout values in `playIdle` and `playWalk`.

### Canvas Height
No change. CSS `bottom: -26px` on the container keeps the sprite grounded at the bottom screen edge (feet partially below viewport).

## Velocity Easing

Replace the constant `+2px/tick` walk speed with eased velocity:

- **Max speed:** 2.5px/tick
- **Easing function:** smooth step — `t * t * (3 - 2 * t)`
- **Walk cycle phases** (local to each walk invocation, no new `stateRef` fields):
  1. `accelerating` — velocity ramps 0 → maxSpeed over first 30 ticks
  2. `cruising` — constant maxSpeed
  3. `decelerating` — velocity ramps maxSpeed → 0 over last 30 ticks before timeout fires

On timeout, velocity is already ~0 so the transition to idle is smooth with no lurch.

## Horizontal Boundary Buffer

- **Left boundary:** sprite center `x = 64` (half a sprite width from screen edge)
- **Right boundary:** sprite center `x = screenWidth - 64`
- With `anchor.x = 0.5`, the sprite body appears flush with the screen edge at the turn point rather than clipping mid-body or jumping

On a mid-walk boundary hit (not triggered by timeout), the sprite decelerates to 0, flips `scale.x`, then re-accelerates — no switch to idle, Roasi just turns around naturally.

## Unchanged

- Frame rates: 8fps idle, 10fps walk
- Sprite sheets: idle (25 frames), walk (25 frames)
- CSS: `bottom: -26px`, `overflow: hidden`, `pointer-events: none`
- Component structure: `RoasiAnimation.tsx`, `useRoasiAnimation.ts`, `roasi.module.css`

## Files to Change

- `apps/web/components/roasi/useRoasiAnimation.ts` — all logic changes
