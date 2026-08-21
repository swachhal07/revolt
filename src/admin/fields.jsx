import { useId, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { canUpload, thumbUrl, uploadImage } from './data/media'
import { slugify } from './data/schema'
import {
  Action,
  CONTROL_CLASS,
  DATA,
  EDGE,
  Field,
  Lamp,
  LEGEND,
  Select,
  TextArea,
  TextInput,
  VOID,
} from './ui'

/**
 * One schema field, rendered.
 *
 * `Editor` walks a collection's `fields` and hands each one here; nothing in this
 * file knows which collection it belongs to. An unrecognised `type` falls through
 * to a text input on purpose — a schema entry added faster than this file was
 * updated should still be editable rather than throwing a blank screen.
 */
export function FieldControl({ field, value, onChange, error, record }) {
  const id = useId()
  const invalid = Boolean(error)
  const common = { id, invalid, 'aria-describedby': error ? `${id}-error` : undefined }

  // A composite field has no single control to point a label at — `pairs` is a
  // table of inputs, `objects` a list of sub-forms, each already labelled. A `for`
  // naming an id that does not exist is worse than none: it reads as correctly
  // labelled to anything checking, while a screen reader lands on nothing.
  const composite = field.type === 'pairs' || field.type === 'objects' || field.type === 'colorpair'

  let control

  switch (field.type) {
    case 'textarea':
      control = (
        <TextArea
          {...common}
          value={value ?? ''}
          rows={field.name === 'intro' || field.name === 'standfirst' ? 4 : 3}
          onChange={(event) => onChange(event.target.value)}
        />
      )
      break

    case 'number':
      control = (
        <TextInput
          {...common}
          type="number"
          inputMode="numeric"
          value={value ?? ''}
          className={cn(DATA, 'text-[14px]')}
          // Empty means "no value", not zero — a model with no announced price
          // must not become a model priced at nothing.
          onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))}
        />
      )
      break

    case 'date':
      control = (
        <TextInput
          {...common}
          type="date"
          value={value ?? ''}
          className={DATA}
          onChange={(event) => onChange(event.target.value)}
        />
      )
      break

    case 'select':
      control = (
        <Select
          {...common}
          options={field.options ?? []}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      )
      break

    case 'slug':
      control = <SlugInput {...common} field={field} value={value} onChange={onChange} record={record} />
      break

    case 'image':
      control = <ImageInput {...common} value={value} onChange={onChange} />
      break

    case 'pairs':
      control = <PairsInput field={field} value={value} onChange={onChange} />
      break

    case 'objects':
      control = <ObjectsInput field={field} value={value} onChange={onChange} />
      break

    case 'colorpair':
      control = <ColorPairInput value={value} onChange={onChange} />
      break

    default:
      control = <TextInput {...common} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />
  }

  return (
    <Field
      label={field.label}
      help={field.help}
      error={error}
      required={field.required}
      htmlFor={composite ? undefined : id}
    >
      {control}
      {error && (
        <span id={`${id}-error`} className="sr-only">
          {error}
        </span>
      )}
    </Field>
  )
}

/* -------------------------------------------------------------------------- */

/**
 * A slug, with a one-press generate from the field it derives from.
 *
 * It does not auto-follow that field as it is typed. A slug that rewrites itself
 * on every keystroke is harmless while a record is new and destructive once it is
 * published — the address has been shared by then, and somebody renaming a title
 * has no reason to expect the URL to move with it. So generating is a button, and
 * pressing it is a decision.
 */
function SlugInput({ field, value, onChange, record, ...props }) {
  const source = field.from ? record?.[field.from] : ''

  return (
    <div className="flex">
      <TextInput
        {...props}
        value={value ?? ''}
        placeholder="lower-case-with-hyphens"
        onChange={(event) => onChange(event.target.value)}
        className={cn(DATA, 'rounded-r-none text-[13px] tracking-[0.03em]')}
      />
      {field.from && (
        // Butted against the input rather than spaced from it: two controls that
        // operate on one value are one assembly, and a gap makes them two things.
        <Action
          onClick={() => onChange(slugify(source))}
          disabled={!source}
          title={`Generate from ${field.from}`}
          className="-ml-px rounded-l-none"
        >
          Generate
        </Action>
      )}
    </div>
  )
}

/**
 * An image field: a URL, plus an upload when Cloudinary is configured.
 *
 * The URL input is always present and never disabled, even with uploading
 * available. Every seeded record holds a bundled asset's URL, and being unable to
 * see or paste one would make half the catalogue uneditable — and pasting is
 * simply faster when the file is already hosted.
 *
 * The preview is the point of the field, not decoration. The value is a long
 * opaque string and the only reliable way to know it is the *right* long opaque
 * string is to look at the picture.
 */
function ImageInput({ value, onChange, ...props }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState('')

  const take = async (file) => {
    if (!file) return
    setFailure('')
    setBusy(true)

    try {
      onChange(await uploadImage(file))
    } catch (error) {
      setFailure(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-start gap-2.5">
        {/* Checkerboard behind the plate: the studio cutouts are transparent
            PNGs, and on a flat panel a cutout is indistinguishable from a
            missing image. Ink squares, because this field only ever renders
            inside the worksheet — the one light surface in the tool — and the
            cutouts are shot for white, so the check has to be what darkens. */}
        <div
          className={cn(
            'grid size-[4.5rem] shrink-0 place-items-center rounded-[2px] border bg-rig-900 inset-well',
            EDGE,
          )}
          style={{
            backgroundImage:
              'linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25% 75%, rgba(0,0,0,0.06) 75%), linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25% 75%, rgba(0,0,0,0.06) 75%)',
            backgroundSize: '10px 10px',
            backgroundPosition: '0 0, 5px 5px',
          }}
        >
          {value ? (
            <img
              src={thumbUrl(value, 160)}
              alt=""
              className="size-full object-contain"
              // A pasted URL can simply be wrong, and a broken-image glyph says
              // less than an empty plate does.
              onError={(event) => {
                event.currentTarget.style.visibility = 'hidden'
              }}
              onLoad={(event) => {
                event.currentTarget.style.visibility = 'visible'
              }}
            />
          ) : (
            <span className={cn(LEGEND, 'text-rig-700')}>Nil</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <TextInput
            {...props}
            value={value ?? ''}
            placeholder="https://…"
            onChange={(event) => onChange(event.target.value)}
            className={cn(DATA, 'text-[12.5px]')}
          />

          <div className="flex flex-wrap items-center gap-1.5">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(event) => take(event.target.files?.[0])}
            />
            <Action
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy || !canUpload}
              title={canUpload ? undefined : 'Cloudinary is not configured'}
            >
              {busy ? 'Uploading' : 'Upload'}
            </Action>
            {value && (
              <Action size="sm" variant="bare" onClick={() => onChange('')}>
                Clear
              </Action>
            )}
            {!canUpload && <span className={cn(LEGEND, 'text-lume-600')}>URL only</span>}
          </div>
        </div>
      </div>

      {failure && (
        <p role="alert" className={cn(LEGEND, 'flex items-center gap-2 text-brand-400')}>
          <Lamp alarm />
          {failure}
        </p>
      )}
    </div>
  )
}

/** The two tones a swatch disc is split between. */
function ColorPairInput({ value, onChange }) {
  const pair = Array.isArray(value) && value.length === 2 ? value : ['#000000', '#000000']

  const set = (index, next) => {
    const copy = [...pair]
    copy[index] = next
    onChange(copy)
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {pair.map((hex, index) => (
        <div key={index} className="flex">
          <input
            type="color"
            value={hex}
            onChange={(event) => set(index, event.target.value)}
            className={cn(
              'size-9 shrink-0 cursor-pointer rounded-[2px] rounded-r-none border bg-rig-900 p-1',
              EDGE,
            )}
            aria-label={index === 0 ? 'Primary tone' : 'Secondary tone'}
          />
          <input
            value={hex}
            onChange={(event) => set(index, event.target.value)}
            className={cn(CONTROL_CLASS, DATA, '-ml-px h-9 w-24 rounded-l-none py-0 text-[12px] uppercase')}
            aria-label={index === 0 ? 'Primary tone hex' : 'Secondary tone hex'}
          />
        </div>
      ))}

      {/* The disc as the site's picker actually draws it. Two colours chosen in
          isolation are guesswork; the split is the thing being chosen. */}
      <span
        aria-hidden="true"
        className={cn('size-9 shrink-0 rounded-full border', EDGE)}
        style={{ background: `linear-gradient(135deg, ${pair[0]} 50%, ${pair[1]} 50%)` }}
      />
    </div>
  )
}

/**
 * The spec sheet, as a description list.
 *
 * `<dl>` because that is precisely what this is — terms and their definitions —
 * and a spec table built from divs throws that away for nothing. Free-form rather
 * than a fixed set of rows, because the sheet genuinely differs per model: the
 * site's spec fold picks whichever figures a model has, so a fixed schema would
 * either invent absent values or refuse a real one.
 *
 * Keys are edited by rebuilding the entry list rather than mutating in place,
 * which is what keeps row order stable while somebody retypes a key.
 */
function PairsInput({ field, value, onChange }) {
  const entries = Object.entries(value ?? {})

  const setKey = (index, nextKey) =>
    onChange(Object.fromEntries(entries.map(([k, v], i) => (i === index ? [nextKey, v] : [k, v]))))

  const setValue = (index, nextValue) =>
    onChange(Object.fromEntries(entries.map(([k, v], i) => (i === index ? [k, nextValue] : [k, v]))))

  const remove = (index) => onChange(Object.fromEntries(entries.filter((_, i) => i !== index)))

  // One grid definition for the header and the rows, so a retyped key cannot
  // drift out of line with the column it is under.
  const TRACKS = 'grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_2.25rem]'

  return (
    <div className={cn('overflow-hidden rounded-[2px] border', EDGE)}>
      {entries.length === 0 ? (
        <p className={cn(LEGEND, 'bg-rig-900 px-3 py-3.5 text-lume-600')}>No rows</p>
      ) : (
        <>
          <div className={cn('grid border-b bg-rig-900', TRACKS, EDGE)}>
            <span className={cn(LEGEND, 'px-2.5 py-2.5 text-lume-600')}>
              {field.keyLabel ?? 'Key'}
            </span>
            <span className={cn(LEGEND, 'px-2.5 py-2.5 text-lume-600')}>
              {field.valueLabel ?? 'Value'}
            </span>
            <span />
          </div>

          <dl className={cn('grid gap-px', TRACKS, VOID)}>
            {entries.map(([key, val], index) => (
              // `dt`/`dd` pairs plus the remove control, laid on the same grid
              // tracks as the header. `display: contents` on a wrapper would break
              // the grid, so the three children sit directly in it.
              <div key={index} className="contents">
                <dt className="bg-rig-950">
                  <input
                    value={key}
                    onChange={(event) => setKey(index, event.target.value)}
                    aria-label={`${field.keyLabel ?? 'Key'} ${index + 1}`}
                    className={cn(
                      LEGEND,
                      'w-full border-0 bg-transparent px-2.5 py-3 text-lume-100',
                      'focus:bg-rig-900 focus:outline-none',
                    )}
                  />
                </dt>
                <dd className="bg-rig-950">
                  <input
                    value={val}
                    onChange={(event) => setValue(index, event.target.value)}
                    aria-label={`${field.valueLabel ?? 'Value'} ${index + 1}`}
                    className={cn(
                      DATA,
                      'w-full border-0 bg-transparent px-2.5 py-3 text-[13px] text-lume-100',
                      'focus:bg-rig-900 focus:outline-none',
                    )}
                  />
                </dd>
                <div className="grid place-items-center bg-rig-950">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Remove ${key || `row ${index + 1}`}`}
                    className={cn(
                      'grid size-full place-items-center text-lume-600 transition-colors',
                      'hover:bg-brand-600 hover:text-white',
                      'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-volt-400',
                    )}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </dl>
        </>
      )}

      <div className={cn('border-t bg-rig-900 px-2.5 py-2.5', EDGE)}>
        <Action size="sm" onClick={() => onChange({ ...(value ?? {}), '': '' })}>
          Add row
        </Action>
      </div>
    </div>
  )
}

/**
 * A repeater over `field.subfields` — colourways, highlights, and a post's body.
 *
 * One component for all three rather than three hand-written editors: they are the
 * same interaction (an ordered list of small records, added, reordered and
 * removed) and the only difference is which controls sit in a row, which the
 * schema already states.
 *
 * Reordering is two buttons, not drag-and-drop. Drag is nicer with a mouse and
 * unusable without one, and this is the control deciding which colourway a model
 * leads on — it has to work from a keyboard.
 */
function ObjectsInput({ field, value, onChange }) {
  const rows = Array.isArray(value) ? value : []

  const patch = (index, key, next) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: next } : row)))

  const remove = (index) => onChange(rows.filter((_, i) => i !== index))

  const move = (index, by) => {
    const to = index + by
    if (to < 0 || to >= rows.length) return
    const copy = [...rows]
    ;[copy[index], copy[to]] = [copy[to], copy[index]]
    onChange(copy)
  }

  const add = () => {
    const blank = {}
    for (const sub of field.subfields) {
      if (sub.type === 'colorpair') blank[sub.name] = ['#000000', '#000000']
      else if (sub.type === 'select') blank[sub.name] = sub.options?.[0]?.value ?? ''
      else blank[sub.name] = ''
    }
    onChange([...rows, blank])
  }

  return (
    <div className={cn('overflow-hidden rounded-[2px] border', EDGE)}>
      {rows.length === 0 ? (
        <p className={cn(LEGEND, 'bg-rig-900 px-3 py-3.5 text-lume-600')}>None</p>
      ) : (
        rows.map((row, index) => (
          <div key={index} className={cn(index > 0 && 'border-t', EDGE)}>
            <div className={cn('flex items-center justify-between gap-2 border-b bg-rig-900 px-2.5 py-2', EDGE)}>
              <span className={cn(LEGEND, 'flex items-center gap-2 text-lume-400')}>
                {/* The index is the label. These rows have no stable name of their
                    own — a colourway can be renamed, a body block never has a name
                    — and the position is what matters anyway, since the first entry
                    is the one the site leads on. */}
                <span className={cn(DATA, 'text-volt-400')}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                {field.addLabel && <span>{row.name || row.title || row.type || '—'}</span>}
              </span>

              <span className="flex items-center gap-0.5">
                <RowAction onClick={() => move(index, -1)} disabled={index === 0} label="Move up">
                  ↑
                </RowAction>
                <RowAction
                  onClick={() => move(index, 1)}
                  disabled={index === rows.length - 1}
                  label="Move down"
                >
                  ↓
                </RowAction>
                <RowAction onClick={() => remove(index)} label="Remove" danger>
                  ×
                </RowAction>
              </span>
            </div>

            <div className={cn('grid gap-px sm:grid-cols-2', VOID)}>
              {field.subfields.map((sub) => (
                <div
                  key={sub.name}
                  className={cn(
                    'bg-rig-950 p-2.5',
                    sub.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2',
                  )}
                >
                  <FieldControl
                    field={sub}
                    value={row[sub.name]}
                    onChange={(next) => patch(index, sub.name, next)}
                    record={row}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <div className={cn('border-t bg-rig-900 px-2.5 py-2.5', EDGE)}>
        <Action size="sm" onClick={add}>
          {field.addLabel ?? 'Add'}
        </Action>
      </div>
    </div>
  )
}

function RowAction({ onClick, disabled, label, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'grid size-6 place-items-center rounded-[2px] text-[12px] text-lume-600 transition-colors',
        'disabled:pointer-events-none disabled:opacity-25',
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-volt-400',
        danger ? 'hover:bg-brand-600 hover:text-white' : 'hover:bg-rig-850 hover:text-lume-100',
      )}
    >
      {children}
    </button>
  )
}
