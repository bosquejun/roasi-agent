# Roasi Animation Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix anchor-point bug, invert durations, add eased velocity, and add horizontal boundary buffer so Roasi walks naturally along the bottom screen edge.

**Architecture:** All changes are in `useRoasiAnimation.ts`. A pure `easeInOut` helper drives the velocity phases. The sprite anchor moves to `(0.5, 1)` so flips are visually centered and the feet stay grounded at y=128.

**Tech Stack:** PixiJS v8, React hooks, TypeScript

---

## File Map

| Action | File |
|--------|------|
| Modify | `apps/web/components/roasi/useRoasiAnimation.ts` |

---

### Task 1: Fix sprite anchor and initial position

**Files:**
- Modify: `apps/web/components/roasi/useRoasiAnimation.ts`

- [ ] **Step 1: Update sprite initialization in `initApp`**

Find the block that creates the sprite (around line 169) and replace it:

```typescript
const sprite = new Sprite(idleTextures[0]!)
sprite.width = 128
sprite.height = 128
sprite.anchor.set(0.5, 1)
sprite.x = app.screen.width / 2
sprite.y = 128
```

`anchor.set(0.5, 1)` means x-position is the horizontal center, y-position is the feet. With `y = 128` (canvas height), the feet sit flush at the canvas bottom. Combined with the CSS `bottom: -26px`, the feet appear grounded at the screen edge.

- [ ] **Step 2: Fix boundary checks in `playWalk` to use center-based x**

The current boundary uses `sprite.x > screenWidth - 128` and `sprite.x < 0`. With `anchor.x = 0.5`, `sprite.x` is now the center, so half the sprite (64px) extends each side. Update the boundary constants:

```typescript
const BUFFER = 64 // half sprite width — keeps body flush with edge

if (sprite.x > screenWidth - BUFFER) {
  sprite.x = screenWidth - BUFFER
  sprite.scale.x = -1
  stateRef.current.direction = -1
} else if (sprite.x < BUFFER) {
  sprite.x = BUFFER
  sprite.scale.x = 1
  stateRef.current.direction = 1
}
```

- [ ] **Step 3: Run type-check**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/roasi/useRoasiAnimation.ts
git commit -m "fix: set sprite anchor to center-bottom and update boundary checks"
```

---

### Task 2: Fix idle/walk duration inversion

**Files:**
- Modify: `apps/web/components/roasi/useRoasiAnimation.ts`

Currently `playIdle` waits 4–6s before switching to walk, and `playWalk` waits 8–12s before switching to idle. The spec requires the opposite.

- [ ] **Step 1: Fix duration in `playIdle`**

Find the timeout inside `playIdle` and change the duration from `4000 + Math.random() * 2000` to `8000 + Math.random() * 4000`:

```typescript
const idleDuration = 8000 + Math.random() * 4000  // 8–12s idle

stateRef.current.idleTimeout = window.setTimeout(() => {
  app.ticker.remove(animate)
  playWalkRef.current?.()
}, idleDuration)
```

- [ ] **Step 2: Fix duration in `playWalk`**

Find the timeout inside `playWalk` and change the duration from `8000 + Math.random() * 4000` to `4000 + Math.random() * 2000`:

```typescript
const walkDuration = 4000 + Math.random() * 2000  // 4–6s walk

stateRef.current.walkTimeout = window.setTimeout(() => {
  stateRef.current.isWalking = false
  app.ticker.remove(animate)
  playIdleRef.current?.()
}, walkDuration)
```

- [ ] **Step 3: Run type-check**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/roasi/useRoasiAnimation.ts
git commit -m "fix: correct idle/walk duration inversion — idle 8-12s, walk 4-6s"
```

---

### Task 3: Add easeInOut helper and velocity phases to `playWalk`

**Files:**
- Modify: `apps/web/components/roasi/useRoasiAnimation.ts`

- [ ] **Step 1: Add `easeInOut` function at the bottom of the file**

Place this after the existing `loadImage` function:

```typescript
function easeInOut(t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return clamped * clamped * (3 - 2 * clamped)
}
```

This is a smooth-step curve: starts at 0, ends at 1, zero derivative at both ends. The clamp ensures safety if `t` goes slightly outside [0, 1] due to timing jitter.

- [ ] **Step 2: Replace the `playWalk` implementation with velocity-phased version**

Replace the entire `playWalk` `useCallback` body with:

```typescript
const playWalk = useCallback((app: Application, sprite: Sprite) => {
  const textures = textureCacheRef.current.slice(25)
  let frameIndex = 0
  let frameElapsed = 0
  let elapsed = 0
  const MAX_SPEED = 2.5
  const EASE_DURATION = 500
  const walkDuration = 4000 + Math.random() * 2000

  const animate = (delta: { deltaMS: number }) => {
    if (!stateRef.current.isWalking) return

    elapsed += delta.deltaMS
    frameElapsed += delta.deltaMS

    const frameInterval = 1000 / 10
    if (frameElapsed >= frameInterval) {
      frameElapsed = 0
      frameIndex = (frameIndex + 1) % textures.length
      sprite.texture = textures[frameIndex]!
    }

    let velocity: number
    if (elapsed < EASE_DURATION) {
      velocity = MAX_SPEED * easeInOut(elapsed / EASE_DURATION)
    } else if (elapsed > walkDuration - EASE_DURATION) {
      velocity = MAX_SPEED * easeInOut((walkDuration - elapsed) / EASE_DURATION)
    } else {
      velocity = MAX_SPEED
    }

    sprite.x += velocity * stateRef.current.direction

    const screenWidth = app.screen.width
    const BUFFER = 64

    if (sprite.x > screenWidth - BUFFER) {
      sprite.x = screenWidth - BUFFER
      sprite.scale.x = -1
      stateRef.current.direction = -1
    } else if (sprite.x < BUFFER) {
      sprite.x = BUFFER
      sprite.scale.x = 1
      stateRef.current.direction = 1
    }
  }

  stateRef.current.isWalking = true
  app.ticker.add(animate)

  stateRef.current.walkTimeout = window.setTimeout(() => {
    stateRef.current.isWalking = false
    app.ticker.remove(animate)
    playIdleRef.current?.()
  }, walkDuration)
}, [])
```

Note: `elapsed` is tracked inside the animate function (not in stateRef) so it's local to each walk cycle and resets automatically on each `playWalk` call.

- [ ] **Step 3: Run type-check**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors

- [ ] **Step 4: Start dev server and visually verify**

```bash
cd apps/web && pnpm dev
```

Open `http://localhost:3000`. Check:
- Roasi starts in idle animation
- After ~8–12s Roasi begins walking
- Walk accelerates from rest, cruises, then decelerates before stopping
- Direction flip is seamless (no jump/teleport)
- At screen edges the sprite body aligns flush — not clipped, not leaving a gap
- After ~4–6s of walking, Roasi returns to idle
- Cycle repeats

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/roasi/useRoasiAnimation.ts
git commit -m "feat: add eased velocity phases to Roasi walk animation"
```
