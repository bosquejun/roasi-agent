"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react"

interface FrameData {
  x: number
  y: number
  w: number
  h: number
  duration: number
}

export interface RoasiHeadHandle {
  play: () => void
}

export interface RoasiHeadProps {
  className?: string
  canvasClassName?: string
  spriteJsonUrl?: string
  spritePngUrl?: string
  size?: number
}

export const RoasiHead = forwardRef<RoasiHeadHandle, RoasiHeadProps>(
  function RoasiHead(
    {
      className,
      canvasClassName,
      spriteJsonUrl = "/sprites/roasi/Roasi-head.json",
      spritePngUrl = "/sprites/roasi/Roasi-head.png",
      size,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const framesRef = useRef<FrameData[]>([])
    const imgRef = useRef<HTMLImageElement | null>(null)
    const animatingRef = useRef(false)
    const animationIdRef = useRef<number>(0)

    const drawFrame = useCallback((index: number) => {
      const canvas = canvasRef.current
      const img = imgRef.current
      const frames = framesRef.current
      if (!canvas || !img || frames.length === 0) return

      const ctx = canvas.getContext("2d")!
      const frame = frames[index]!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(
        img,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        0,
        0,
        canvas.width,
        canvas.height
      )
    }, [])

    const play = useCallback(() => {
      if (animatingRef.current) return
      animatingRef.current = true

      const frames = framesRef.current
      if (frames.length === 0) return

      let frameIndex = 0
      let lastTime = 0

      const tick = (time: number) => {
        if (!animatingRef.current) return

        if (lastTime === 0) lastTime = time

        const frame = frames[frameIndex]!
        const elapsed = time - lastTime

        if (elapsed >= frame.duration) {
          lastTime = time
          frameIndex++

          if (frameIndex >= frames.length) {
            animatingRef.current = false
            drawFrame(0)
            return
          }

          drawFrame(frameIndex)
        }

        animationIdRef.current = requestAnimationFrame(tick)
      }

      drawFrame(0)
      animationIdRef.current = requestAnimationFrame(tick)
    }, [drawFrame])

    useImperativeHandle(ref, () => ({ play }), [play])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      let mounted = true
      const sizeValue = size ?? (window.innerWidth < 768 ? 48 : 64)
      canvas.width = sizeValue
      canvas.height = sizeValue

      const ctx = canvas.getContext("2d")!
      ctx.imageSmoothingEnabled = false

      Promise.all([
        fetch(spriteJsonUrl).then((r) => r.json()),
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = spritePngUrl
        }),
      ])
        .then(([data, img]) => {
          if (!mounted) return
          imgRef.current = img
          framesRef.current = Object.values(
            data.frames as Record<
              string,
              {
                frame: { x: number; y: number; w: number; h: number }
                duration: number
              }
            >
          ).map((f) => ({
            x: f.frame.x,
            y: f.frame.y,
            w: f.frame.w,
            h: f.frame.h,
            duration: f.duration,
          }))
          drawFrame(0)
        })
        .catch(console.error)

      return () => {
        mounted = false
        animatingRef.current = false
        cancelAnimationFrame(animationIdRef.current)
      }
    }, [drawFrame, spriteJsonUrl, spritePngUrl, size])

    return (
      <div className={className}>
        <canvas ref={canvasRef} className={canvasClassName} />
      </div>
    )
  }
)
