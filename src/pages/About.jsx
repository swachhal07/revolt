import Container from '@/components/ui/Container'
import DetailCarousel from '@/components/about/DetailCarousel'
import { useMounted } from '@/hooks/useReveal'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { DEALERS } from '@/data/dealers'
import portrait from '@/assets/images/Hardik with RVX.jpg'
import dugarLogo from '@/assets/images/dugar-logo.png'
import { cn } from '@/utils/cn'

/**
 * About, as an account of the operation rather than a mission statement.
 *
 * The page every company fills with the word "passionate". What somebody
 * actually wants here is narrower and duller: who is behind this, how long they
 * have been at it, what happens when the bike needs something, and why an
 * electric motorcycle is the right call in this country specifically. So the page
 * is written as answers to those four, in that order, and the numbers are stated
 * before the prose.
 *
 * Five bands, alternating asymmetry so no two read the same way.
 *
 *   1. Masthead — the journal's centred nameplate, holding the first screen on
 *      its own: rule-flanked label, the claim at masthead scale, one standfirst.
 *      Nothing set beside it, because the claim is the whole answer.
 *   2. The ledger — four ruled cells of figures, sitting on the bottom edge of
 *      that first screen. The same strip the contact masthead uses, and the only
 *      place on the page with tabular numerals.
 *   3. Our story — the page's only tinted band, and its one stretch of running
 *      prose: how the operation got to those figures, closing on the group's
 *      credit rather than opening with it.
 *   4. The details — a centred carousel, one detail at a time with its
 *      neighbours cut by the screen edge. The page's only interactive band, and
 *      the only one that runs wider than the container.
 *   5. The group — a centred plate ruled off top and bottom, naming the parent
 *      company at masthead scale under its own mark. The page's quietest
 *      structure, against four bands that are all split or asymmetric, and the
 *      one it closes on.
 *
 * The showroom index and the test-ride slab that used to close the page are
 * gone. The addresses live on `/dealers` and the ask lives on `/contact`, both
 * of which are one click from the footer on every page.
 *
 * PLACEHOLDER DATA — the founding year in the ledger is a stand-in pending the
 * real one, marked at the constant. The group band's copy is drafted rather
 * than supplied and still needs sign-off. The showroom count and the lineup
 * count are read from `data/`, so they cannot drift from the rest of the site.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const LABEL = 'text-[11px] font-semibold tracking-[0.2em] uppercase'

// `Showrooms` is counted off `data/dealers.js` and cannot drift. `Since` still
// needs the real founding year. The rider figure is stated as a floor rather
// than a count, because that is what we can stand behind.
//
// `Models` is stated as six, which is the real lineup — but `data/motorcycles.js`
// only holds three (RV400, RV400 BRZ, RV1), so it cannot be counted off the data
// yet. Add the other three there and this goes back to MOTORCYCLES.length.
const LEDGER = [
  { term: 'Distributor since', value: '2023' },
  { term: 'Showrooms', value: String(DEALERS.length).padStart(2, '0') },
  { term: 'Models', value: '06' },
  { term: 'Riding in Nepal', value: '1000+' },
]

// NEEDS SIGN-OFF. Written from facts already stated elsewhere on the site — the
// group's decades in vehicle distribution, the 2023 appointment, the one
// Kathmandu showroom and the workshop behind it. Nothing here is invented, but
// nobody at the company has approved the wording yet.
const STORY = [
  'MV Dugar Group has been importing, distributing and servicing vehicles and industrial equipment in Nepal for decades. When Revolt Motors looked for a partner here in 2023, that was the argument: warehousing, service discipline and an obligation to be reachable that all already existed.',
  'Distribution here is a logistics problem before it is a sales one. Everything arrives by road across a border, and a part that has to be sent for is a machine standing still.',
  'Because anybody can land a container of motorcycles. The hard part starts eighteen months later, when a controller fails on a Friday and the owner needs somebody who has seen that fault before and has the part on a shelf.',
  'So that is the part we built first — technicians trained on the platform, parts held in the country, and a workshop that reads the battery log instead of guessing at it. The showroom came after.',
]

export default function About() {
  const mounted = useMounted()

  // Two scroll-driven bands. The masthead above them rides `mounted` instead
  // — it is on screen before there is anything to scroll. See
  // [[useScrollReveal]].
  const storyRef = useScrollReveal({ y: 16, duration: 0.7, stagger: 0.07 })
  const groupRef = useScrollReveal({ y: 16, duration: 0.7, stagger: 0.07 })

  // Spread onto the element. The delay is inline rather than a `delay-*` class
  // because it is a value, not a token — and it drops to zero on the way out so
  // a stagger never plays backwards.
  const enter = (shown, delay, className) => ({
    style: { transitionDelay: shown ? `${delay}ms` : '0ms' },
    className: cn(
      'transition-[opacity,transform] duration-700',
      EASE,
      shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      className,
    ),
  })

  return (
    <>
      {/* ── The masthead ──────────────────────────────────────────────────
          The journal's nameplate, set on this page: named across one
          rule-flanked strip, then the claim centred at masthead scale with the
          standfirst under it. One column, so nothing sits beside the opening
          claim to divide the eye. */}
      <section className="flex min-h-[calc(100svh-6rem)] flex-col pt-24 pb-12 sm:pt-28 sm:pb-14">
        <Container className="flex max-w-[92rem] flex-1 flex-col">
          <div {...enter(mounted, 0)}>
            <div className="flex items-center gap-5">
              <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
              <p className={cn(LABEL, 'text-brand-600')}>About</p>
              <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            </div>
          </div>

          {/* The red sits on the verb the page is about; the full stop stays
              black. Same 18ch measure as the journal, so the two mastheads set
              to the same block width — this claim just fills three lines of it
              where that one fills two. */}
          <h1
            {...enter(
              mounted,
              60,
              'mx-auto mt-4 max-w-[18ch] text-center font-display text-[clamp(2.5rem,7vw,5.25rem)] leading-[0.95] font-extrabold tracking-[-0.045em] text-ink-900 text-balance sm:mt-5',
            )}
          >
            We brought these bikes here, and we keep them{' '}
            <span className="text-brand-600">running</span>.
          </h1>

          <p
            {...enter(
              mounted,
              140,
              // Further off the title than the journal sets it: three lines of
              // 84px display leave a deep descender line, and the tight gap read
              // as crowding under it.
              'mx-auto mt-8 max-w-[52ch] text-center text-[15.5px] leading-relaxed text-ink-500 text-pretty sm:mt-9',
            )}
          >
            MV Dugar Group is the authorised distributor for Revolt Motors in Nepal — the
            showrooms, the workshop, the parts shelf and the people who answer the phone. Not a
            reseller with a catalogue: the whole chain from the port to the plate, held in the
            country.
          </p>

          {/* Absorbs whatever height the viewport has left, so the ledger below
              closes the first screen instead of trailing the copy. Its own top
              margin still sets the minimum gap when the copy runs long. */}
          <div aria-hidden="true" className="hidden lg:block lg:flex-1" />

          {/* ── The ledger ────────────────────────────────────────────────
              Four figures, ruled. Unequal columns would be wrong here — these
              are the same kind of fact at the same weight, which is the one case
              for equal cells. */}
          <dl
            {...enter(
              mounted,
              160,
              cn(
                // The ledger closes the masthead, so it sits on the bottom edge of
                // the first viewport rather than trailing the copy.
                'mt-14 grid border-y border-ink-900/12 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4',
                '[&>div]:border-t [&>div]:border-ink-900/12 [&>div]:first:border-t-0',
                'sm:[&>div]:border-t-0 sm:[&>div]:border-l sm:[&>div]:first:border-l-0',
                'sm:[&>div:nth-child(3)]:border-t sm:[&>div:nth-child(3)]:border-l-0',
                'lg:[&>div:nth-child(3)]:border-t-0 lg:[&>div:nth-child(3)]:border-l',
                'sm:[&>div:nth-child(4)]:border-t lg:[&>div:nth-child(4)]:border-t-0',
                // Cells centre with the masthead above them; edge padding is
                // symmetric so the four figures read as one measured row.
                '[&>div]:py-6 [&>div]:text-center sm:[&>div]:px-8 lg:[&>div]:py-7',
              ),
            )}
          >
            {LEDGER.map((row) => (
              <div key={row.term}>
                <dt className={cn(LABEL, 'text-ink-500')}>{row.term}</dt>
                <dd className="mt-4 font-display text-[2rem] leading-none font-extrabold tracking-[-0.04em] text-ink-900 tabular-nums sm:text-[2.5rem]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ── Our story ─────────────────────────────────────────────────────
          The band a shade off the paper, directly under the ledger: the figures
          state what the operation is, and this is how it got there.

          Centred label and headline over a split body — the account in one
          justified column on the left, a photograph filling the height of it on
          the right. The headline turns red on its second line, so the break is
          the emphasis rather than a highlighted word inside a line.

          The group's credit is not repeated here: the first paragraph names MV
          Dugar Group, and the head office belongs on the contact page. */}
      <section
        ref={storyRef}
        className="border-y border-ink-900/[0.07] bg-ink-50 py-16 sm:py-20 lg:py-24"
      >
        <Container className="max-w-[84rem]">
          {/* The masthead's nameplate strip, repeated: named across one
              rule-flanked line, which is how every band on this site opens. */}
          <div data-reveal className="flex items-center gap-5">
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            <p className={cn(LABEL, 'text-brand-600')}>Our story</p>
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
          </div>

          <h2
            data-reveal
            className="mx-auto mt-5 max-w-[26ch] text-center font-display text-[clamp(1.875rem,4.4vw,3.25rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-ink-900 text-balance"
          >
            We started with the workshop,{' '}
            <span className="block text-brand-600">not the showroom.</span>
          </h2>

          <div className="mt-12 grid gap-10 sm:mt-14 lg:grid-cols-12 lg:gap-12">
            {/* Justified, because it is set as a column of an account rather than
                as page copy — and ruled top and bottom so the column reads as a
                measured block against the photograph beside it. */}
            <div className="lg:col-span-5">
              <div className="space-y-6 border-t border-ink-900/12 pt-8 text-[18px] leading-[1.7] text-ink-800 text-justify hyphens-auto sm:text-[19px]">
                {STORY.slice(0, 2).map((para, index) => (
                  <p key={index} data-reveal>
                    {para}
                  </p>
                ))}
              </div>

              {/* The last two paragraphs are the conclusion the first two are
                  building to, so the rule sets them apart rather than the copy
                  saying so. */}
              <div
                data-reveal
                className="mt-8 space-y-6 border-t border-ink-900/12 pt-8 text-[18px] leading-[1.7] text-ink-800 text-justify hyphens-auto sm:text-[19px]"
              >
                {STORY.slice(2).map((para, index) => (
                  <p key={index}>{para}</p>
                ))}
              </div>
            </div>

            {/* Square corners, no tray: the ruled column of prose beside it has
                no radius either, and a rounded plate against justified type set
                between hairlines reads as two different pages. Filled to the
                height of that column so the two halves close on the same line —
                which at five paragraphs is a tall crop of the rider. */}
            <div data-reveal className="lg:col-span-7 lg:col-start-6">
              <div className="h-full overflow-hidden bg-ink-50 ring-1 ring-ink-900/[0.06]">
                <img
                  src={portrait}
                  alt="A rider with an RVX on a road above the valley"
                  loading="lazy"
                  className="aspect-[4/3] h-full w-full object-cover lg:aspect-auto"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── The details ───────────────────────────────────────────────────
          A centred carousel in place of the "why electric" argument that stood
          here: one detail held in the middle, its neighbours cut by the screen
          edge. Images and copy are both placeholders — see the component. */}
      <DetailCarousel />

      {/* ── The group ─────────────────────────────────────────────────────
          A plate, centred and ruled off top and bottom: label, the group's mark
          at size, the name at masthead scale, a short red rule, one paragraph.

          Deliberately the quietest structure on the page. Every other band is
          asymmetric or split, so the one place the parent company is named on
          its own gets the opposite treatment — a single centred column with
          nothing beside it to divide the eye, which is also how the page's own
          masthead opens. */}
      <section ref={groupRef} className="border-y border-ink-900/12 py-20 sm:py-24 lg:py-32">
        <Container className="max-w-[92rem]">
          <div className="mx-auto flex max-w-[46rem] flex-col items-center text-center">
            {/* The site's nameplate strip — named across one rule-flanked line,
                in red, the way the contact masthead and every other band on
                this page opens. The rules run the width of the plate, so the
                label sets to the paragraph below it rather than to the page. */}
            <div data-reveal className="flex w-full items-center gap-5">
              <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
              <p className={cn(LABEL, 'shrink-0 text-brand-600')}>Group ownership</p>
              <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            </div>

            {/* In colour, and at size. The footer knocks this to white against
                ink; here it is the thing being introduced, so it leads. */}
            <img
              data-reveal
              src={dugarLogo}
              alt="MV Dugar Group"
              loading="lazy"
              className="mt-10 h-24 w-auto sm:mt-12 sm:h-32"
            />

            {/* Uppercase and set as two lines, the second carrying the name in
                red — the one place on the page the group's name is stated at
                masthead scale rather than mentioned inside a sentence. */}
            <h2
              data-reveal
              className="mt-10 font-display text-[clamp(2.25rem,6.4vw,4.5rem)] leading-[0.98] font-extrabold tracking-[-0.035em] text-ink-900 uppercase sm:mt-12"
            >
              Part of the
              <span className="block text-brand-600">MV Dugar Group</span>
            </h2>

            <span
              aria-hidden="true"
              data-reveal
              className="mt-10 block h-0.5 w-16 bg-brand-600 sm:mt-12"
            />

            <p
              data-reveal
              className="mt-10 max-w-[54ch] text-[16.5px] leading-[1.85] text-ink-500 text-pretty sm:mt-12 sm:text-[17px]"
            >
              The motorcycles sit inside a larger group, and that is the part you never see: the
              buying, the warehousing, the working capital that keeps a controller on a shelf in
              Kathmandu instead of on a plane. It is why a bike goes back on the road in a week
              rather than a month.
            </p>
          </div>
        </Container>
      </section>
    </>
  )
}
