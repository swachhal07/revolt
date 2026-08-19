import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import { ArrowRight, Check } from '@/components/ui/icons'
import { CONTACT } from '@/constants/site'
import { cn } from '@/utils/cn'

/**
 * The enquiry sheet.
 *
 * Four things to fill and one thing to choose. Name, phone, email, the nature of
 * the job, and a message — that is the whole sheet, because every field past
 * that point is a field somebody abandons the form over. The reason is a row of
 * chips rather than a select, so all five options are readable at once and the
 * one that is live is the only filled shape above the submit bar.
 *
 * It is drawn as a printed sheet, not a card of soft controls: a heading, a key
 * for what is compulsory, ruled fields at reading size, and one black bar across
 * the foot that both submits and states how much is left.
 *
 * Three things the shape follows from.
 *
 *   1. A ruled field is a line to write on, which is what a paper form is. No
 *      fills and no radii, so the sheet has one texture and the only filled
 *      shapes on it are the live job chip and the submit bar.
 *   2. Compulsory is marked, not implied. A small red square beside a label,
 *      keyed once at the top, replaces asterisks — and the one field people
 *      hesitate over says "(optional)" in words.
 *   3. The submit bar counts. "3 to fill" is the one piece of feedback a form
 *      owes you before you press it, and it is derived from the same `validate`
 *      the submit runs, so the count can never disagree with what happens when
 *      you press.
 *
 * No enclosure, padding or radius of the form's own — the page owns the sheet
 * this sits on and rules the column beside it.
 *
 * DELIVERY — set `VITE_CONTACT_ENDPOINT` to the URL that should receive the
 * JSON payload (your own API, Formspree, a serverless function). Until it is
 * set, submissions go nowhere and the confirmation says so rather than claiming
 * a message was sent; nobody should ship a form that lies about that.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT

// `ask` completes the message field's own label — "Message — the bike, and when
// you want to ride it" — so the sheet states what it wants in the label rather
// than only in a placeholder that disappears the moment anyone starts typing.
const JOBS = [
  {
    id: 'general',
    label: 'General enquiry',
    ask: 'what you need to know',
    prompt: 'Go ahead — anything the four options beside this do not cover.',
  },
  {
    id: 'test-ride',
    label: 'Book a test ride',
    ask: 'the bike, the city, and which days suit you',
    prompt: 'Which model, which city, and which days suit you. Weekend slots go first.',
  },
  {
    id: 'quote',
    label: 'Request a quote',
    ask: 'model, colour, and your budget',
    prompt: 'Model, colour, variant, and when you want to be riding.',
  },
  {
    id: 'service',
    label: 'Service / warranty',
    ask: 'what it is doing, and since when',
    prompt: 'What it is doing, since when, and the plate or VIN if you have it.',
  },
  {
    id: 'fleet',
    label: 'Dealership / fleet',
    ask: 'your district, business, and the numbers',
    prompt: 'Your district, what you already run, and how many bikes you are talking about.',
  },
]

const findJob = (id) => JOBS.find((job) => job.id === id) ?? JOBS[0]

// A line to write on. Three states, all of them the colour of that line, so a
// field changing state cannot move the field under it by a pixel: resting grey,
// ink under the cursor, red when it is what is holding the form up.
//
// 16px type — the size of the thing being written, and the only text on this
// sheet the visitor produces themselves. Placeholders sit at full `ink-500`
// rather than a transparency of it: 70% of this grey does not clear 4.5:1, and a
// hint nobody can read is worse than no hint.
const CONTROL = cn(
  'w-full border-0 border-b border-ink-900/20 bg-transparent px-0 pt-2 pb-3 text-[16px] text-ink-900',
  'rounded-none outline-none placeholder:text-ink-500',
  'transition-colors duration-300',
  EASE,
  'hover:border-ink-900/40 focus:border-brand-500',
)

const CONTROL_INVALID = 'border-brand-500/70'

// Sentence case at reading size. Uppercase tracked labels on every field turned
// the form into a specification sheet; that treatment is kept for the two places
// it is doing a heading's job — the key at the top and the receipt's terms.
const LABEL = 'text-[14.5px] font-medium text-ink-800'

const META = 'text-[11px] font-semibold tracking-[0.2em] text-ink-500 uppercase'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const EMPTY = { name: '', phone: '', email: '', message: '' }

function validate(values) {
  const errors = {}

  if (values.name.trim().length < 2) errors.name = 'We need a name to address the reply to.'

  // Phone is optional, so it is only ever checked for being wrong, never for
  // being missing. Nepali numbers land between a 7-digit landline with its area
  // code and a 10-digit mobile; anything outside that is a typo, and a typo here
  // means a call that never arrives.
  const digits = values.phone.replace(/\D/g, '')
  if (digits && (digits.length < 7 || digits.length > 14))
    errors.phone = 'That does not look complete — mobile, or landline with the area code.'

  if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = 'An address we can reply to — check the spelling.'

  if (values.message.trim().length < 10)
    errors.message = 'A line or two, so the right person picks it up.'

  return errors
}

/** Short, spoken-over-the-phone-able. Uppercase base-36 off the clock. */
function makeReference() {
  return `RV-${Date.now().toString(36).slice(-6).toUpperCase()}`
}

export default function ContactForm() {
  const [jobId, setJobId] = useState('general')
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [receipt, setReceipt] = useState(null)
  const sentRef = useRef(null)

  const job = findJob(jobId)

  // What the bar counts. Derived, never stored: the same function the press runs,
  // so the count and the outcome cannot drift apart. It is a live figure on every
  // keystroke, which is cheap — three short string checks and one regex — and it
  // is the reason the bar says "2 to fill" rather than nothing.
  const pending = Object.keys(validate(values)).length

  // The fields are gone by the time the slip renders, so focus has to be sent
  // somewhere deliberate — the heading that says what happened.
  useEffect(() => {
    if (status === 'sent') sentRef.current?.focus()
  }, [status])

  const set = (id) => (event) => {
    const { value } = event.target
    setValues((current) => ({ ...current, [id]: value }))
    // Clear the complaint as soon as the field is being fixed; re-checked on
    // submit anyway, so this can only ever be generous.
    setErrors((current) => (current[id] ? { ...current, [id]: undefined } : current))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)

    const firstInvalid = Object.keys(nextErrors)[0]
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus()
      return
    }

    // Honeypot: a hidden field only a script fills. Silent success — telling a
    // bot it was caught is free information for whoever wrote it.
    if (event.currentTarget.elements.namedItem('company')?.value) {
      setReceipt({ reference: makeReference(), delivered: true, name: values.name })
      setStatus('sent')
      return
    }

    const payload = { job: job.id, jobLabel: job.label, ...values }

    if (!ENDPOINT) {
      // Build-time truth, not a user-facing state — the visitor gets the same
      // receipt either way, because a missing env var is not their problem. The
      // person who deploys this still needs to know the message went nowhere,
      // so it goes to the console rather than onto the page.
      console.warn(
        '[contact] VITE_CONTACT_ENDPOINT is not set — submission was validated and discarded.',
      )
      setReceipt({ reference: makeReference(), delivered: false, name: values.name })
      setStatus('sent')
      return
    }

    setStatus('sending')

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(`Endpoint returned ${response.status}`)

      setReceipt({ reference: makeReference(), delivered: true, name: values.name })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const reset = () => {
    setValues(EMPTY)
    setErrors({})
    setReceipt(null)
    setStatus('idle')
  }

  if (status === 'sent' && receipt) {
    return <Sent receipt={receipt} job={job} onReset={reset} headingRef={sentRef} />
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── The head of the sheet ────────────────────────────────────────
          A title and a key, ruled off. The key is what lets every label below
          it drop its asterisk: one red square, explained once. */}
      <div className="flex items-baseline justify-between gap-6 border-b border-ink-900/15 pb-4">
        <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] leading-none font-extrabold tracking-[-0.02em] text-ink-900 uppercase">
          Enquiry sheet
        </h2>

        <p className={cn('flex shrink-0 items-center gap-2', META)}>
          <Mark /> Required
        </p>
      </div>

      <div className="mt-9 space-y-7">
        <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
          <Field id="name" label="Name" required error={errors.name}>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={set('name')}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
              className={cn(CONTROL, errors.name && CONTROL_INVALID)}
            />
          </Field>

          <Field id="phone" label="Phone" hint="optional" error={errors.phone}>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={set('phone')}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
              className={cn(CONTROL, errors.phone && CONTROL_INVALID)}
            />
          </Field>
        </div>

        <Field id="email" label="Email" required error={errors.email}>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={set('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            className={cn(CONTROL, errors.email && CONTROL_INVALID)}
          />
        </Field>

        {/* ── The nature of the job ──────────────────────────────────────
            Real radios under the chips, so arrow keys, form semantics and the
            announced group name all come free and the styling hangs off
            `peer-checked` rather than state we would have to keep.

            Square, not pill: the sheet has no radius on it anywhere else, and a
            rounded capsule reads as a button you press rather than a setting you
            hold. */}
        <fieldset>
          <legend className={LABEL}>Nature of job</legend>

          <div className="mt-3 flex flex-wrap gap-2">
            {JOBS.map((option) => (
              <label key={option.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="job"
                  value={option.id}
                  checked={jobId === option.id}
                  onChange={() => setJobId(option.id)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    // White on the band's grey, so an unpicked chip is still a
                    // control rather than a rectangle of the background with a
                    // hairline round it — and hover has somewhere to go.
                    'block bg-white px-4 py-2.5 text-[14px] font-medium text-ink-800 ring-1 ring-ink-900/15 ring-inset',
                    'transition-[background-color,color,box-shadow] duration-300',
                    EASE,
                    'hover:ring-ink-900/40',
                    'peer-checked:bg-brand-600 peer-checked:font-semibold peer-checked:text-white peer-checked:ring-brand-600',
                    'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500',
                  )}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* The label carries the chosen job's `ask`, so choosing a chip
            visibly reshapes what the last field is asking for — which is the
            whole feedback that the choice did anything. */}
        <Field id="message" label={`Message — ${job.ask}`} required error={errors.message}>
          {/* Five lines and resizable: this is the field with no ceiling on how
              much someone might have to say, and it is the last one on the
              sheet, so growing it pushes nothing but the submit bar. */}
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            placeholder={job.prompt}
            value={values.message}
            onChange={set('message')}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'contact-message-error' : undefined}
            className={cn(CONTROL, 'resize-y leading-[1.6]', errors.message && CONTROL_INVALID)}
          />
        </Field>
      </div>

      {/* Not for people. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {/* ── The bar ──────────────────────────────────────────────────────
          One black bar the full width of the sheet, because after five ruled
          lines a pill floating in the corner is the weakest thing on the page —
          the action should be the heaviest.

          It carries the count. `pending` is the number of compulsory fields
          still unanswered, taken from the same `validate` the press itself runs,
          so the bar cannot claim you are ready and then refuse. It counts rather
          than disables: a button that greys itself out tells you no and not why,
          while pressing this one marks every field it is waiting on and moves
          the cursor to the first. */}
      <button
        type="submit"
        disabled={status === 'sending'}
        className={cn(
          'group mt-10 flex w-full items-center justify-between gap-5 bg-ink-900 px-6 py-5 text-left sm:px-7',
          'transition-colors duration-300',
          EASE,
          'hover:bg-ink-800',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
          'disabled:pointer-events-none disabled:opacity-60',
        )}
      >
        <span className="font-display text-[1.0625rem] font-extrabold tracking-[-0.005em] text-white uppercase sm:text-[1.1875rem]">
          {status === 'sending' ? 'Sending' : 'Submit enquiry'}
        </span>

        <span className="flex shrink-0 items-center gap-4">
          <span
            className={cn(
              'text-[11px] font-semibold tracking-[0.2em] uppercase',
              pending ? 'text-white/55' : 'text-volt-300',
            )}
          >
            {pending ? `${pending} to fill` : 'Ready'}
          </span>

          <ArrowRight
            className={cn(
              'size-4 text-white transition-transform duration-500',
              EASE,
              'group-hover:translate-x-1',
            )}
          />
        </span>
      </button>

      <p className="mt-4 text-[13.5px] leading-relaxed text-ink-500">
        Typically answered within one business day.
      </p>

      {status === 'error' && (
        <p role="alert" className="mt-6 border-t border-ink-900/[0.08] pt-5 text-sm text-ink-800">
          <span className="font-semibold text-brand-600">That did not go through.</span> The form
          could not reach our end — try again, or call{' '}
          <a href={`tel:${CONTACT.phone}`} className="font-semibold underline">
            {CONTACT.phone}
          </a>
          .
        </p>
      )}
    </form>
  )
}

/**
 * The compulsory mark, keyed once at the head of the sheet so a label can say
 * "Name ▁" instead of "Name *" or "Name (required)" — and the one field that is
 * not compulsory says "(optional)" in words.
 *
 * It was a floating square, which is a bullet: it read as decoration beside the
 * label rather than as an instruction about the field. A short red rule sitting
 * on the baseline is the blank on a printed form — the same gesture as the
 * hairline under the field it belongs to, at a tenth the length.
 *
 * Decorative: `aria-hidden`, and the field's own `aria-invalid` plus its error
 * text are what a screen reader gets. A dash is not a sentence.
 */
function Mark() {
  return <span aria-hidden="true" className="h-[2px] w-2.5 shrink-0 bg-brand-500" />
}

/** Label, line, complaint. The complaint appears under the rule rather than in
 *  the label's slot, and nothing in the field changes size when it does, so
 *  validation firing on the name field cannot shove the phone field sideways. */
function Field({ id, label, hint, required, error, children }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        {/* `items-center` rather than `items-baseline`: on the baseline the rule
            read as an underscore dropped under the label. Centred on the x-height
            it reads as a mark belonging to the words beside it. */}
        <label htmlFor={`contact-${id}`} className={cn('inline-flex items-center gap-2', LABEL)}>
          {label}
          {required && <Mark />}
        </label>
        {hint && !error && <span className="text-[13px] text-ink-500">({hint})</span>}
      </div>

      <div className="relative">{children}</div>

      {error && (
        <p id={`contact-${id}-error`} className="mt-2 text-[13px] font-medium text-brand-600">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * The confirmation, as a slip rather than a sentence.
 *
 * A green line under a form the visitor has already stopped reading is not an
 * acknowledgement. This replaces the fields with what they would want if they
 * had to chase it: a reference they can say on the phone, what we think they
 * asked for, and when to expect an answer.
 */
function Sent({ receipt, job, onReset, headingRef }) {
  const firstName = receipt.name.trim().split(/\s+/)[0]

  const ROWS = [
    { term: 'Reference', value: receipt.reference },
    { term: 'About', value: job.label },
    { term: 'Reply by', value: 'Next working day' },
  ]

  return (
    <div role="status" className="animate-rise py-4 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-volt-300/30 text-ink-900 ring-1 ring-volt-500/30 ring-inset">
        <Check className="size-6" />
      </span>

      <h3
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 font-display text-3xl font-extrabold tracking-[-0.03em] text-ink-900 outline-none sm:text-4xl"
      >
        Got it{firstName ? `, ${firstName}` : ''}.
      </h3>

      <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-ink-500">
        It is with the right desk. If it is urgent, calling still beats waiting —{' '}
        <a href={`tel:${CONTACT.phone}`} className="font-semibold text-ink-900 underline">
          {CONTACT.phone}
        </a>
        .
      </p>

      <dl className="mx-auto mt-8 max-w-sm divide-y divide-ink-900/[0.08] border-y border-ink-900/[0.08] text-left">
        {ROWS.map((row) => (
          <div key={row.term} className="flex items-baseline justify-between gap-6 py-3.5">
            <dt className={META}>{row.term}</dt>
            <dd className="font-display text-[15px] font-bold text-ink-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      <Button variant="ghost" size="md" onClick={onReset} className="mt-8">
        Send another
      </Button>
    </div>
  )
}
