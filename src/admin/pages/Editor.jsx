import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { backend } from '../backend'
import { blankRecord, COLLECTIONS, validate } from '../backend/schema'
import { FieldControl } from '../fields'
import { PageHead } from '../Shell'
import { Action, CELL, EDGE, MICRO, Rule, SHEET, State, Tag, Zone, ZoneHead } from '../ui'

/**
 * The editor for any record in any collection. One screen, driven by the schema's
 * `fields`.
 *
 * Every field is its own compartment on the hairline grid rather than a control
 * floating in whitespace — a half-width field is one cell, a full-width one spans
 * both, and the rules between them are the gaps in the grid. That is what makes a
 * twenty-field form read as a printed schedule instead of a scroll.
 *
 * Two behaviours matter more than the layout:
 *
 * Validation runs on save, not on keystroke. A field that turns red while it is
 * still being typed into is telling somebody they are wrong before they have
 * finished being right.
 *
 * Leaving with unsaved edits is guarded, twice. This is a long form with
 * repeaters, and losing it to a mistaken click on the rail is the worst thing
 * this screen could do — so `dirty` gates both the in-app exit and the browser's
 * own unload.
 */
export default function Editor() {
  const { collection, id } = useParams()
  const navigate = useNavigate()
  const schema = COLLECTIONS[collection]
  const isNew = id === 'new'

  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  // Every id already taken, for the uniqueness check on a new record's slug. A
  // clash would otherwise surface from the adapter after the button already said
  // "Saving" — the error belongs on the field, before the request.
  const takenRef = useRef([])

  useEffect(() => {
    if (!schema) return

    let live = true

    backend
      .list(collection)
      .then((rows) => {
        if (live) takenRef.current = rows.map((row) => row[schema.idField])
      })
      .catch(() => {
        // Not fatal: losing the pre-check only means the adapter reports a clash,
        // which it does anyway.
      })

    return () => {
      live = false
    }
  }, [collection, schema])

  useEffect(() => {
    if (!schema) return

    if (isNew) {
      setRecord(blankRecord(collection))
      return
    }

    let live = true
    setLoading(true)

    backend
      .get(collection, id)
      .then((found) => {
        if (!live) return
        if (!found) setLoadError(`Nothing on file at “${id}”.`)
        // Merged over a blank so a record written before a field existed still
        // binds every control — see `blankRecord` on why absent and empty differ
        // for a React form.
        else setRecord({ ...blankRecord(collection), ...found })
        setLoading(false)
      })
      .catch((error) => {
        if (!live) return
        setLoadError(error.message)
        setLoading(false)
      })

    return () => {
      live = false
    }
  }, [collection, id, isNew, schema])

  // The browser's guard, for a reload or a closed tab — the in-app one cannot see
  // either.
  useEffect(() => {
    if (!dirty) return

    const warn = (event) => {
      event.preventDefault()
      // Required by the spec for the prompt to appear; the string is ignored by
      // every current browser, which show their own wording.
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = useCallback((name, value) => {
    setRecord((prev) => ({ ...prev, [name]: value }))
    setDirty(true)
    setSaved(false)
    // Clear this field's error only. Re-running the whole validation would put
    // errors back on fields the writer has not reached yet.
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }, [])

  const save = async () => {
    const taken = isNew ? takenRef.current : takenRef.current.filter((value) => value !== id)
    const found = validate(collection, record, taken)

    if (Object.keys(found).length > 0) {
      setErrors(found)
      setSaveError('')
      // Take the writer to the first problem: on a form this long the error can
      // be several screens above the button reporting it.
      document.getElementById(`field-${Object.keys(found)[0]}`)?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      })
      return
    }

    setSaving(true)
    setSaveError('')

    try {
      if (isNew) {
        const created = await backend.create(collection, record)
        setDirty(false)
        // `replace`, so back does not return to a "new" form that would create a
        // second copy on save.
        navigate(`/admin/${collection}/${created[schema.idField]}`, { replace: true })
      } else {
        await backend.update(collection, id, record)
        setDirty(false)
        setSaved(true)
        // The slug is the id, so changing it is a move and the URL has to follow —
        // otherwise the next save writes to a record that is no longer there.
        if (record[schema.idField] !== id) {
          navigate(`/admin/${collection}/${record[schema.idField]}`, { replace: true })
        }
      }
    } catch (error) {
      setSaveError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const leave = () => {
    if (dirty && !window.confirm('Leave without saving? The changes on this sheet will be lost.')) return
    navigate(`/admin/${collection}`)
  }

  if (!schema) {
    return <State kind="error" title="No such collection" detail={`Nothing is registered under “${collection}”.`} />
  }

  if (loading) return <State kind="loading" title="Reading" />

  if (loadError) {
    return (
      <State kind="error" title="Could not open" detail={loadError}>
        <Link to={`/admin/${collection}`} className={cn(MICRO, 'border px-3 py-2', EDGE)}>
          Back to {schema.label}
        </Link>
      </State>
    )
  }

  const commitLabel = isNew ? `Create ${schema.singular}` : 'Save'

  return (
    <>
      <PageHead
        eyebrow={
          <button type="button" onClick={leave} className="underline decoration-ink-950/30 underline-offset-4">
            ← {schema.label}
          </button>
        }
        title={isNew ? `New ${schema.singular}` : schema.title(record)}
      >
        {dirty && <Tag tone="warn">Unsaved</Tag>}
        {!dirty && saved && <Tag tone="live">Saved</Tag>}
        <Action variant="primary" chevrons={!saving} onClick={save} disabled={saving}>
          {saving ? 'Saving' : commitLabel}
        </Action>
      </PageHead>

      {saveError && (
        <div role="alert" className={cn('mb-5 border', EDGE)}>
          <Rule hazard />
          <div className="px-3 py-3">
            <p className={cn(MICRO, 'text-brand-600')}>
              <span aria-hidden="true">/// </span>Not saved
            </p>
            <p className="mt-1.5 text-[12.5px] text-ink-950/75">{saveError}</p>
          </div>
        </div>
      )}

      <Zone>
        <ZoneHead label={schema.singular} unit={isNew ? 'New record' : record[schema.idField]} />

        {/* The compartment grid. Cells are paper on carbon, so the rules between
            fields are the gaps — no borders, and no doubled edge anywhere the two
            columns meet. */}
        <div className={cn('grid gap-px sm:grid-cols-2', SHEET)}>
          {schema.fields.map((field) => (
            // The anchor `save` scrolls to. On the compartment rather than the
            // input, so the label and its help come into view with it.
            <div
              key={field.name}
              id={`field-${field.name}`}
              className={cn(CELL, 'p-3', field.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2')}
            >
              <FieldControl
                field={field}
                value={record[field.name]}
                onChange={(value) => set(field.name, value)}
                error={errors[field.name]}
                record={record}
              />
            </div>
          ))}
        </div>

        {/* The commit repeated at the foot. This form is longer than a viewport and
            the writer finishes at the end of it — sending them back to the top to
            commit is a scroll for nothing. */}
        <div className={cn('flex flex-wrap items-center justify-between gap-3 border-t bg-news-200 px-3 py-2.5', EDGE)}>
          <Action variant="bare" onClick={leave}>
            Discard
          </Action>
          <Action variant="primary" chevrons={!saving} onClick={save} disabled={saving}>
            {saving ? 'Saving' : commitLabel}
          </Action>
        </div>
      </Zone>
    </>
  )
}
