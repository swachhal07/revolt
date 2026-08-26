import { useEffect, useState } from 'react'
import { backend } from '@/admin/data'

/**
 * Read one of the admin's collections on a public page.
 *
 * The site used to render straight from `src/data/*.js`, which meant the admin
 * and the website were two separate sources of truth: a portrait set in the back
 * office went into the store and the page carried on rendering the static file,
 * so the edit appeared to do nothing. This is the seam that closes that.
 *
 * It goes through the same `backend` adapter the admin uses, which is what makes
 * it work in both configurations without a second code path — against
 * `localStorage` in development and against the API once `VITE_ADMIN_BACKEND=http`
 * is set. The public pages do not know or care which is answering.
 *
 * ── The fallback is the important part ──────────────────────────────────────
 * `fallback` is the static array the page used to import, and it is returned
 * whenever the store cannot answer *or* answers with nothing. A catalogue page
 * that renders empty because a request failed is worse than one showing slightly
 * stale content — the site is the shop window, and an empty lineup reads as a
 * broken business rather than as a failed fetch. So a read error is not
 * propagated to the page at all; it is reported once to the console and the
 * bundled data is served.
 *
 * That also means a first visit before anything has been seeded looks exactly
 * like it always did, which is why this could be fitted one page at a time.
 *
 * `ready` is for the rare caller that needs to distinguish "still loading" from
 * "loaded and this is genuinely what there is". Most do not: they render the
 * fallback immediately and swap when the real answer lands, which for a
 * localStorage adapter is one frame and for the API is a few hundred
 * milliseconds against content that was already correct.
 */
export function useCollection(name, fallback = []) {
  const [records, setRecords] = useState(fallback)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let live = true

    backend
      .list(name)
      .then((rows) => {
        if (!live) return
        // An empty store is not an answer worth rendering — see the note above.
        setRecords(Array.isArray(rows) && rows.length > 0 ? rows : fallback)
        setReady(true)
      })
      .catch((error) => {
        if (!live) return
        // Logged rather than surfaced. Nothing on a public page should turn a
        // failed read into a visible fault, and the fallback is already correct.
        console.error(`Could not read "${name}", showing bundled data instead.`, error)
        setRecords(fallback)
        setReady(true)
      })

    return () => {
      live = false
    }
    // `fallback` is a module-level constant at every call site, so it is stable
    // and deliberately not a dependency — listing it would re-run the read on
    // every render for any caller that passed an inline array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  return { records, ready }
}

/**
 * The catalogue, as the public pages want it: one array in showroom order.
 *
 * `motorcycles` has no `sortBy` in the schema, so the store answers in its own
 * order and that order is the showroom's — the same contract the bundled array
 * has always had, where position 0 is the bike a visitor meets first.
 *
 * Everything the lineup derives from this is keyed by slug, never by index (see
 * `splitLineup` and `FLAGSHIP` in `data/motorcycles`), so a model added in the
 * back office lands in the rail rather than silently promoting itself to a
 * hero or to the bike the home page quotes its figures from.
 */
export function useLineup(fallback) {
  const { records, ready } = useCollection('motorcycles', null)

  return { bikes: records ?? fallback, ready }
}

/**
 * The leadership roster, split into the two tiers the page prints.
 *
 * The admin stores both in one collection with a `tier` field, because they are
 * the same record filed under two headings. The page needs them as two lists in
 * rank order, and that reshaping belongs here rather than in the component —
 * `Leadership` should read two arrays, the way it always did.
 *
 * Sorted by `order`, with anything unranked last: a roster is ranked and a
 * register is not, so a person added without a number should land at the bottom
 * rather than jumping the chairman.
 */
export function useLeadership(fallbackBoard, fallbackManagement) {
  const { records, ready } = useCollection('leadership', null)

  // No store answer yet, or none worth using: hand back exactly what the page
  // used to import.
  if (!records) return { board: fallbackBoard, management: fallbackManagement, ready }

  const tier = (want, fallback) => {
    const rows = records
      .filter((person) => person.tier === want)
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))

    // A store that holds records but none for this tier — a half-filled
    // collection — still falls back, so one empty tier cannot blank a band.
    return rows.length > 0 ? rows : fallback
  }

  return {
    board: tier('board', fallbackBoard),
    management: tier('management', fallbackManagement),
    ready,
  }
}
