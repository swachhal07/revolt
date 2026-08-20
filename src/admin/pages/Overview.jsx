import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { backend } from '../backend'
import { canUpload } from '../backend/media'
import { COLLECTIONS, COLLECTION_KEYS } from '../backend/schema'
import { PageHead } from '../Shell'
import { CELL, EDGE, MACRO, MICRO, Readout, SHEET, State, Tag, Zone, ZoneHead } from '../ui'

/**
 * The landing sheet: totals as macro numerals, then the work outstanding.
 *
 * The second half is what earns the screen. A dashboard of counts tells you
 * nothing you could not get by opening the list — a count of models is not a
 * decision. What is worth surfacing is what is unfinished: models with no price,
 * models with no cutout, posts still in draft. Those are the reasons somebody
 * opened this tool, and they are set as a manifest — a numbered, ruled table,
 * which is what this idiom does with a list of exceptions.
 */
export default function Overview() {
  const [state, setState] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    let live = true

    Promise.all(COLLECTION_KEYS.map((key) => backend.list(key)))
      .then((results) => {
        if (!live) return
        setState({
          loading: false,
          data: Object.fromEntries(COLLECTION_KEYS.map((key, i) => [key, results[i]])),
          error: null,
        })
      })
      .catch((error) => live && setState({ loading: false, data: null, error: error.message }))

    // Not ceremony: navigating away while the adapter is still resolving would
    // otherwise set state on an unmounted screen.
    return () => {
      live = false
    }
  }, [])

  if (state.loading) return <State kind="loading" title="Reading" />
  if (state.error) return <State kind="error" title="Could not read" detail={state.error} />

  const { motorcycles = [], posts = [] } = state.data
  const manifest = buildManifest(motorcycles, posts)

  return (
    <>
      <PageHead eyebrow="Revolt Nepal / Catalogue control" title="Overview" />

      {/* Hairlines by gap: the cells are paper on a carbon ground, so every rule
          between them is exactly 1px with no doubled edge. */}
      <div className={cn('grid gap-px border sm:grid-cols-2', SHEET, EDGE)}>
        {COLLECTION_KEYS.map((key) => (
          <div key={key} className={CELL}>
            <Readout
              label={`${COLLECTIONS[key].label} / on file`}
              value={String(state.data[key].length).padStart(2, '0')}
              href={
                // A real anchor styled as an action rather than a button that
                // navigates: this goes somewhere, so it should be copyable and
                // middle-clickable.
                <Link
                  to={`/admin/${key}`}
                  className={cn(
                    MICRO,
                    'inline-flex h-8 items-center gap-2 border px-3 transition-colors hover:bg-ink-950 hover:text-news-100',
                    EDGE,
                  )}
                >
                  Open <span aria-hidden="true">&gt;&gt;&gt;</span>
                </Link>
              }
            />
          </div>
        ))}
      </div>

      <Zone className="mt-6">
        <ZoneHead label="Manifest / needs attention" unit={`${String(manifest.length).padStart(2, '0')} items`} />

        {manifest.length === 0 ? (
          <State
            title="Nothing outstanding"
            detail="Every model has a price, a cutout and a photograph, and no post is sitting in draft."
          />
        ) : (
          <ul>
            {manifest.map((item, index) => (
              <li
                key={item.href + item.tag}
                className={cn(
                  'grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-3 gap-y-1 px-3 py-2.5',
                  // Ruled between rows only, so the list reads as a printed
                  // manifest rather than as a stack of cards.
                  index > 0 && 'border-t border-ink-950/15',
                )}
              >
                <span className={cn(MICRO, 'text-ink-950/35')}>{String(index + 1).padStart(2, '0')}</span>

                <div className="min-w-0">
                  <Link
                    to={item.href}
                    className={cn(MACRO, 'text-[15px] underline decoration-ink-950/25 decoration-1 underline-offset-4 hover:decoration-brand-600')}
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-[12.5px] leading-snug text-ink-950/55">{item.note}</p>
                </div>

                <Tag tone={item.tone}>{item.tag}</Tag>
              </li>
            ))}
          </ul>
        )}
      </Zone>

      {!canUpload && (
        <Zone className="mt-6">
          <ZoneHead label="Image uploading" unit="Not configured" />
          <div className="space-y-2 px-3 py-3 text-[12.5px] leading-[1.6] text-ink-950/65">
            <p>
              Image fields take a pasted URL and the upload button is disabled. To enable it, add an
              unsigned Cloudinary preset and set{' '}
              <code className={cn(MICRO, 'text-ink-950')}>VITE_CLOUDINARY_CLOUD_NAME</code> and{' '}
              <code className={cn(MICRO, 'text-ink-950')}>VITE_CLOUDINARY_UPLOAD_PRESET</code>.
            </p>
            <p>
              Unsigned specifically: a signed upload needs the API secret to build its signature, and
              a secret in a static frontend is public.
            </p>
          </div>
        </Zone>
      )}
    </>
  )
}

/**
 * The outstanding-work list.
 *
 * Every rule here is something the site handles gracefully but renders worse for
 * — a model with no price is skipped by anything ranking by money, a model with no
 * cutout falls back to a photograph that does not sit on white. So these are
 * prompts, never errors, and the wording says so.
 */
function buildManifest(motorcycles, posts) {
  const items = []

  for (const bike of motorcycles) {
    if (bike.priceNpr == null) {
      items.push({
        title: bike.name || bike.slug,
        href: `/admin/motorcycles/${bike.slug}`,
        note: 'No price, so it is left out of anything that ranks or quotes by money.',
        tag: 'No price',
        tone: 'neutral',
      })
    }

    if (!bike.studio) {
      items.push({
        title: bike.name || bike.slug,
        href: `/admin/motorcycles/${bike.slug}`,
        note: 'No studio cutout — the lineup rail and the nav menu have nothing to show on white.',
        tag: 'No cutout',
        tone: 'warn',
      })
    }
  }

  for (const post of posts) {
    if (post.status === 'draft') {
      items.push({
        title: post.title || post.slug,
        href: `/admin/posts/${post.slug}`,
        note: 'Draft, so it is invisible on the site.',
        tag: 'Draft',
        tone: 'draft',
      })
    }
  }

  return items
}
