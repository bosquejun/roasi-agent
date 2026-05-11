import { Application, Rectangle, Sprite, Texture } from "pixi.js"
import { useCallback, useEffect, useRef } from "react"

const IDLE_FRAME_COUNT = 25

interface SpriteData {
  frames: Record<string, { x: number; y: number; w: number; h: number }>
  meta: { size: { w: number; h: number }; frame_size: { w: number; h: number } }
}

export function useRoasiAnimation(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const appRef = useRef<Application | null>(null)
  const spriteRef = useRef<Sprite | null>(null)
  const textureCacheRef = useRef<Texture[]>([])
  const baseScaleRef = useRef(1)
  const stateRef = useRef({
    isWalking: false,
    direction: 1,
    idleTimeout: null as number | null,
    walkTimeout: null as number | null,
  })
  const playIdleRef = useRef<(() => void) | null>(null)
  const playWalkRef = useRef<(() => void) | null>(null)

  const createTextures = useCallback(
    (source: HTMLImageElement, spriteData: SpriteData): Texture[] => {
      const textures: Texture[] = []
      const baseTexture = Texture.from(source).source

      Object.keys(spriteData.frames)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((frameKey) => {
          const frame = spriteData.frames[frameKey]!
          const rect = new Rectangle(frame.x, frame.y, frame.w, frame.h)
          const texture = new Texture({
            source: baseTexture,
            frame: rect,
          })
          textures.push(texture)
        })

      return textures
    },
    []
  )

  const playIdle = useCallback((app: Application, sprite: Sprite) => {
    const textures = textureCacheRef.current.slice(0, IDLE_FRAME_COUNT)
    let frameIndex = 0
    let frameElapsed = 0

    const animate = (delta: { deltaMS: number }) => {
      frameElapsed += delta.deltaMS
      const interval = 1000 / 8

      if (frameElapsed >= interval) {
        frameElapsed = 0
        frameIndex = (frameIndex + 1) % textures.length
        sprite.texture = textures[frameIndex]!
      }
    }

    app.ticker.add(animate)

    const idleDuration = 8000 + Math.random() * 4000

    stateRef.current.idleTimeout = window.setTimeout(() => {
      app.ticker.remove(animate)

      if (Math.random() < 0.3) {
        // Confusion: glance the wrong way before committing to walk
        sprite.scale.x = -baseScaleRef.current * stateRef.current.direction
        stateRef.current.idleTimeout = window.setTimeout(() => {
          stateRef.current.idleTimeout = null
          sprite.scale.x = baseScaleRef.current * stateRef.current.direction
          playWalkRef.current?.()
        }, 400 + Math.random() * 500)
      } else {
        stateRef.current.idleTimeout = null
        playWalkRef.current?.()
      }
    }, idleDuration)
  }, [])

  const playWalk = useCallback((app: Application, sprite: Sprite) => {
    const textures = textureCacheRef.current.slice(IDLE_FRAME_COUNT)
    let frameIndex = 0
    let frameElapsed = 0
    let elapsed = 0
    let stopping = false
    let stopElapsed = 0
    const MAX_SPEED = 2.5
    const EASE_DURATION = 500
    const EXIT_BUFFER = 64
    const walkDuration = 4000 + Math.random() * 8000

    const animate = (delta: { deltaMS: number }) => {
      if (!stateRef.current.isWalking) return

      elapsed += delta.deltaMS

      let velocity: number
      if (stopping) {
        stopElapsed += delta.deltaMS
        const t = Math.min(1, stopElapsed / EASE_DURATION)
        velocity = MAX_SPEED * (1 - easeInOut(t))
        if (t >= 1) {
          stateRef.current.isWalking = false
          app.ticker.remove(animate)
          playIdleRef.current?.()
          return
        }
      } else if (elapsed < EASE_DURATION) {
        velocity = MAX_SPEED * easeInOut(elapsed / EASE_DURATION)
      } else {
        velocity = MAX_SPEED
      }

      if (velocity > 0.1) {
        frameElapsed += delta.deltaMS
        const frameInterval = 1000 / 10
        if (frameElapsed >= frameInterval) {
          frameElapsed = 0
          frameIndex = (frameIndex + 1) % textures.length
          sprite.texture = textures[frameIndex]!
        }
      }

      sprite.x += velocity * stateRef.current.direction

      const screenWidth = app.screen.width
      if (sprite.x < -EXIT_BUFFER || sprite.x > screenWidth + EXIT_BUFFER) {
        stateRef.current.isWalking = false
        app.ticker.remove(animate)
        if (stateRef.current.walkTimeout) {
          window.clearTimeout(stateRef.current.walkTimeout)
          stateRef.current.walkTimeout = null
        }
        // Re-enter from same side going back — no idle, sprite went somewhere and returns
        const exitedRight = stateRef.current.direction === 1
        sprite.x = exitedRight ? screenWidth + EXIT_BUFFER : -EXIT_BUFFER
        stateRef.current.direction = exitedRight ? -1 : 1
        sprite.scale.x = baseScaleRef.current * stateRef.current.direction
        stateRef.current.walkTimeout = window.setTimeout(() => {
          stateRef.current.walkTimeout = null
          playWalkRef.current?.()
        }, 1000 + Math.random() * 1500)
      }
    }

    stateRef.current.isWalking = true
    app.ticker.add(animate)

    // Walk ends mid-screen → decelerate, then idle visibly at rest position
    stateRef.current.walkTimeout = window.setTimeout(() => {
      stopping = true
      stopElapsed = 0
    }, walkDuration)
  }, [])

  useEffect(() => {
    playIdleRef.current = () => {
      const app = appRef.current
      const sprite = spriteRef.current
      if (app && sprite) playIdle(app, sprite)
    }
    playWalkRef.current = () => {
      const app = appRef.current
      const sprite = spriteRef.current
      if (app && sprite) playWalk(app, sprite)
    }
  }, [playIdle, playWalk])

  useEffect(() => {
    if (!containerRef.current) return

    let mounted = true

    const initApp = async () => {
      const app = new Application()

      await app.init({
        width: containerRef.current!.clientWidth,
        height: 128,
        backgroundAlpha: 0,
        antialias: false,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })

      if (!mounted || !containerRef.current) {
        app.destroy(true)
        return
      }

      containerRef.current.appendChild(app.canvas as HTMLCanvasElement)
      appRef.current = app

      const [idleResponse, walkResponse, idleImg, walkImg] = await Promise.all([
        fetch("/sprites/roasi/Roasi-idle.json"),
        fetch("/sprites/roasi/Roasi-walk.json"),
        loadImage("/sprites/roasi/Roasi-idle.png"),
        loadImage("/sprites/roasi/Roasi-walk.png"),
      ])

      const [idleData, walkData] = await Promise.all([
        idleResponse.json(),
        walkResponse.json(),
      ])

      const idleTextures = createTextures(idleImg, idleData)
      const walkTextures = createTextures(walkImg, walkData)

      textureCacheRef.current = [...idleTextures, ...walkTextures]

      const startLeft = Math.random() < 0.5
      stateRef.current.direction = startLeft ? 1 : -1

      const sprite = new Sprite(idleTextures[0]!)
      sprite.anchor.set(0.5, 1)
      sprite.width = 128
      sprite.height = 128
      baseScaleRef.current = Math.abs(sprite.scale.x)
      sprite.x = startLeft ? -64 : app.screen.width + 64
      sprite.y = 128
      sprite.scale.x = baseScaleRef.current * stateRef.current.direction

      app.stage.addChild(sprite)
      spriteRef.current = sprite

      // Sprite starts off-screen → walk in immediately (skip invisible idle)
      playWalkRef.current?.()
    }

    initApp()

    return () => {
      mounted = false

      const state = stateRef.current
      if (state.idleTimeout) window.clearTimeout(state.idleTimeout)
      if (state.walkTimeout) window.clearTimeout(state.walkTimeout)
      state.isWalking = false

      const app = appRef.current
      if (app) {
        app.destroy(true)
        appRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createTextures])

  return { appRef, spriteRef }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function easeInOut(t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return clamped * clamped * (3 - 2 * clamped)
}
