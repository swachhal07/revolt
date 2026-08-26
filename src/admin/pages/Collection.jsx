import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { backend } from '../data'
import { thumbUrl } from '../data/media'
import { COLLECTIONS } from '../data/schema'
import { PageHead } from '../Shell'
import {
  Action,
  DATA,
  EDGE,
  GAUGE,
  Lamp,
  LEGEND,
  PROSE,
  Panel,
  PanelHead,
  State,
  Tag,
  TextInput,
  actionClass,
} from '../ui'

/**
 * The channel readout for any collection. One screen for all of them, driven by
 * the schema's `columns`.
 *
 * A table, tightly set. Cards are the reflex for anything with a photograph and
 * they are the wrong reflex: the job here is comparing records and finding one,
 * which wants rows the eye can run down a single column of. Density is the
 * feature — every row is 44px, values are monospace so digits align down the
 * column, and headers are the same `LEGEND` as everything else structural.
 *
 * The hovered row lights its leading edge volt, which is the same indication the
 * rail uses for the selected channel. One vocabulary for "this is the one you
 * are on", whether you got there with a pointer or a keyboard.
 *
 * The thumbnail is 36px and earns it, because "which RV1 is this" is a question
 * a name does not always answer.
 */
export default function Collection() {
  const { collection } = useParams()
  const schema = COLLECTIONS[collection]

  const [state, setState] = useState({ loading: true, rows: [], error: null })
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState(null)

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }))

    backend
      .list(collection)
      .then((rows) => setState({ loading: false, rows, error: null }))
      .catch((error) => setState({ loading: false, rows: [], error: error.message }))
  }, [collection])

  useEffect(load, [load])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return state.rows

    // Searched across the whole record rather than the title alone: looking for
    // "Neon Green" should find the model it is a colourway of, and a spec value
    // should find the model quoting it.
    return state.rows.filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
  }, [state.rows, query])

  /**
   * The register's rows, as the blocks the table draws.
   *
   * A collection with no `partition` gets exactly one unlabelled block, which is
   * what every register rendered before this existed — so the table below has one
   * code path rather than a branch, and adding the split to `leadership` did not
   * fork the screen every other collection also uses.
   *
   * Rows are numbered within their block, not across the register: the number is
   * a position in a roster, and continuing the count into the second block would
   * make the third person on the board and the first manager read as one ranking.
   */
  const blocks = useMemo(() => {
    if (!schema) return []

    const sorted = schema.sortBy
      ? // Copied first — `filtered` can be `state.rows` itself when no filter is
        // set, and sorting in place would mutate state and leave React unaware.
        [...filtered].sort((a, b) => (a[schema.sortBy] ?? Infinity) - (b[schema.sortBy] ?? Infinity))
      : filtered

    if (!schema.partition) return [{ label: null, note: null, rows: sorted }]

    const { field, groups } = schema.partition

    const known = groups.map((group) => ({
      label: group.label,
      note: group.note,
      rows: sorted.filter((row) => row[field] === group.value),
    }))

    // Anything whose tier is missing or unrecognised. It would otherwise be
    // filtered out of every block and vanish from the register while still
    // sitting in the store — invisible and uneditable, which is the worst place
    // for a record to be.
    const values = new Set(groups.map((group) => group.value))
    const stray = sorted.filter((row) => !values.has(row[field]))
    if (stray.length > 0) {
      known.push({ label: 'Unfiled', note: `No recognised ${field}.`, rows: stray })
    }

    return known
  }, [filtered, schema])

  if (!schema) {
    return (
      <State
        kind="error"
        title="No such collection"
        detail={`Nothing is registered under “${collection}”.`}
      />
    )
  }

  const remove = async (id) => {
    try {
      await backend.remove(collection, id)
      setPending(null)
      load()
    } catch (error) {
      setState((prev) => ({ ...prev, error: error.message }))
    }
  }

  return (
    <>
      <PageHead eyebrow="Register" title={schema.label} count={state.rows.length}>
        <TextInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="FILTER"
          aria-label={`Filter ${schema.label.toLowerCase()}`}
          className={cn(LEGEND, 'h-9 w-full sm:w-44')}
        />
        <Link to={`/admin/${collection}/new`} className={actionClass({ variant: 'primary' })}>
          New {schema.singular} <span aria-hidden="true">▸</span>
        </Link>
      </PageHead>

      <Panel className="animate-power-on" style={{ animationDelay: '120ms' }}>
        <PanelHead
          label={`${schema.label} / index`}
          unit={
            query
              ? `${String(filtered.length).padStart(2, '0')} matched`
              : `${String(state.rows.length).padStart(2, '0')} total`
          }
        />

        {state.loading ? (
          <State kind="loading" title="Reading" />
        ) : state.error ? (
          <State kind="error" title="Could not read" detail={state.error}>
            <Action onClick={load}>Retry</Action>
          </State>
        ) : filtered.length === 0 ? (
          <State
            title={query ? 'No match' : `No ${schema.label.toLowerCase()} on file`}
            detail={query ? `Nothing in the register contains “${query}”.` : undefined}
          >
            {query ? (
              <Action onClick={() => setQuery('')}>Clear filter</Action>
            ) : (
              <Link to={`/admin/${collection}/new`} className={actionClass({ variant: 'primary' })}>
                Create the first <span aria-hidden="true">▸</span>
              </Link>
            )}
          </State>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-rig-700 bg-rig-900">
                  <th scope="col" className={cn(LEGEND, 'w-12 px-3 py-2.5 text-lume-600')}>
                    №
                  </th>
                  <th scope="col" className="w-12" />
                  {schema.columns.map((column) => (
                    <th
                      key={column.name}
                      scope="col"
                      className={cn(LEGEND, 'px-3 py-2.5 text-lume-400')}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th scope="col" className="w-44">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              {blocks.map((block, blockIndex) => (
                // A `tbody` per block rather than a header row faked inside one:
                // a roster is a grouping the table structure can actually state,
                // and a `tr` full of `td`s pretending to be a heading is invisible
                // to anything reading the table as a table.
                <tbody key={block.label ?? blockIndex}>
                  {block.label && (
                    <tr>
                      <th
                        scope="colgroup"
                        colSpan={schema.columns.length + 3}
                        className={cn(
                          'border-y bg-rig-900 px-3 py-2.5 text-left',
                          // The first block sits directly under the column
                          // headers, which are already a rule.
                          blockIndex === 0 && 'border-t-0',
                          EDGE,
                        )}
                      >
                        <span className={cn(LEGEND, 'flex flex-wrap items-baseline gap-x-3 gap-y-1')}>
                          <span className="flex items-center gap-2.5 text-lume-100">
                            <Lamp live={block.rows.length > 0} />
                            {block.label}
                          </span>
                          <span className={cn(DATA, 'text-lume-600')}>
                            {String(block.rows.length).padStart(2, '0')}
                          </span>
                          {block.note && (
                            <span className={cn(PROSE, 'normal-case tracking-normal text-lume-600')}>
                              {block.note}
                            </span>
                          )}
                        </span>
                      </th>
                    </tr>
                  )}

                  {block.rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={schema.columns.length + 3}
                        className={cn(LEGEND, 'px-3 py-4 text-lume-600')}
                      >
                        Nobody on file
                      </td>
                    </tr>
                  )}

                  {block.rows.map((row, index) => {
                    const id = row[schema.idField]
                    const href = `/admin/${collection}/${id}`

                    return (
                      <tr
                        key={id}
                        className={cn(
                          'group relative h-11 transition-colors hover:bg-rig-900',
                          index > 0 && 'border-t border-rig-700/45',
                        )}
                      >
                      <td className={cn(LEGEND, DATA, 'relative px-3 text-lume-600')}>
                        {/* The lit leading edge, drawn inside the first cell
                            because a `tr` cannot carry a positioned child in
                            every engine. */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 w-0.5 bg-transparent transition-colors group-hover:bg-volt-400"
                        />
                        {String(index + 1).padStart(2, '0')}
                      </td>

                      <td className="py-1.5">
                        <Thumb src={row.studio || row.cover || row.photo || row.image} />
                      </td>

                      {schema.columns.map((column, position) => (
                        <td key={column.name} className="px-3 align-middle">
                          {position === 0 ? (
                            // Only the first cell links. A whole row wrapped in
                            // an anchor cannot hold the delete control, and a
                            // row-level onClick steals every text selection.
                            <Link
                              to={href}
                              className={cn(
                                GAUGE,
                                'text-[14px] text-lume-100 underline decoration-transparent decoration-1 underline-offset-[5px]',
                                'transition-colors group-hover:decoration-rig-700 hover:text-volt-700',
                                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt-400',
                              )}
                            >
                              {schema.title(row)}
                            </Link>
                          ) : (
                            <Cell column={column} value={row[column.name]} />
                          )}
                        </td>
                      ))}

                      <td className="px-3 text-right">
                        {/* Confirmation is the cell becoming its own question. A
                            dialog for one destructive click is a second surface
                            to design, focus to trap and Escape to handle — and it
                            covers the row you were deciding about. */}
                        {pending === id ? (
                          <span className="inline-flex items-center gap-1">
                            <Action size="sm" variant="danger" onClick={() => remove(id)}>
                              Confirm
                            </Action>
                            <Action
                              size="sm"
                              variant="bare"
                              onClick={() => setPending(null)}
                              aria-label="Cancel"
                            >
                              ×
                            </Action>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            {/* Edit is stated, not implied. The record's name is
                                a link too, but a name that only reveals itself as
                                one on hover is not an affordance — it is a thing
                                you have to already know. This is the row's
                                primary verb and it is on the row, always, and it
                                is reachable by touch where no hover exists.

                                Delete is beside it and stays quiet: visible
                                enough to find without hunting, never competing
                                with the action you actually came to perform. */}
                            <Link
                              to={href}
                              className={actionClass({ size: 'sm' })}
                              aria-label={`Edit ${schema.title(row)}`}
                            >
                              Edit <span aria-hidden="true">▸</span>
                            </Link>
                            <Action
                              size="sm"
                              variant="bare"
                              onClick={() => setPending(id)}
                              aria-label={`Delete ${schema.title(row)}`}
                              className="hover:!text-brand-400"
                            >
                              Delete
                            </Action>
                          </span>
                        )}
                      </td>
                      </tr>
                    )
                  })}
                </tbody>
              ))}
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}

function Thumb({ src }) {
  return (
    <span
      className={cn(
        'grid size-9 place-items-center overflow-hidden rounded-[2px] border bg-rig-900 inset-well',
        EDGE,
      )}
      aria-hidden="true"
    >
      {src ? (
        <img src={thumbUrl(src, 72)} alt="" className="size-full object-contain" loading="lazy" />
      ) : (
        <span className={cn(LEGEND, 'text-rig-700')}>—</span>
      )}
    </span>
  )
}

/**
 * A cell, formatted by what the column declares it holds.
 *
 * Declared rather than inferred from the value: a number could be a price or a
 * read time, and guessing gets it wrong exactly when a zero is meaningful.
 */
function Cell({ column, value }) {
  if (column.format === 'npr') {
    return value == null ? (
      <span className={cn(LEGEND, 'text-lume-600')}>Unannounced</span>
    ) : (
      <data className={cn(DATA, 'text-[13px] text-lume-100')}>
        {Number(value).toLocaleString('en-IN')}
      </data>
    )
  }

  if (column.format === 'count') {
    return (
      <data className={cn(DATA, 'text-[13px] text-lume-400')}>
        {Array.isArray(value) ? String(value.length).padStart(2, '0') : '00'}
      </data>
    )
  }

  // A plain integer, not a measurement and not a count of anything — a rank.
  // Unpadded, because `010` reads as a serial number and the whole point of the
  // gaps in the sequence is that they are visible.
  if (column.format === 'rank') {
    return value == null ? (
      <span className={cn(LEGEND, 'text-lume-600')}>—</span>
    ) : (
      <data className={cn(DATA, 'text-[13px] text-lume-400')}>{value}</data>
    )
  }

  if (column.format === 'date') {
    return <data className={cn(DATA, 'text-[13px] text-lume-400')}>{value || '—'}</data>
  }

  if (column.format === 'status') {
    return value === 'published' ? <Tag tone="live">Live</Tag> : <Tag tone="draft">Draft</Tag>
  }

  return <span className={cn(LEGEND, 'text-lume-400')}>{value || '—'}</span>
}
