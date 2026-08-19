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
  // How much of the band's width the word is allowed to fill before it is scaled
  // down to fit. This is the knob for how wide the marque reads, not `fontSize`:
  // past a certain size the fit clamps and asking for more type changes nothing.
  fitWidth = 0.92,
  // The word's weight against the field it comes out of. `textFloor` is the opacity
  // a cell inside a letter never drops below and `textGain` multiplies its flicker
  // on top of that — the floor is what makes the word legible, the gain is what
  // lets it keep breathing. Weight has to be spent here because the face is loaded
  // at 400..800, so `fontWeight` is already at its ceiling at 800.
  textFloor = 0.42,
  textGain = 2.6,
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

    // Capped at 2. The field is 2px squares on a 5px pitch, and a 3x phone screen
    // was drawing 2.25 times the pixels of a 2x one to render dots that are already
    // below the eye's resolving limit at either density — pure cost. The cap is the
    // single biggest lever on this component's frame time on the devices that
    // struggle with it, and nothing about it is visible at 1x or 2x.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
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
            fitWidth,
            // Measured up from the bottom edge rather than as a fraction of the
            // height, so the word keeps its distance from the foot of the page
            // whatever the block above it grows to.
            textY: textFromBottom == null ? height / 2 : height - textFromBottom,
          })
        : null,
    }
  }, [squareSize, gridGap, maxOpacity, text, fontSize, fontWeight, fitWidth, textFromBottom])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setup()

    // Inside the letters the dots keep a floor and flicker above it, so the word
    // stays legible while the field around it goes on breathing.
    const opacityAt = (grid, index) =>
      grid.mask && grid.mask[index]
        ? Math.min(1, grid.squares[index] * textGain + textFloor)
        : grid.squares[index]

    /** Repaint one cell in place. */
    const paint = (grid, index) => {
      const { dpr, rows, cell } = grid
      const x = Math.floor(index / rows) * cell * dpr
      const y = (index % rows) * cell * dpr
      const size = squareSize * dpr

      ctx.clearRect(x, y, size, size)
      ctx.fillStyle = `rgba(${r},${g},${b},${opacityAt(grid, index)})`
      ctx.fillRect(x, y, size, size)
    }

    /** Every cell. Setup, resize, and the single still frame. */
    const draw = () => {
      const grid = gridRef.current
      if (!grid) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let index = 0; index < grid.squares.length; index += 1) paint(grid, index)
    }

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')

    let frame = 0
    let last = 0
    let visible = false

    // Only the cells that actually changed this frame get touched.
    //
    // The version this replaces cleared the canvas and repainted every cell on
    // every frame — on a wide screen that is around 75,000 `fillRect` calls and
    // as many `rgba()` strings, sixty times a second, to change roughly a
    // hundred of them. It was affordable only because the browser scrolled on
    // the compositor and could outrun a busy main thread; with Lenis the scroll
    // position *is* main-thread work, so the same loop shows up as a stutter in
    // the scroll itself when the footer comes into view.
    //
    // The count is drawn from the expected value rather than by rolling a die
    // for each of the 75,000 cells — the same average number of flickers per
    // second, without the per-cell `Math.random()` that cost more than the
    // drawing did. Indices are picked with replacement, so a cell can be chosen
    // twice in one frame; against a field this size that is invisible.
    const tick = (time) => {
      const grid = gridRef.current
      if (grid) {
        const delta = last ? (time - last) / 1000 : 0
        last = time

        const { squares } = grid
        const flips = Math.min(squares.length, Math.round(squares.length * flickerChance * delta))

        for (let n = 0; n < flips; n += 1) {
          const index = (Math.random() * squares.length) | 0
          squares[index] = Math.random() * maxOpacity
          paint(grid, index)
        }
      }

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

    // Always a full redraw, running or not: `setup` reassigns `canvas.width`,
    // which wipes the bitmap, and the loop only repaints the handful of cells it
    // changes — so without this the field would come back blank and refill over
    // several seconds.
    const resize = new ResizeObserver(() => {
      setup()
      draw()
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
  }, [setup, squareSize, flickerChance, maxOpacity, r, g, b, textFloor, textGain])

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
function buildMask({
  text,
  width,
  height,
  cols,
  rows,
  cell,
  dpr,
  fontSize,
  fontWeight,
  fitWidth,
  textY,
}) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  const face = '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif'

  ctx.scale(dpr, dpr)
  ctx.font = `${fontWeight} ${fontSize}px ${face}`

  const limit = width * fitWidth
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
