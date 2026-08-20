import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { backend } from '../backend'
import { thumbUrl } from '../backend/media'
import { COLLECTIONS } from '../backend/schema'
import { PageHead } from '../Shell'
import { Action, DATA, EDGE, MACRO, MICRO, State, Tag, TextInput, Zone, ZoneHead } from '../ui'

/**
 * The register for any collection. One screen for all of them, driven by the
 * schema's `columns`.
 *
 * A table, tightly set. Cards are the reflex for anything with a photograph and
 * they are the wrong reflex: the job here is comparing records and finding one,
 * which wants rows the eye can run down a single column of. Density is the
 * feature — every row is 44px, values are monospace so digits align down the
 * column, and headers are the same `MICRO` as everything else structural.
 *
 * The thumbnail is 36px and earns it, because "which RV1 is this" is a question a
 * name does not always answer.
 */
export default function Collection() {
  const { collection } = useParams()
  const navigate = useNavigate()
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

  if (!schema) {
    return <State kind="error" title="No such collection" detail={`Nothing is registered under "${collection}".`} />
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
          className={cn(MICRO, 'h-9 w-full sm:w-44')}
        />
        <Action variant="primary" chevrons onClick={() => navigate(`/admin/${collection}/new`)}>
          New {schema.singular}
        </Action>
      </PageHead>

      <Zone>
        <ZoneHead
          label={`${schema.label} / index`}
          unit={query ? `${String(filtered.length).padStart(2, '0')} matched` : undefined}
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
              <Action variant="primary" chevrons onClick={() => navigate(`/admin/${collection}/new`)}>
                Create the first
              </Action>
            )}
          </State>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink-950/25 bg-news-200">
                  <th scope="col" className={cn(MICRO, 'w-10 px-3 py-2 text-ink-950/40')}>
                    №
                  </th>
                  <th scope="col" className="w-12" />
                  {schema.columns.map((column) => (
                    <th key={column.name} scope="col" className={cn(MICRO, 'px-3 py-2 text-ink-950/55')}>
                      {column.label}
                    </th>
                  ))}
                  <th scope="col" className="w-28" />
                </tr>
              </thead>

              <tbody>
                {filtered.map((row, index) => {
                  const id = row[schema.idField]
                  const href = `/admin/${collection}/${id}`

                  return (
                    <tr
                      key={id}
                      className={cn(
                        'group h-11 transition-colors hover:bg-news-200',
                        index > 0 && 'border-t border-ink-950/12',
                      )}
                    >
                      <td className={cn(MICRO, 'px-3 text-ink-950/35')}>
                        {String(index + 1).padStart(2, '0')}
                      </td>

                      <td className="py-1.5">
                        <Thumb src={row.studio || row.cover || row.image} />
                      </td>

                      {schema.columns.map((column, position) => (
                        <td key={column.name} className="px-3 align-middle">
                          {position === 0 ? (
                            // Only the first cell links. A whole row wrapped in an
                            // anchor cannot hold the delete control, and a
                            // row-level onClick steals every text selection.
                            <Link
                              to={href}
                              className={cn(
                                MACRO,
                                'text-[14px] underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-ink-950/40',
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
                            dialog for one destructive click is a second surface to
                            design, focus to trap and Escape to handle — and it
                            covers the row you were deciding about. */}
                        {pending === id ? (
                          <span className="inline-flex items-center gap-1">
                            <Action size="sm" variant="danger" onClick={() => remove(id)}>
                              Confirm
                            </Action>
                            <Action size="sm" variant="bare" onClick={() => setPending(null)}>
                              ×
                            </Action>
                          </span>
                        ) : (
                          <Action
                            size="sm"
                            variant="bare"
                            onClick={() => setPending(id)}
                            aria-label={`Delete ${schema.title(row)}`}
                            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                          >
                            Delete
                          </Action>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Zone>
    </>
  )
}

function Thumb({ src }) {
  return (
    <span
      className={cn('grid size-9 place-items-center overflow-hidden border bg-news-100', EDGE)}
      aria-hidden="true"
    >
      {src ? (
        <img src={thumbUrl(src, 72)} alt="" className="size-full object-contain" loading="lazy" />
      ) : (
        <span className={cn(MICRO, 'text-ink-950/30')}>—</span>
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
      <span className={cn(MICRO, 'text-ink-950/35')}>Unannounced</span>
    ) : (
      <data className={cn(DATA, 'text-[13px]')}>{Number(value).toLocaleString('en-IN')}</data>
    )
  }

  if (column.format === 'count') {
    return <data className={cn(DATA, 'text-[13px] text-ink-950/60')}>{Array.isArray(value) ? String(value.length).padStart(2, '0') : '00'}</data>
  }

  if (column.format === 'date') {
    return <data className={cn(DATA, 'text-[13px] text-ink-950/70')}>{value || '—'}</data>
  }

  if (column.format === 'status') {
    return value === 'published' ? <Tag tone="live">Live</Tag> : <Tag tone="draft">Draft</Tag>
  }

  return <span className={cn(MICRO, 'text-ink-950/70')}>{value || '—'}</span>
}
