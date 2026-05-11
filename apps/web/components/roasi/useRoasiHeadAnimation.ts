import { Application, Rectangle, Sprite, Texture } from "pixi.js"
import { useCallback, useEffect, useRef } from "react"

interface SpriteData {
  frames: Record<string, { x: number; y: number; w: number; h: number }>
  meta: { size: { w: number; h: number }; frame_size: { w: number; h: number } }
}

export function useRoasiHeadAnimation(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const appRef = useRef<Application | null>(null)
  const spriteRef = useRef<Sprite | null>(null)
  const textureCacheRef = useRef<Texture[]>([])
  const resizeHandlerRef = useRef<(() => void) | null>(null)

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

  useEffect(() => {
    if (!containerRef.current) return

    let mounted = true

    const initApp = async () => {
      const app = new Application()

      const size = window.innerWidth < 768 ? 48 : 64

      await app.init({
        width: size,
        height: size,
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

      const [headResponse, headImg] = await Promise.all([
        fetch("/sprites/roasi/Roasi-head.json"),
        loadImage("/sprites/roasi/Roasi-head.png"),
      ])

      const headData = await headResponse.json()
      const headTextures = createTextures(headImg, headData)
      textureCacheRef.current = headTextures

      const sprite = new Sprite(headTextures[0]!)
      sprite.anchor.set(0.5)
      sprite.width = 64
      sprite.height = 64

      app.stage.addChild(sprite)
      spriteRef.current = sprite

      let frameIndex = 0
      let frameElapsed = 0
      const frameInterval = 1000 / 12

      const animate = (delta: { deltaMS: number }) => {
        frameElapsed += delta.deltaMS

        if (frameElapsed >= frameInterval) {
          frameElapsed = 0
          frameIndex = (frameIndex + 1) % headTextures.length
          sprite.texture = headTextures[frameIndex]!
        }
      }

      app.ticker.add(animate)

      const handleResize = () => {
        if (appRef.current && containerRef.current) {
          appRef.current.renderer.resize(64, 64)
        }
      }

      window.addEventListener("resize", handleResize)
      resizeHandlerRef.current = handleResize
    }

    initApp().catch(console.error)

    return () => {
      mounted = false

      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current)
      }

      const app = appRef.current
      if (app) {
        app.destroy(true)
        appRef.current = null
      }
    }
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
