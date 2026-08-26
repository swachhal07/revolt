import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { backend } from '../data'
import { blankRecord, COLLECTIONS, fieldGroups, validate } from '../data/schema'
import { FieldControl } from '../fields'
import { PageHead } from '../Shell'
import {
  Action,
  Confirm,
  DATA,
  EDGE,
  Lamp,
  LEGEND,
  PROSE,
  Panel,
  PanelFoot,
  PanelHead,
  State,
  Tag,
} from '../ui'

/**
 * The editor for any record in any collection. One screen, driven by the
 * schema's `fields`.
 *
 * The form is one page of prose-and-controls, divided by space. A half-width
 * field takes one column, a full-width one spans both, and nothing is drawn
 * between them — the grid used to be a hairline lattice with every field in its
 * own bay, which read as a wiring schedule on graphite and as a spreadsheet on
 * paper. Ruling a form twice over is what makes it look complicated: the labels
 * and the wells are already the structure, and the gaps are enough to group
 * them. What is left is a sheet you fill in.
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

  // A new record is blank from the very first render, not from the effect that
  // used to fill it. Deriving it in an effect left one render where `record` was
  // null while `loading` was already false — nothing rendered a loading state,
  // so the body ran and dereferenced null, and every "New …" button in the tool
  // opened a blank screen. An existing record survived only because `loading`
  // starts true for it and holds the body back until the adapter answers.
  //
  // Lazy, so `blankRecord` is not rebuilt on every render, and guarded on the
  // schema so an unknown collection reaches its own error state below instead of
  // throwing in here first.
  const [record, setRecord] = useState(() => (isNew && schema ? blankRecord(collection) : null))
  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  // Whether the "leave without saving" question is up. Only ever true while
  // `dirty` is — see `leave` below.
  const [leaving, setLeaving] = useState(false)

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

    // Nothing to fetch for a new record — the initial state already holds a
    // blank one.
    if (isNew) return

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

  // Leaving is two steps when there is something to lose. `leave` is what the
  // controls call — the back link in the head and Discard on the foot — and it
  // either goes or raises the question; `abandon` is the answer to it.
  //
  // The browser's own unload guard is still in place below and still looks like
  // the browser, because that one is not ours to draw: closing the tab is the
  // platform's event and the platform's dialog. This covers every exit the app
  // itself owns, which is all of them but that.
  const leave = () => {
    if (dirty) {
      setLeaving(true)
      return
    }
    navigate(`/admin/${collection}`)
  }

  const abandon = () => {
    setLeaving(false)
    navigate(`/admin/${collection}`)
  }

  if (!schema) {
    return (
      <State
        kind="error"
        title="No such collection"
        detail={`Nothing is registered under “${collection}”.`}
      />
    )
  }

  if (loading) return <State kind="loading" title="Reading" />

  if (loadError) {
    return (
      <State kind="error" title="Could not open" detail={loadError}>
        <Link
          to={`/admin/${collection}`}
          className={cn(
            LEGEND,
            'rounded-[2px] border bg-rig-900 px-3 py-2.5 text-lume-100 bezel',
            'transition-colors hover:border-lume-600',
            EDGE,
          )}
        >
          Back to {schema.label}
        </Link>
      </State>
    )
  }

  // Last, and after the error state so a failed read still reports itself: the
  // body cannot run without a record, and it says so here rather than relying on
  // some other flag happening to be true at the right moment.
  if (!record) return <State kind="loading" title="Reading" />

  const commitLabel = isNew ? `Create ${schema.singular}` : 'Save'
  const sections = fieldGroups(collection)

  return (
    <>
      <PageHead
        eyebrow={
          <button
            type="button"
            onClick={leave}
            className={cn(
              'underline decoration-rig-700 underline-offset-4 transition-colors hover:text-lume-100',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt-400',
            )}
          >
            ← {schema.label}
          </button>
        }
        title={isNew ? `New ${schema.singular}` : schema.title(record)}
      >
        {dirty && <Tag tone="warn">Unsaved</Tag>}
        {!dirty && saved && <Tag tone="live">Saved</Tag>}
        <Action variant="primary" arrow={!saving} onClick={save} disabled={saving}>
          {saving ? 'Saving' : commitLabel}
        </Action>
      </PageHead>

      {saveError && (
        <div
          role="alert"
          className="mb-6 rounded-[2px] border border-brand-500/60 bg-brand-900/20 px-3.5 py-3"
        >
          <p className={cn(LEGEND, 'flex items-center gap-2 text-brand-400')}>
            <Lamp alarm />
            Not saved
          </p>
          <p className={cn(PROSE, 'mt-2 text-lume-400')}>{saveError}</p>
        </div>
      )}

      {/* `sheet` is the whole light-surface switch: it re-points the palette for
          everything below it, so the form is white paper while the rail, the
          page head and the commit buttons above stay part of the dark rig. */}
      <Panel className="sheet animate-power-on" style={{ animationDelay: '120ms' }}>
        <PanelHead
          label={schema.singular}
          alarm={Object.values(errors).some(Boolean)}
          unit={isNew ? 'New record' : record[schema.idField]}
        />

        {sections.map((section, position) => (
          <section
            key={section.label ?? position}
            // One hairline per section, and it is the only rule inside the sheet.
            // A twenty-field form with no divisions is a wall you read in order
            // and cannot re-enter, so the groups stay — but a named group needs a
            // line above it and nothing else. The first one is already sitting
            // under the panel header.
            className={cn('px-4 py-6 sm:px-6', position > 0 && cn('border-t', EDGE))}
          >
            {section.label && (
              <h3 className={cn(LEGEND, 'mb-5 flex items-center gap-2.5 text-lume-600')}>
                <span className={cn(DATA, 'text-lume-600/70')}>
                  {String(position + 1).padStart(2, '0')}
                </span>
                {section.label}
              </h3>
            )}

            {/* Cells stretch to the row rather than sitting at the top of it, so
                `Field` can put its label at the head and its well at the foot
                and the two columns line up on both. */}
            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {section.fields.map((field) => (
                // The anchor `save` scrolls to. On the whole field rather than
                // the input, so the label and its help come into view with it.
                <div
                  key={field.name}
                  id={`field-${field.name}`}
                  className={cn(
                    'min-w-0',
                    field.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2',
                  )}
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
          </section>
        ))}

        {/* The commit repeated at the foot. This form is longer than a viewport
            and the writer finishes at the end of it — sending them back to the
            top to commit is a scroll for nothing. */}
        <PanelFoot>
          <Action variant="bare" onClick={leave}>
            Discard
          </Action>
          <Action variant="primary" arrow={!saving} onClick={save} disabled={saving}>
            {saving ? 'Saving' : commitLabel}
          </Action>
        </PanelFoot>
      </Panel>

      {/* Red, and the only dialog in the tool that is: this one destroys work.
          The commit is labelled with what it does rather than with "OK", so the
          two halves of the question can be told apart without reading the
          sentence above them — which is how a confirmation is actually used
          after the third time you have seen it. */}
      <Confirm
        open={leaving}
        title="Leave without saving"
        detail={`The changes on this sheet have not been committed. Leaving now returns you to ${schema.label} and they are gone.`}
        confirmLabel="Discard changes"
        variant="danger"
        onCancel={() => setLeaving(false)}
        onConfirm={abandon}
      />
    </>
  )
}
