import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { BRANCH_COUNT, NETWORK_POINTS, POINT_COUNT } from '@/data/network'
import { cn } from '@/utils/cn'

/**
 * The network map: every branch and sales point plotted on one plate.
 *
 * Not a second copy of [[OfficeMap]]. That one answers "where do I turn up",
 * which is a single address and is best served by Google's embed because the
 * next thing anyone does with it is ask for a route. This answers "how far is
 * the nearest one from me", which is a question about the *set* — and a set of
 * pins is the one thing the free Google embed cannot draw.
 *
 * So it is Leaflet over CARTO's Positron basemap, which is the only tile set
 * that suits the site: near-white land, hairline roads, grey type. Google's
 * palette drops a slab of saturated green and yellow into a page drawn entirely
 * in ink on paper.
 *
 * The markers are the site's own: a dot and a black name chip, both plain HTML
 * through `divIcon`, so they inherit the page's font and cost no image.
 *
 * Gated the same way OfficeMap is, for the same reason: `scrollWheelZoom` is off
 * until the map is pressed, so a thumb travelling down a phone does not get
 * caught zooming Nepal. Dragging stays live — that costs nobody their scroll
 * position, and it is what the map is for.
 *
 * LABELS ARE DECLUTTERED, NOT TRUSTED TO FIT. Fifteen chips on a country this
 * shape collide — Nepalgunj into Dang, Janakpur into Lahan — and Leaflet has no
 * collision handling of its own. `labelSide` in the data moves the worst
 * offenders off the default right-hand side, and a measuring pass after every
 * move hides whatever still overlaps at the reader's own window width. The pin
 * always survives; only the name goes, and it comes back on hover.
 *
 * TWO PINS, BECAUSE THERE ARE TWO KINDS OF PLACE. A branch is a full counter
 * with a manager and a workshop; a sales point is a smaller desk reporting to
 * one. Branches get the filled brand dot and a permanent name chip. Sales
 * points get a smaller hollow dot and no chip until hovered — twenty-five
 * labels on a map of Nepal is not a network, it is a wall of black rectangles,
 * and the ten that come off are the ten a reader can find from the branch they
 * are already looking at.
 *
 * Everything comes from `data/network.js`. The view is fitted to the pins
 * rather than hard-coded, so a new branch in a corner of the country widens the
 * map by itself and nothing here changes.
 */

const META = 'text-[11px] font-semibold tracking-[0.2em] uppercase'

// CARTO's basemaps are free for reasonable volumes and require the attribution
// carried below. `@2x` on a retina panel: the label type is the point of this
// basemap and it renders soft at 1x.
const TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

// Padding on the fitted bounds, and a ceiling on the zoom. The ceiling only
// matters if the network ever shrinks to one location — a bounding box of zero
// size fits to street level, which shows one junction and no network.
const FIT = { padding: [56, 56], maxZoom: 11 }

/**
 * The pins. A branch is a filled brand dot ringed in paper so it holds against
 * the tiles; a sales point is smaller, hollow and ink — present at a glance,
 * subordinate on inspection, which is exactly its relationship to the branch.
 */
const BRANCH_PIN =
  'display:block;width:14px;height:14px;border-radius:9999px;background:#e11919;box-shadow:0 0 0 3px #fff,0 2px 8px rgba(5,5,5,0.35)'

const POINT_PIN =
  'display:block;width:9px;height:9px;border-radius:9999px;background:#fff;border:2px solid #121214;box-shadow:0 1px 5px rgba(5,5,5,0.3)'

// Where a chip sits relative to its dot, and how far off it. Leaflet wants the
// offset as a vector, and the sign has to follow the direction or the label
// lands on top of the pin it belongs to.
const LABEL_OFFSET = {
  right: [12, 0],
  left: [-12, 0],
  top: [0, -11],
  bottom: [0, 11],
}

const pinIcon = (branch) =>
  L.divIcon({
    className: '',
    iconSize: branch ? [14, 14] : [9, 9],
    iconAnchor: branch ? [7, 7] : [4.5, 4.5],
    html: `<span style="${branch ? BRANCH_PIN : POINT_PIN}"></span>`,
  })

export default function NetworkMap() {
  const holder = useRef(null)
  const map = useRef(null)
  const [live, setLive] = useState(false)

  // Leaflet is imperative and owns its own DOM, so it is mounted once against
  // an empty div and torn down on unmount. React never renders inside it.
  useEffect(() => {
    const node = holder.current
    if (!node) return

    const instance = L.map(node, {
      // Top-right: the wake pill sits top-left, and the default position put
      // the +/- buttons directly under it.
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
    })

    L.control.zoom({ position: 'topright' }).addTo(instance)

    // `detectRetina` is what fills the `{r}` in the tile URL with `@2x`. Without
    // it the placeholder resolves to nothing and the basemap's type — the whole
    // reason for choosing Positron — renders soft on a retina panel.
    L.tileLayer(TILES, { attribution: ATTRIBUTION, detectRetina: true, maxZoom: 19 }).addTo(
      instance,
    )

    const points = NETWORK_POINTS.filter((place) => place.coords)

    // Every marker, for the collision pass to treat as occupied ground, and
    // the labelled subset in declaration order — that order is the priority the
    // pass reads as "who keeps their label".
    const markers = []
    const labels = []

    points.forEach((place) => {
      const branch = place.kind === 'branch'
      const { lat, lng } = place.coords
      const side = branch ? (place.labelSide ?? 'right') : 'right'

      const marker = L.marker([lat, lng], {
        icon: pinIcon(branch),
        title: place.name,
        keyboard: false,
      })
        .addTo(instance)
        .bindTooltip(place.name, {
          permanent: branch,
          direction: side,
          offset: branch ? LABEL_OFFSET[side] : [9, 0],
          className: branch ? 'network-pin-label' : 'network-pin-label network-pin-label--point',
        })

      markers.push(marker)
      if (branch) labels.push({ marker, side })
    })

    // ── Declutter ──────────────────────────────────────────────────────────
    // Leaflet has no label collision handling at all, and `labelSide` in the
    // data can only anticipate the fitted view — the reader's window is a width
    // nobody authored for.
    //
    // Two things a chip must not cover: another chip, and any pin. The second
    // is the one that matters most and the one the first pass missed —
    // Dhangadhi's label ran east across the map and parked on top of Surkhet,
    // which does not merely look untidy, it deletes a branch from the network.
    // So every dot is seeded into the occupied set before a single label is
    // placed: pins are the map, labels are annotation, and annotation gives way.
    //
    // And a chip that collides is moved before it is dropped. Each label tries
    // its preferred side first, then the other three, and only disappears if all
    // four are taken — hiding a name is the last resort rather than the first.
    // Priority is declaration order, which keeps it stable: the same branch wins
    // the same contest every time rather than flickering as the map is panned.
    const SIDES = ['right', 'left', 'top', 'bottom']

    const overlaps = (box, other) =>
      box.left < other.right + 4 &&
      box.right + 4 > other.left &&
      box.top < other.bottom + 4 &&
      box.bottom + 4 > other.top

    const declutter = () => {
      // Every pin on the map, label or not. A sales point has no permanent chip
      // and still must not be buried under one.
      const taken = markers
        .map((marker) => marker.getElement()?.getBoundingClientRect())
        .filter((box) => box?.width)

      labels.forEach(({ marker, side }) => {
        const tooltip = marker.getTooltip()
        const element = tooltip?.getElement()
        if (!element) return

        element.classList.remove('is-crowded')

        // Preferred side first, then the rest in a fixed order so the fallback
        // is as reproducible as the preference.
        const order = [side, ...SIDES.filter((candidate) => candidate !== side)]
        const placed = order.some((candidate) => {
          tooltip.options.direction = candidate
          tooltip.options.offset = LABEL_OFFSET[candidate]
          tooltip.update()

          const box = element.getBoundingClientRect()
          if (!box.width || taken.some((other) => overlaps(box, other))) return false

          taken.push(box)
          return true
        })

        if (!placed) {
          // Put it back on its preferred side before hiding it, so a hover
          // brings it back where the data asked for rather than wherever the
          // last attempt left it.
          tooltip.options.direction = side
          tooltip.options.offset = LABEL_OFFSET[side]
          tooltip.update()
          element.classList.add('is-crowded')
        }
      })
    }

    // A chip the pass hid is not gone, only stood down: pointing at its pin
    // brings it back over the top of whatever crowded it out, and moving away
    // re-runs the pass. Without this a reader who can see a dot has no way to
    // learn which town it is without scrolling to the index.
    labels.forEach(({ marker }) => {
      marker.on('mouseover', () => {
        const element = marker.getTooltip()?.getElement()
        if (!element) return
        element.classList.remove('is-crowded')
        element.classList.add('is-raised')
      })

      marker.on('mouseout', () => {
        marker.getTooltip()?.getElement()?.classList.remove('is-raised')
        declutter()
      })
    })

    instance.on('zoomend moveend', declutter)

    // Once after the tooltips have been laid out. `moveend` covers the pan and
    // the zoom, but the first paint after `fitBounds` is not always a move.
    requestAnimationFrame(declutter)

    // A window resize changes the map's box, and Leaflet does not notice on its
    // own. Re-measuring is what keeps the declutter honest at every width.
    const observer = new ResizeObserver(() => {
      instance.invalidateSize()
      declutter()
    })
    observer.observe(node)

    if (points.length) {
      instance.fitBounds(
        L.latLngBounds(points.map((place) => [place.coords.lat, place.coords.lng])),
        FIT,
      )
    } else {
      // Nepal, corner to corner. Only reachable if every branch is missing a
      // coordinate, and an empty map of the country is a truer statement of
      // that than a map of the null island.
      instance.fitBounds(L.latLngBounds([26.35, 80.05], [30.45, 88.2]), FIT)
    }

    map.current = instance

    return () => {
      observer.disconnect()
      instance.remove()
      map.current = null
    }
  }, [])

  // Kept out of the effect above so waking the map does not rebuild it.
  useEffect(() => {
    if (live) map.current?.scrollWheelZoom.enable()
  }, [live])

  return (
    <div>
      {/* ── The readout ──────────────────────────────────────────────────
          OfficeMap's header line, repeated: what you are looking at on the
          left, how much of it there is on the right. The two maps on this page
          are the same instrument at two scales, and they announce themselves
          the same way. */}
      <div className="flex items-center justify-between gap-6 border-b border-ink-900/12 pb-4">
        {/* The legend is the readout. Two counts, each next to the mark it
            belongs to, so the two pin styles on the map are explained before
            anybody has to work them out. */}
        <p className={cn('flex min-w-0 items-center gap-3 text-ink-800', META)}>
          <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-brand-500" />
          <span className="truncate tabular-nums">{BRANCH_COUNT} branches</span>
        </p>

        <p className={cn('flex shrink-0 items-center gap-3 text-ink-500', META)}>
          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-full border-2 border-ink-900 bg-white"
          />
          <span className="tabular-nums">{POINT_COUNT} sales points</span>
        </p>
      </div>

      <div className="relative mt-4">
        <div
          ref={holder}
          // Only once the map is awake, and that condition is the whole point.
          //
          // Lenis owns the wheel on this site — it listens on the window and
          // preventDefaults — so Leaflet never saw a wheel event and enabling
          // `scrollWheelZoom` on its own did nothing. `data-lenis-prevent` is
          // Lenis's documented opt-out for an inner scroller (see
          // [[SmoothScroll]] and the `lenis.css` import in index.css), and it
          // hands the wheel over.
          //
          // Set unconditionally it would break the gate in the other
          // direction: Lenis would stop scrolling the page over the map while
          // Leaflet was still refusing to zoom, so the wheel would do nothing
          // at all and the map would read as a dead spot on the page.
          {...(live ? { 'data-lenis-prevent': '' } : {})}
          role="application"
          aria-label="Map of the MV Dugar auto division network in Nepal"
          // `isolate` is load-bearing, not tidiness: Leaflet's panes carry
          // z-index 400-700 and the container does not create a stacking
          // context of its own, so without this the tiles paint over the fixed
          // navbar the moment the map scrolls under it.
          className="relative z-0 isolate h-[340px] w-full border border-ink-900/12 bg-ink-50 sm:h-[460px] lg:h-[560px]"
        />

        {/* The gate. Pressing anywhere hands the wheel to the map; until then
            the page keeps the scroll. Dragging works either way, which is why
            this sits in a corner rather than over the whole plate. */}
        {!live && (
          <button
            type="button"
            onClick={() => setLive(true)}
            className={cn(
              META,
              'absolute top-4 left-4 z-[1100] inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-ink-900',
              'shadow-[0_18px_40px_-24px_rgba(5,5,5,0.45)] ring-1 ring-ink-900/[0.06]',
              'transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
            )}
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-500" />
            Tap to zoom the map
          </button>
        )}
      </div>
    </div>
  )
}
