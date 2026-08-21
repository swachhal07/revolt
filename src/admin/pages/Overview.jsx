import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { backend } from '../data'
import { canUpload } from '../data/media'
import { COLLECTIONS, COLLECTION_KEYS } from '../data/schema'
import { PageHead } from '../Shell'
import {
  DATA,
  EDGE,
  GAUGE,
  LEGEND,
  PROSE,
  Panel,
  PanelHead,
  Readout,
  State,
  Tag,
  VOID,
  actionClass,
} from '../ui'

/**
 * The instrument face: totals as gauges, then the work outstanding.
 *
 * The second half is what earns the screen. A dashboard of counts tells you
 * nothing you could not get by opening the list — a count of models is not a
 * decision. What is worth surfacing is what is unfinished: models with no price,
 * models with no cutout, posts still in draft. Those are the reasons somebody
 * opened this tool, and they are set as a fault list — numbered, ruled, each row
 * lamped by severity, which is what a cluster does with a set of exceptions.
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

  const { motorcycles = [], posts = [], leadership = [] } = state.data
  const faults = buildFaults(motorcycles, posts, leadership)

  return (
    <>
      <PageHead eyebrow="Revolt Nepal / Catalogue control" title="Overview" />

      {/* Hairlines by gap: the gauges are panel faces on the void, so every rule
          between them is exactly 1px with no doubled edge where two meet. */}
      <div
        className={cn(
          'grid gap-px overflow-hidden rounded-[2px] border bezel sm:grid-cols-2 lg:grid-cols-3',
          VOID,
          EDGE,
        )}
      >
        {COLLECTION_KEYS.map((key, position) => (
          <div key={key} className="knurl bg-rig-950">
            <Readout
              // Staggered by index, so the cluster comes up left to right rather
              // than all at once. 90ms is short enough to read as one movement.
              delay={position * 90}
              label={`${COLLECTIONS[key].label} / on file`}
              value={String(state.data[key].length).padStart(2, '0')}
              action={
                // Both ways into the collection, on the gauge that counts it.
                // Creating used to be reachable only by opening the register
                // first and finding the button in its header, which is a step of
                // hide-and-seek in front of the single most common task this
                // tool exists for. The count and the two things you can do about
                // it belong on the same instrument.
                //
                // Real anchors rather than buttons that navigate: both of these
                // go somewhere, so both should be copyable, middle-clickable and
                // openable in a new tab.
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/admin/${key}/new`} className={actionClass({ variant: 'primary' })}>
                    New {COLLECTIONS[key].singular} <span aria-hidden="true">▸</span>
                  </Link>
                  <Link to={`/admin/${key}`} className={actionClass()}>
                    Open register
                  </Link>
                </div>
              }
            />
          </div>
        ))}
      </div>

      <Panel className="animate-power-on mt-6" style={{ animationDelay: '220ms' }}>
        <PanelHead
          label="Fault list / needs attention"
          alarm={faults.length > 0}
          unit={`${String(faults.length).padStart(2, '0')} open`}
        />

        {faults.length === 0 ? (
          <State
            title="All clear"
            detail="Every model has a price, a cutout and a photograph, and no post is sitting in draft."
          />
        ) : (
          <ul>
            {faults.map((item, index) => (
              <li
                key={item.href + item.tag}
                className={cn(
                  'group grid grid-cols-[2.25rem_1fr] items-baseline gap-x-3 gap-y-2 px-3 py-3',
                  'sm:grid-cols-[2.25rem_1fr_auto]',
                  // Ruled between rows only, so the list reads as a printed fault
                  // log rather than as a stack of cards.
                  index > 0 && 'border-t border-rig-700/50',
                )}
              >
                <span className={cn(LEGEND, DATA, 'text-lume-600')}>
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0">
                  <Link
                    to={item.href}
                    className={cn(
                      GAUGE,
                      'text-[15px] text-lume-100 underline decoration-rig-700 decoration-1 underline-offset-[5px]',
                      'transition-colors hover:text-volt-300 hover:decoration-volt-400/60',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt-400',
                    )}
                  >
                    {item.title}
                  </Link>
                  <p className={cn(PROSE, 'mt-1.5 text-lume-600')}>{item.note}</p>
                </div>

                <div className="col-start-2 sm:col-start-3">
                  <Tag tone={item.tone}>{item.tag}</Tag>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {!canUpload && (
        <Panel className="animate-power-on mt-6" style={{ animationDelay: '280ms' }}>
          <PanelHead label="Image uploading" alarm unit="Not configured" />
          <div className={cn(PROSE, 'space-y-2.5 px-3 py-3.5')}>
            <p>
              Image fields take a pasted URL and the upload button is disabled. To enable it, add an
              unsigned Cloudinary preset and set{' '}
              <code className={cn(LEGEND, 'text-volt-300')}>VITE_CLOUDINARY_CLOUD_NAME</code> and{' '}
              <code className={cn(LEGEND, 'text-volt-300')}>VITE_CLOUDINARY_UPLOAD_PRESET</code>.
            </p>
            <p>
              Unsigned specifically: a signed upload needs the API secret to build its signature,
              and a secret in a static frontend is public.
            </p>
          </div>
        </Panel>
      )}
    </>
  )
}

/**
 * The outstanding-work list.
 *
 * Every rule here is something the site handles gracefully but renders worse for
 * — a model with no price is skipped by anything ranking by money, a model with
 * no cutout falls back to a photograph that does not sit on white. So these are
 * prompts, never errors, and the wording and the lamp tone both say so.
 */
function buildFaults(motorcycles, posts, leadership) {
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

  for (const person of leadership) {
    if (!person.photo) {
      items.push({
        title: person.name || person.slug,
        href: `/admin/leadership/${person.slug}`,
        // Not a defect: the page reserves the slot deliberately. It is listed
        // because a portrait arriving later is exactly the kind of thing that is
        // waited for and then forgotten about.
        note: 'No portrait — the leadership page holds a marked slot at the same aspect.',
        tag: 'No portrait',
        tone: 'neutral',
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
