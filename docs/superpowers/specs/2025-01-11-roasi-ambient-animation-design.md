# Roasi Ambient Animation - Design Spec

**Date:** 2025-01-11
**Status:** Approved

## Overview

An auto-playing ambient animation featuring the Roasi character on the landing page. The character cycles through idle and walking animations in a natural, organic pattern to add life to the page without requiring user interaction.

## Animation Sequence

- **Cycle Pattern:** Idle (8-12 sec random) → Walk (4-6 sec random) → repeat
- **Walk Behavior:** Ping-pong across bottom of screen
- **Initial State:** Idle animation starts automatically
- **Visual:** Pixel-perfect rendering, no anti-aliasing

## Technical Approach

### Stack
- **PixiJS** for WebGL sprite animation
- React component architecture
- Sprite sheets from design-system (idle + walk JSON + PNG)

### Component Structure
```
apps/web/components/roasi/
├── RoasiAnimation.tsx      # Main React component
├── useRoasiAnimation.ts    # Animation hook
└── index.ts               # Export
```

### Sprite Data
- **Frame size:** 256x256 pixels
- **Spritesheet size:** 1280x1280 (25 frames each)
- **Animations:** Idle (25 frames), Walk (25 frames)

## Implementation Plan

1. Install pixi.js in web app
2. Copy sprite assets to web public folder
3. Create RoasiAnimation component with PixiJS
4. Implement idle/walk cycle with random timing
5. Position at bottom of landing page
6. Add pixel-perfect rendering settings
