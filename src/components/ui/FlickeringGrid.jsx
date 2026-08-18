import { useCallback, useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

/**
 * A field of small squares that flicker at random, optionally masked into a word.
 *
 * Used once, at the very bottom of the footer, where it spells the marque out of
 * dust and dissolves upward into the page's black. It is the only ambient motion
 * on the site that is not a one-shot entrance, so it is kept quiet — 2px squares,
 * opacities that top out under a third — and it stops entirely when the band is
 * scrolled away, the tab is hidden, or the OS asks for reduced motion.
 *
 * Two things separate this from the canvas-grid snippet it is adapted from:
 *
 * 1. The text mask is rasterised once per resize, not once per frame. The usual
 *    version calls `getImageData` for every cell on every frame — for a band this
 *    size that is tens of thousands of GPU readbacks a second, and it will stall
 *    the main thread on a phone. Here the word is drawn to an offscreen canvas on
 *    setup, read back in one pass and reduced to a byte per cell; the loop then
 *    only touches a Float32Array and `fillRect`.
 * 2. The word is fitted to the width available, so a long one shrinks rather than
 *    running off the sides of the band on a narrow screen.
 *
 * Purely decorative — callers should hide it from assistive tech.
 */
export default function FlickeringGrid({
  squareSize = 2,
  gridGap = 3,
  flickerChance = 0.1,
  color = '#9ca3af',
  maxOpacity = 0.3,
  text = '',
  fontSize = 90,
  fontWeight = 700,
  textFromBottom = null,
  className,
  ...props
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  // The context wants numbers, so the colour is parsed once here instead of a
  // string being built per cell per frame.
  const [r, g, b] = toRgb(color)

  // Everything the loop reads, rebuilt on resize and held in a ref so a resize
  // never re-runs the effect that owns the loop.
  const gridRef = useRef(null)

  const setup = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const width = container.clientWidth
    const height = container.clientHeight
    if (!width || !height) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const cell = squareSize + gridGap
    const cols = Math.ceil(width / cell)
    const rows = Math.ceil(height / cell)

    const squares = new Float32Array(cols * rows)
    for (let i = 0; i < squares.length; i += 1) squares[i] = Math.random() * maxOpacity

    gridRef.current = {
      dpr,
      cols,
      rows,
      cell,
      squares,
      mask: text
        ? buildMask({
            text,
            width,
            height,
            cols,
            rows,
            cell,
            dpr,
            fontSize,
            fontWeight,
            // Measured up from the bottom edge rather than as a fraction of the
            // height, so the word keeps its distance from the foot of the page
            // whatever the block above it grows to.
            textY: textFromBottom == null ? height / 2 : height - textFromBottom,
          })
        : null,
    }
  }, [squareSize, gridGap, maxOpacity, text, fontSize, fontWeight, textFromBottom])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setup()

    const draw = () => {
      const grid = gridRef.current
      if (!grid) return

      const { dpr, cols, rows, cell, squares, mask } = grid
      const size = squareSize * dpr

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < cols; i += 1) {
        for (let j = 0; j < rows; j += 1) {
          const index = i * rows + j
          // Inside the letters the dots keep a floor and flicker above it, so the
          // word stays legible while the field around it goes on breathing.
          const opacity =
            mask && mask[index] ? Math.min(1, squares[index] * 2.6 + 0.42) : squares[index]

          ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`
          ctx.fillRect(i * cell * dpr, j * cell * dpr, size, size)
        }
      }
    }

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')

    let frame = 0
    let last = 0
    let visible = false

    const tick = (time) => {
      const grid = gridRef.current
      if (grid) {
        const delta = last ? (time - last) / 1000 : 0
        last = time

        const { squares } = grid
        for (let i = 0; i < squares.length; i += 1) {
          if (Math.random() < flickerChance * delta) squares[i] = Math.random() * maxOpacity
        }
      }

      draw()
      frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame) return
      last = 0
      frame = requestAnimationFrame(tick)
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    // Off-screen, hidden tab or reduced motion: paint one still frame and leave
    // the main thread alone.
    const sync = () => {
      if (visible && !reduced?.matches && !document.hidden) {
        start()
      } else {
        stop()
        draw()
      }
    }

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        sync()
      },
      { threshold: 0 },
    )
    intersection.observe(canvas)

    const resize = new ResizeObserver(() => {
      setup()
      if (!frame) draw()
    })
    resize.observe(container)

    document.addEventListener('visibilitychange', sync)
    reduced?.addEventListener('change', sync)

    draw()

    return () => {
      stop()
      intersection.disconnect()
      resize.disconnect()
      document.removeEventListener('visibilitychange', sync)
      reduced?.removeEventListener('change', sync)
    }
  }, [setup, squareSize, flickerChance, maxOpacity, r, g, b])

  return (
    <div ref={containerRef} className={cn('h-full w-full', className)} {...props}>
      <canvas ref={canvasRef} className="pointer-events-none block" />
    </div>
  )
}

/** Hex or rgb() in, three channels out. */
function toRgb(color) {
  const hex = color.trim().replace('#', '')

  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return [hex[0] + hex[0], hex[1] + hex[1], hex[2] + hex[2]].map((pair) => parseInt(pair, 16))
  }

  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map((pair) => parseInt(pair, 16))
  }

  const channels = color.match(/\d+(\.\d+)?/g)
  if (channels && channels.length >= 3) return channels.slice(0, 3).map(Number)

  return [180, 180, 180]
}

/**
 * Rasterise the word once and reduce it to one byte per grid cell.
 *
 * The type is fitted to 92% of the band's width before it is drawn, which is what
 * keeps a long word from being cropped by the edges of the canvas on a phone
 * rather than merely being smaller at a breakpoint.
 */
function buildMask({ text, width, height, cols, rows, cell, dpr, fontSize, fontWeight, textY }) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  const face = '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif'

  ctx.scale(dpr, dpr)
  ctx.font = `${fontWeight} ${fontSize}px ${face}`

  const limit = width * 0.92
  const measured = ctx.measureText(text).width
  const size = measured > limit ? Math.floor(fontSize * (limit / measured)) : fontSize

  ctx.font = `${fontWeight} ${size}px ${face}`
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, textY)

  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const mask = new Uint8Array(cols * rows)
  const step = Math.max(1, Math.floor(dpr))

  for (let i = 0; i < cols; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      const x0 = Math.floor(i * cell * dpr)
      const y0 = Math.floor(j * cell * dpr)
      const x1 = Math.min(canvas.width, x0 + Math.ceil(cell * dpr))
      const y1 = Math.min(canvas.height, y0 + Math.ceil(cell * dpr))

      let hit = 0
      for (let y = y0; y < y1 && !hit; y += step) {
        for (let x = x0; x < x1; x += step) {
          if (pixels[(y * canvas.width + x) * 4 + 3] > 0) {
            hit = 1
            break
          }
        }
      }

      mask[i * rows + j] = hit
    }
  }

  return mask
}
