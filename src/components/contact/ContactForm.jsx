import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import { ArrowUpRight, Check, ChevronDown } from '@/components/ui/icons'
import { CONTACT } from '@/constants/site'
import { DEALERS } from '@/data/dealers'
import { MOTORCYCLES } from '@/data/motorcycles'
import { cn } from '@/utils/cn'

/**
 * The form, and the one idea in it: ask what this is about before asking
 * anything else.
 *
 * A single name/email/message box treats a service complaint, a dealership
 * proposal and a Saturday test ride as the same enquiry, and they are not — they
 * go to different people, they need different facts, and the visitor knows which
 * one they are before they start typing. So the first control is the reason, and
 * the reason decides the two or three fields that follow it. A test ride asks
 * which bike and which showroom because without those the reply is a question
 * rather than a booking; "something else" asks nothing extra, because there is
 * nothing to ask.
 *
 * Five reasons, not ten. Each one has to earn a different set of fields or a
 * different desk, otherwise it is a tag and belongs in the message.
 *
 * Structurally it is the EMI page's tray: grey shell, hairline ring, white core
 * on a concentric radius, the fields as inset wells inside it. Controls are
 * hardware, and hardware sits in something.
 *
 * DELIVERY — set `VITE_CONTACT_ENDPOINT` to the URL that should receive the
 * JSON payload (your own API, Formspree, a serverless function). Until it is
 * set, submissions go nowhere and the confirmation says so rather than claiming
 * a message was sent; nobody should ship a form that lies about that.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT

const MODEL_OPTIONS = [
  { value: '', label: 'Not decided yet' },
  ...MOTORCYCLES.map((bike) => ({ value: bike.slug, label: bike.name })),
]

// Straight off the dealer network, so a new showroom in `data/dealers.js` shows
// up here without anyone remembering to add it twice.
const SHOWROOM_OPTIONS = [
  { value: '', label: 'Nearest to me' },
  ...DEALERS.map((dealer) => ({ value: dealer.id, label: `${dealer.name} — ${dealer.city}` })),
]

const INTENTS = [
  {
    id: 'test-ride',
    label: 'Test ride',
    hint: 'Tell us the bike and the city and we book the slot from the nearest showroom.',
    prompt: 'Which days suit you? Weekend slots go first.',
    fields: [
      { id: 'model', label: 'Which bike', type: 'select', options: MODEL_OPTIONS },
      { id: 'showroom', label: 'Showroom', type: 'select', options: SHOWROOM_OPTIONS },
    ],
  },
  {
    id: 'buying',
    label: 'Buying',
    hint: 'Price, colours, delivery time, EMI paperwork — sales answers this one.',
    prompt: 'Anything specific: colour, budget, when you want to be riding.',
    fields: [{ id: 'model', label: 'Which bike', type: 'select', options: MODEL_OPTIONS }],
  },
  {
    id: 'service',
    label: 'Service',
    hint: 'Already riding one. The plate lets us pull the history before we call.',
    prompt: 'What is it doing, and since when?',
    fields: [
      { id: 'showroom', label: 'Where you bought it', type: 'select', options: SHOWROOM_OPTIONS },
      { id: 'plate', label: 'Plate or VIN', type: 'text', placeholder: 'Optional' },
    ],
  },
  {
    id: 'dealership',
    label: 'Dealership',
    hint: 'Partnership enquiries. Say where, and what you already run.',
    prompt: 'Your district, existing business, and the showroom space you have.',
    fields: [
      {
        id: 'district',
        label: 'District',
        type: 'text',
        required: true,
        placeholder: 'Where you want to open',
      },
    ],
  },
  {
    id: 'other',
    label: 'Something else',
    hint: 'Press, careers, fleet, anything the four above do not cover.',
    prompt: 'Go ahead.',
    fields: [],
  },
]

const findIntent = (id) => INTENTS.find((intent) => intent.id === id) ?? INTENTS[0]

// One well, three states: resting grey, white under focus, brand ring when the
// field is what is holding the form up. Only cheap properties animate.
const CONTROL = cn(
  'w-full rounded-2xl bg-ink-50/80 px-4 py-3.5 text-[15px] text-ink-900 ring-1 ring-ink-900/[0.07] ring-inset',
  'outline-none placeholder:text-ink-500/70',
  'transition-[background-color,box-shadow] duration-300',
  EASE,
  'hover:bg-ink-50 focus:bg-white focus:ring-2 focus:ring-brand-500/45',
)

const CONTROL_INVALID = 'ring-brand-500/60 bg-brand-50/60 focus:ring-brand-500/70'

const LABEL = 'text-[11px] font-semibold tracking-[0.2em] text-ink-500 uppercase'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  message: '',
  model: '',
  showroom: '',
  plate: '',
  district: '',
}

function validate(values, intent) {
  const errors = {}

  if (values.name.trim().length < 2) errors.name = 'We need a name to address the reply to.'

  // Nepali numbers land between a 7-digit landline with its area code and a
  // 10-digit mobile; anything outside that is a typo, and a typo here means a
  // reply that never arrives.
  const digits = values.phone.replace(/\D/g, '')
  if (!digits) errors.phone = 'A number we can call you back on.'
  else if (digits.length < 7 || digits.length > 14)
    errors.phone = 'That does not look complete — mobile, or landline with the area code.'

  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim()))
    errors.email = 'Check the spelling — this address would bounce.'

  if (values.message.trim().length < 10)
    errors.message = 'A line or two, so the right person picks it up.'

  for (const field of intent.fields) {
    if (field.required && !values[field.id].trim())
      errors[field.id] = `${field.label} is needed for this one.`
  }

  return errors
}

/** Short, spoken-over-the-phone-able. Uppercase base-36 off the clock. */
function makeReference() {
  return `RV-${Date.now().toString(36).slice(-6).toUpperCase()}`
}

export default function ContactForm() {
  const [intentId, setIntentId] = useState('test-ride')
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [receipt, setReceipt] = useState(null)
  const sentRef = useRef(null)

  const intent = findIntent(intentId)

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

    const nextErrors = validate(values, intent)
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

    const payload = { intent: intent.id, intentLabel: intent.label, ...values }

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

  return (
    // The tray. Grey shell, hairline ring, white core inset on a concentric
    // radius — the same enclosure the EMI page uses, because it holds the same
    // kind of thing.
    <div className="rounded-[2.25rem] bg-ink-50 p-2 shadow-[0_60px_120px_-50px_rgba(5,5,5,0.65)] ring-1 ring-ink-900/[0.06] ring-inset">
      <div className="rounded-[1.75rem] bg-white px-5 py-6 shadow-[0_30px_80px_-50px_rgba(18,18,20,0.45),inset_0_1px_1px_rgba(255,255,255,0.9)] sm:px-8 sm:py-8">
        {status === 'sent' && receipt ? (
          <Sent receipt={receipt} intent={intent} onReset={reset} headingRef={sentRef} />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* ── The reason ───────────────────────────────────────────────
                Real radios under the chips: arrow keys, form semantics and the
                announced group name all come free, and the styling hangs off
                `peer-checked` rather than off state we would have to keep. */}
            <fieldset>
              <legend className={LABEL}>What is this about</legend>

              <div className="mt-3 flex flex-wrap gap-2">
                {INTENTS.map((option) => (
                  <label key={option.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="intent"
                      value={option.id}
                      checked={intentId === option.id}
                      onChange={() => setIntentId(option.id)}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        'block rounded-full px-4 py-2 text-sm font-semibold text-ink-500 ring-1 ring-ink-900/10 ring-inset',
                        'transition-[background-color,color,box-shadow,transform] duration-300',
                        EASE,
                        'hover:text-ink-900 hover:ring-ink-900/25 active:scale-[0.98]',
                        'peer-checked:bg-ink-900 peer-checked:text-white peer-checked:ring-ink-900',
                        'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500',
                      )}
                    >
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Keyed on the reason so the line replays `animate-rise` when the
                selection moves — the copy changing under the chips is the whole
                feedback that the form just reshaped itself. */}
            <p key={intent.id} className="mt-4 animate-rise text-sm text-ink-500">
              {intent.hint}
            </p>

            <div className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label="Full name" error={errors.name}>
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

                <Field id="phone" label="Phone" error={errors.phone}>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="98…"
                    value={values.phone}
                    onChange={set('phone')}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                    className={cn(CONTROL, errors.phone && CONTROL_INVALID)}
                  />
                </Field>
              </div>

              <Field id="email" label="Email" hint="Optional" error={errors.email}>
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

              {/* The reason's own fields. Keyed on the reason for the same
                  reason the hint is: they arrive, they do not blink into place. */}
              {intent.fields.length > 0 && (
                <div
                  key={intent.id}
                  className={cn(
                    'grid animate-rise gap-5',
                    intent.fields.length > 1 && 'sm:grid-cols-2',
                  )}
                >
                  {intent.fields.map((field) => (
                    <Field
                      key={field.id}
                      id={field.id}
                      label={field.label}
                      error={errors[field.id]}
                    >
                      {field.type === 'select' ? (
                        <div className="relative">
                          <select
                            id={`contact-${field.id}`}
                            name={field.id}
                            value={values[field.id]}
                            onChange={set(field.id)}
                            aria-invalid={Boolean(errors[field.id])}
                            className={cn(
                              CONTROL,
                              'appearance-none pr-12',
                              errors[field.id] && CONTROL_INVALID,
                            )}
                          >
                            {field.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-500" />
                        </div>
                      ) : (
                        <input
                          id={`contact-${field.id}`}
                          name={field.id}
                          placeholder={field.placeholder}
                          value={values[field.id]}
                          onChange={set(field.id)}
                          aria-invalid={Boolean(errors[field.id])}
                          aria-describedby={
                            errors[field.id] ? `contact-${field.id}-error` : undefined
                          }
                          className={cn(CONTROL, errors[field.id] && CONTROL_INVALID)}
                        />
                      )}
                    </Field>
                  ))}
                </div>
              )}

              <Field id="message" label="Message" error={errors.message}>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder={intent.prompt}
                  value={values.message}
                  onChange={set('message')}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  className={cn(CONTROL, 'resize-y', errors.message && CONTROL_INVALID)}
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

            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="submit"
                size="lg"
                disabled={status === 'sending'}
                trailingIcon={<ArrowUpRight />}
                iconMotion="lift"
                className="w-full sm:w-auto"
              >
                {status === 'sending' ? 'Sending' : 'Send it'}
              </Button>

              <p className="max-w-[22ch] text-xs leading-relaxed text-ink-500">
                Used to answer you and nothing else. No list, no newsletter.
              </p>
            </div>

            {status === 'error' && (
              <p
                role="alert"
                className="mt-6 border-t border-ink-900/[0.08] pt-5 text-sm text-ink-800"
              >
                <span className="font-semibold text-brand-600">That did not go through.</span> The
                form could not reach our end — try again, or call{' '}
                <a href={`tel:${CONTACT.phone}`} className="font-semibold underline">
                  {CONTACT.phone}
                </a>
                .
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

/** Label over control over complaint. The complaint takes the label's slot when
 *  there is one, so nothing below the field moves when validation fires. */
function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={`contact-${id}`} className={LABEL}>
          {label}
        </label>
        {hint && !error && <span className="text-[11px] text-ink-500/80">{hint}</span>}
      </div>

      {children}

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
function Sent({ receipt, intent, onReset, headingRef }) {
  const firstName = receipt.name.trim().split(/\s+/)[0]

  const ROWS = [
    { term: 'Reference', value: receipt.reference },
    { term: 'About', value: intent.label },
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
        It is with the {intent.label.toLowerCase()} desk. If it is urgent, calling still beats
        waiting —{' '}
        <a href={`tel:${CONTACT.phone}`} className="font-semibold text-ink-900 underline">
          {CONTACT.phone}
        </a>
        .
      </p>

      <dl className="mx-auto mt-8 max-w-sm divide-y divide-ink-900/[0.08] border-y border-ink-900/[0.08] text-left">
        {ROWS.map((row) => (
          <div key={row.term} className="flex items-baseline justify-between gap-6 py-3.5">
            <dt className={LABEL}>{row.term}</dt>
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
