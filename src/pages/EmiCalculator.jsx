import { useMemo, useState } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { PRICED_MOTORCYCLES } from '@/data/motorcycles'
import { formatNpr } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * Three questions on a machined tray, and an estimate printed on paper.
 *
 * A finance calculator is a form, and forms are where interfaces go to be
 * ignored. This one is built as a counter: the three things a lender needs are
 * lettered A, B, C and set at display size — the figure you are changing is the
 * largest thing on the page while you change it — and the answer is not a
 * result panel but a receipt, printed, torn off and handed back. The metaphor
 * earns its keep. A receipt is the one document format where dotted leaders, a
 * barcode and capitalised small print are the native voice rather than
 * decoration, and it makes an estimate feel like a quote without ever claiming
 * to be one.
 *
 * Two materials, deliberately: the controls sit in a tray — an outer shell in
 * the page's own grey with a hairline ring, a white core inset inside it on a
 * concentric radius — so they read as hardware you operate. The slip is paper,
 * so it gets no tray at all: it floats on a wide, soft shadow and lifts a
 * fraction under the cursor. Giving paper a machined bezel would have made it a
 * card, and the whole point is that it is not one.
 *
 * The ground is a dot grid rather than flat white — the same dust the footer
 * spells the marque out of, at a coarser pitch, so the page belongs to the site
 * rather than to a component library.
 *
 * The controls are doubled on purpose. Each input has a slider for exploring
 * and four presets for arriving; most people already know they want three
 * years, and making them drag to it is friction with no payoff. The loan
 * presets are the catalogue's three motorcycles at full price, so the common
 * case is one tap.
 *
 * The maths is the standard reducing-balance annuity — EMI = P·r(1+r)^n /
 * ((1+r)^n − 1) — with the zero-rate case handled separately, since at r = 0 the
 * formula divides by zero and the answer is the principal over the term. A
 * dealer scheme at 0% is a real product, not a rounding edge.
 *
 * The split bar under the totals is the one thing the numbers do not say out
 * loud: at 12% over five years, interest is not a rounding error on the price,
 * it is a fifth of it again. Anyone comparing tenures should see that without
 * doing arithmetic.
 *
 * The slip carries its own caveat — "estimate only, final terms at approval" —
 * so nothing under it repeats the disclaimer or asks for the next step. The
 * page answers one question and stops.
 *
 * PLACEHOLDER FIGURES — the rate bounds and defaults are typical of Nepali
 * two-wheeler loans in 2025, not quotes, and the prices come from the
 * placeholder catalogue in `data/motorcycles.js`. Both are printed on the page
 * rather than hidden: a calculator that will not show its inputs is one nobody
 * can check.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const AMOUNT_MIN = 50_000
const AMOUNT_MAX = 1_000_000
const AMOUNT_STEP = 5_000

const RATE_MIN = 5
const RATE_MAX = 25
const RATE_STEP = 0.5

const MONTHS_MIN = 6
const MONTHS_MAX = 84
const MONTHS_STEP = 6

const RATE_PRESETS = [10, 12, 14, 16]
const MONTH_PRESETS = [12, 24, 36, 60]

// Rounded to the nearest step so a preset is reachable by dragging too — a pill
// that highlights on a value the slider cannot produce looks broken.
// Priced bikes only: a model whose price is still to come would round `null` to
// NaN and render a pill that highlights on nothing.
const AMOUNT_PRESETS = PRICED_MOTORCYCLES.map((bike) => ({
  label: bike.name,
  value: Math.round(bike.priceNpr / AMOUNT_STEP) * AMOUNT_STEP,
}))

// The rule under each figure is the control. A 2px track so it reads as the
// underline it replaces, with the travelled part painted rather than
// transitioned — it follows a drag, and a transition would lag the thumb by its
// own duration.
const SLIDER = cn(
  'h-0.5 w-full cursor-pointer appearance-none rounded-full bg-transparent outline-none',
  '[&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-ink-900',
  '[&::-webkit-slider-thumb]:shadow-[0_4px_14px_-2px_rgba(18,18,20,0.45)]',
  // Physical response on the thumb itself: it swells under the finger and
  // settles back on release. Transform only, so it never touches layout.
  '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-300',
  '[&::-webkit-slider-thumb]:ease-[cubic-bezier(0.32,0.72,0,1)]',
  'hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-[0.94]',
  '[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px]',
  '[&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-ink-900',
  'focus-visible:ring-2 focus-visible:ring-brand-500/30',
)

const STEP_LABEL = 'text-[11px] font-semibold tracking-[0.22em] text-ink-500 uppercase'
const FIGURE = 'font-display font-extrabold tracking-[-0.05em] tabular-nums text-ink-900'
const UNIT = 'font-display text-lg font-extrabold tracking-[-0.03em] text-ink-900/20 sm:text-xl'
const RANGE = 'text-[11px] font-medium tracking-[0.14em] text-ink-900/35 uppercase tabular-nums'

// Receipt type. A monospace face is costume almost everywhere on this site and
// the native voice here — a printed slip is the one place proportional type
// would be the wrong choice.
const SLIP = 'font-mono text-[13px] text-ink-900'

const trackFill = (pct) => ({
  background: `linear-gradient(to right, var(--color-ink-900) ${pct}%, rgba(18,18,20,0.12) ${pct}%)`,
})

export default function EmiCalculator() {
  // Three beats: the headline, the tray, the slip. Fires early because this is
  // the page's own opening — at `top 85%` the section is already in view on
  // arrival and the entrance would be missed. See [[useScrollReveal]].
  const ref = useScrollReveal({
    start: 'top 95%',
    y: 48,
    blur: 6,
    duration: 0.9,
    stagger: 0.14,
  })

  const [amount, setAmount] = useState(AMOUNT_PRESETS[0].value)
  const [rate, setRate] = useState(12)
  const [months, setMonths] = useState(36)

  const { emi, totalInterest, totalPayable, principalShare } = useMemo(() => {
    const monthlyRate = rate / 12 / 100
    const growth = (1 + monthlyRate) ** months
    const payment =
      monthlyRate === 0 ? amount / months : (amount * monthlyRate * growth) / (growth - 1)

    const payable = payment * months

    return {
      emi: payment,
      totalInterest: payable - amount,
      totalPayable: payable,
      principalShare: (amount / payable) * 100,
    }
  }, [amount, rate, months])

  // A barcode actually derived from the estimate, so it reprints as the figures
  // change instead of being a picture of a barcode. Deterministic — the same
  // inputs always print the same slip.
  const bars = useMemo(() => {
    let seed = Math.round(emi) + months * 7 + Math.round(rate * 10)
    // Dense enough to read as a scanned code rather than a row of tally marks
    // — at 68 the gaps were wide enough to count.
    return Array.from({ length: 148 }, () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return 1 + (seed % 3)
    })
  }, [emi, months, rate])

  const years = months / 12
  const tenureInYears =
    months % 12 === 0 ? `${years} ${years === 1 ? 'yr' : 'yrs'}` : `${years.toFixed(1)} yrs`

  return (
    <section
      ref={ref}
      // The layout already pads every non-home page by the fixed navbar's
      // height, so the section only owes the page its own breathing room at
      // the top — doubling it there pushed the headline halfway down the fold.
      className="relative overflow-hidden bg-ink-50 pt-10 pb-24 sm:pt-14 sm:pb-32 lg:pt-16 lg:pb-40"
    >
      {/* The ground: a coarse dot grid, faded out at the edges so the page has a
          centre rather than a texture swatch. Painted, static, behind
          everything — nothing here repaints on scroll. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(18,18,20,0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(70%_60%_at_50%_35%,#000,transparent)]"
      />

      <div className="relative mx-auto w-full max-w-[100rem] px-4 sm:px-8 lg:px-12">
        {/* ── The headline ─────────────────────────────────────────────────
            Massive, short, and answering the only question anyone brings to a
            finance page. The lede carries the caveat so the heading does not
            have to. */}
        <header data-reveal className="mx-auto max-w-4xl text-center">
          {/* Not a pill. A badge floating over a dot field reads as chrome
              borrowed from a dashboard; the site's own eyebrow voice is tracked
              red capitals, and centred type wants rules to sit inside rather
              than a container to sit in. */}
          <p className="flex items-center justify-center gap-4 text-[11px] font-semibold tracking-[0.28em] text-brand-600 uppercase sm:gap-5 sm:text-xs">
            <span aria-hidden="true" className="h-px w-8 bg-brand-600/25 sm:w-14" />
            EMI calculator
            <span aria-hidden="true" className="h-px w-8 bg-brand-600/25 sm:w-14" />
          </p>

          <h1 className="mx-auto mt-7 max-w-[14ch] font-display text-[clamp(2.75rem,7vw,5rem)] leading-[0.94] font-extrabold tracking-[-0.045em] text-ink-900 text-balance">
            What it costs{' '}
            {/* The two words the page exists to answer, in the brand red — the
                one place colour is spent above the fold. */}
            <span className="text-brand-600">a month.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-ink-500 text-pretty">
            Set the three things a lender asks for. The estimate prints as you
            go &mdash; no forms, no phone number, no waiting on a callback.
          </p>
        </header>

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-16 xl:gap-24">
          {/* ── The tray ──────────────────────────────────────────────────
              Machined enclosure: outer shell in the page's grey with a hairline
              ring, white core inset on a concentric radius. The controls are
              hardware, and hardware sits in something. */}
          <div data-reveal className="lg:col-span-7">
            <div className="rounded-[2.25rem] bg-white/40 p-2 ring-1 ring-ink-900/[0.07] ring-inset">
              <div className="rounded-[1.75rem] bg-white px-5 py-6 shadow-[0_30px_80px_-50px_rgba(18,18,20,0.45),inset_0_1px_1px_rgba(255,255,255,0.9)] sm:px-7 sm:py-7">
                <Step
                  letter="A"
                  label="Loan amount"
                  hint="How much do you want to borrow?"
                  range={`${formatNpr(AMOUNT_MIN)} – ${formatNpr(AMOUNT_MAX)}`}
                  figure={
                    <>
                      <span className="mr-2 text-ink-900/25">Rs.</span>
                      {amount.toLocaleString('en-IN')}
                    </>
                  }
                  inputId="loan-amount"
                  min={AMOUNT_MIN}
                  max={AMOUNT_MAX}
                  step={AMOUNT_STEP}
                  value={amount}
                  onChange={setAmount}
                  presets={AMOUNT_PRESETS}
                />

                <Step
                  letter="B"
                  label="Interest rate"
                  hint="Per annum, reducing balance"
                  range={`${RATE_MIN}% – ${RATE_MAX}%`}
                  figure={rate % 1 === 0 ? rate : rate.toFixed(1)}
                  unit="% p.a."
                  inputId="interest-rate"
                  min={RATE_MIN}
                  max={RATE_MAX}
                  step={RATE_STEP}
                  value={rate}
                  onChange={setRate}
                  presets={RATE_PRESETS.map((value) => ({ label: `${value}%`, value }))}
                />

                <Step
                  letter="C"
                  label="Tenure"
                  hint={tenureInYears}
                  range={`${MONTHS_MIN} – ${MONTHS_MAX} months`}
                  figure={months}
                  unit="months"
                  inputId="tenure"
                  min={MONTHS_MIN}
                  max={MONTHS_MAX}
                  step={MONTHS_STEP}
                  value={months}
                  onChange={setMonths}
                  presets={MONTH_PRESETS.map((value) => ({
                    label: `${value / 12} ${value === 12 ? 'yr' : 'yrs'}`,
                    value,
                  }))}
                  last
                />
              </div>
            </div>
          </div>

          {/* ── The slip ──────────────────────────────────────────────────
              No tray: this is paper. It floats a degree off-square on a wide
              soft shadow and straightens under the cursor — the only rotation
              on the site, and it is gone below lg where a tilted card would
              only crowd its neighbours' touch targets. */}
          <div data-reveal className="lg:col-span-5 lg:self-center">
            <div className="w-full">
              <div
                className={cn(
                  'drop-shadow-[0_45px_70px_rgba(18,18,20,0.18)]',
                  // Square to the grid. The degree of tilt read as a printed
                  // slip on a desk, but it also tipped every right-aligned
                  // figure a few pixels above its own label, which on a
                  // document whose whole job is columns of numbers looks like
                  // a rendering fault rather than a flourish.
                  'transition-transform duration-700',
                  EASE,
                  'lg:hover:scale-[1.01]',
                )}
              >
                <div
                  className="bg-white px-6 pt-10 pb-14 sm:px-10"
                  style={{
                    // A repeating quarter-turn cone at the bottom edge: teeth
                    // without an image, a 40-point clip-path, or an SVG. The
                    // shadow lives on the wrapper because a masked element
                    // clips its own box-shadow away.
                    maskImage:
                      'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg)',
                    maskSize: '20px 100%',
                    maskRepeat: 'repeat-x',
                    WebkitMaskImage:
                      'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg)',
                    WebkitMaskSize: '20px 100%',
                    WebkitMaskRepeat: 'repeat-x',
                  }}
                >
                  <header className="text-center">
                    <p className="font-display text-lg font-extrabold tracking-[0.3em] text-ink-900">
                      REVOLT NEPAL
                    </p>
                    <p className="mt-2 font-mono text-[11px] tracking-[0.18em] text-ink-500 uppercase">
                      Bike purchase &middot; Loan estimate
                    </p>
                  </header>

                  <Perforation />

                  <dl className={cn(SLIP, 'space-y-3')}>
                    <SlipRow term="Principal" value={formatNpr(amount)} />
                    <SlipRow term="Interest rate" value={`${rate}% p.a.`} />
                    <SlipRow term="Tenure" value={`${months} months`} />
                  </dl>

                  <Perforation />

                  {/* Announced as one region, so a drag is heard as a payment
                      once it settles rather than as a run of digits. */}
                  <div className="text-center" aria-live="polite">
                    <p className="font-mono text-[11px] tracking-[0.18em] text-ink-500 uppercase">
                      Your monthly EMI
                    </p>

                    <p
                      className={cn(
                        FIGURE,
                        'mt-3 text-[clamp(2.5rem,6vw,3.75rem)] leading-none text-brand-600',
                      )}
                    >
                      {formatNpr(Math.round(emi))}
                    </p>

                    <p className="mt-2 font-mono text-xs text-ink-500">for {months} months</p>
                  </div>

                  <Perforation />

                  <dl className={cn(SLIP, 'space-y-3')}>
                    <SlipRow
                      term="Total interest"
                      value={formatNpr(Math.round(totalInterest))}
                    />
                    <SlipRow
                      term="Total payable"
                      value={formatNpr(Math.round(totalPayable))}
                      strong
                    />
                  </dl>

                  {/* What those two totals mean side by side. Painted with
                      flex-grow rather than widths, so the halves can never add
                      up to more than the bar. */}
                  <div className="mt-7">
                    <div className="flex h-1.5 overflow-hidden rounded-full">
                      <span
                        aria-hidden="true"
                        className={cn('bg-ink-900 transition-[flex-grow] duration-500', EASE)}
                        style={{ flexGrow: principalShare }}
                      />
                      <span
                        aria-hidden="true"
                        className={cn('bg-brand-600 transition-[flex-grow] duration-500', EASE)}
                        style={{ flexGrow: 100 - principalShare }}
                      />
                    </div>

                    <div className="mt-2.5 flex justify-between font-mono text-[11px] text-ink-500">
                      <span>principal {Math.round(principalShare)}%</span>
                      <span>interest {Math.round(100 - principalShare)}%</span>
                    </div>
                  </div>

                  {/* Derived from the figures above it. Decorative — it encodes
                      nothing scannable. */}
                  <div
                    aria-hidden="true"
                    className="mt-9 flex h-12 items-stretch justify-center"
                  >
                    {bars.map((width, index) => (
                      <span
                        key={`${index}-${width}`}
                        style={{ width: `${width}px` }}
                        className={index % 2 === 0 ? 'bg-ink-900' : 'bg-transparent'}
                      />
                    ))}
                  </div>

                  <p className="mt-6 text-center font-mono text-[10px] tracking-[0.18em] text-ink-500 uppercase">
                    Estimate only &middot; Final terms at approval
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** One lettered input: figure, rule-as-slider, bounds, presets. */
function Step({
  letter,
  label,
  hint,
  range,
  figure,
  unit,
  inputId,
  min,
  max,
  step,
  value,
  onChange,
  presets,
  last = false,
}) {
  const fill = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('py-7 first:pt-0 sm:py-8', !last && 'border-b border-ink-900/[0.08]')}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-6 place-items-center rounded-full border border-ink-900/15 font-mono text-[11px] text-ink-500"
        >
          {letter}
        </span>
        <label htmlFor={inputId} className={STEP_LABEL}>
          {label}
        </label>
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <p className={cn(FIGURE, 'text-[clamp(2rem,4.2vw,3rem)] leading-none')}>{figure}</p>
        {unit && <p className={UNIT}>{unit}</p>}
      </div>

      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn(SLIDER, 'mt-5')}
        style={trackFill(fill)}
      />

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-sm text-ink-500">{hint}</p>
        <p className={RANGE}>{range}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {presets.map((preset) => {
          const active = preset.value === value

          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(preset.value)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-semibold',
                'transition-[background-color,border-color,color,transform] duration-300',
                EASE,
                'active:scale-[0.96]',
                'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
                active
                  ? 'border-ink-900 bg-ink-900 text-white'
                  : 'border-ink-900/12 bg-white text-ink-900 hover:border-ink-900/40 hover:bg-ink-50',
              )}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** A term and a figure joined by the dotted leader a printed slip uses. */
function SlipRow({ term, value, strong = false }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className={cn(strong && 'font-bold')}>{term}</dt>
      <span
        aria-hidden="true"
        className="min-w-6 flex-1 -translate-y-[0.3em] border-b border-dotted border-ink-900/30"
      />
      <dd className={cn('tabular-nums', strong && 'font-bold')}>{value}</dd>
    </div>
  )
}

/** The dashed rule between a slip's blocks. */
function Perforation() {
  return <div aria-hidden="true" className="my-7 border-t border-dashed border-ink-900/20" />
}
