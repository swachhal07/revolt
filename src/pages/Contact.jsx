import { Link } from 'react-router-dom'
import Container from '@/components/ui/Container'
import ContactForm from '@/components/contact/ContactForm'
import { DeskStatus } from '@/components/contact/DirectLines'
import OfficeMap from '@/components/contact/OfficeMap'
import { ArrowUpRight } from '@/components/ui/icons'
import { useMounted } from '@/hooks/useReveal'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { CONTACT } from '@/constants/site'
import { cn } from '@/utils/cn'

/**
 * Contact, as a desk rather than a landing page.
 *
 * The version this replaces opened on a black masthead with a photograph in it,
 * which is the treatment every other page on the site already uses to sell
 * something. Nobody arrives here to be sold to. They arrive with a question and
 * a limited amount of patience, so the page is paper: no hero, no film, no
 * closing pitch. The form is the subject and it starts within a screen of the
 * top on a laptop.
 *
 * Three parts, in the order a visitor needs them.
 *
 *   1. The masthead: one centred headline and the desk stated in three ruled
 *      cells under it — status, hours, turnaround. No standfirst; the three
 *      facts are the standfirst. The status is live, because "we reply within
 *      24 hours" is a claim and "closed, opens Sunday 10:00" is a fact.
 *   2. The working area: one rectangle, half black slab and half paper. The
 *      slab is the counter — what happens to what you hand over, and the number
 *      to call if the answer cannot wait. The paper half is the form.
 *   3. The office, last. The address, the hours, the two ways to ask, and a map
 *      of where to turn up. It belongs after the form, not before it — offered
 *      first it is an exit, offered last it is a fallback.
 *
 * Ruled, not boxed, and the working area is where that finally holds: the form's
 * controls are hairlines rather than grey wells, so the page has one language
 * from the masthead strip to the closing index. Red appears only where it marks
 * position — the verb in the headline, the live tab, the send.
 *
 * PLACEHOLDER DATA — phone, email and hours come from `constants/site.js` and
 * are still stubs. Delivery is off until `VITE_CONTACT_ENDPOINT` is set; see
 * the note at the top of ContactForm.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const LABEL = 'text-[11px] font-semibold tracking-[0.2em] text-ink-500 uppercase'

// Where to turn up, when, and the two ways to ask first — in that order,
// because that is the order somebody deciding whether to come needs them. The
// address is not a link: the map under it is, and both of the map's URLs are
// built inside OfficeMap off the single `coords` pair in `constants/site.js`.
const OFFICE = [
  { term: 'Address', value: CONTACT.address },
  { term: 'Open', value: CONTACT.hours },
  { term: 'Call', value: CONTACT.phone, href: `tel:${CONTACT.phone}` },
  { term: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
]

// What actually happens to a submission, in the order it happens, numbered
// because it is a sequence. Written as three facts rather than three
// reassurances: what we get, what we do with it, what comes back. Anything
// vaguer is the "we value your enquiry" paragraph, and nobody has ever read one.
const STEPS = [
  {
    id: 'sent',
    title: 'You send the details',
    body: 'Model, city, timing — whatever you know.',
  },
  {
    id: 'matched',
    title: 'We match the spec',
    body: 'Variant, colour, range. Checked against showroom stock.',
  },
  {
    id: 'answered',
    title: 'You get an answer',
    body: 'Priced, with lead time. No obligation either way.',
  },
]

export default function Contact() {
  const mounted = useMounted()

  // The rail and the index each reveal on their own — the form between them
  // never animates, because a control that arrives late is a control someone
  // is already typing into.
  const railRef = useScrollReveal({ y: 16, duration: 0.7 })
  const linesRef = useScrollReveal({ y: 16, duration: 0.7, stagger: 0.08 })

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
          Paper, with the faintest brand wash bled down from the top corner so
          the sheet has a light source instead of being flat white, and grain
          over it so the wash reads as paper rather than as a gradient. Both
          decorative, both behind everything, neither of them costing a
          repaint. The top padding clears the fixed navbar. */}
      {/* Plain paper. An earlier pass bled a red wash down from the top edge to
          give the sheet a light source; against a headline this size it read as
          a stain behind the type rather than as atmosphere, and the page has
          exactly one thing to say before the form. White, and the hairlines
          carry the structure.

          The top padding is the navbar, not a design decision: the bar is
          `py-5` around a 48/56px logo, so 6rem is the first value that clears
          it on a phone and 6.5rem the first that clears it from sm. Anything
          more is dead space at the top of a page whose only job is a form. */}
      <section className="pt-24 pb-12 sm:pt-26 sm:pb-14">
        <Container>
          <div {...enter(mounted, 0)}>
            {/* Label between two rules rather than at the head of one. Centred
                type needs its own axis established before the headline lands,
                and a label with a rule only on its right would pull the whole
                masthead back to the left edge. */}
            <div className="flex items-center gap-5">
              <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
              {/* Red, matching the office label that closes the page — the two
                  rule-flanked labels are the page's bookends, so they are set in
                  the same ink. Written out rather than `cn(LABEL, …)`: `cn` is a
                  plain join, so two colour utilities would leave the winner to
                  stylesheet order. */}
              <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600 uppercase">
                Contact
              </p>
              <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            </div>
          </div>

          {/* ── The headline ───────────────────────────────────────────────
              Centred, alone, and set as wide as the sentence wants. There is no
              standfirst under it: what a visitor needs before the form is the
              desk's state, not a paragraph restating the page they already
              chose, and that is what the strip below says.

              `text-balance` matters more here than anywhere else on the site —
              a centred three-line headline with a two-word last line reads as
              an accident. It keeps the lines within a word of each other at
              every width. */}
          <h1
            {...enter(
              mounted,
              60,
              'mx-auto mt-7 max-w-[16ch] text-center font-display text-[clamp(2.75rem,8vw,6rem)] leading-[0.93] font-extrabold tracking-[-0.045em] text-ink-900 text-balance sm:mt-9',
            )}
          >
            Ask us the thing you actually came to{' '}
            {/* The red sits on the verb, and the full stop stays black —
                colour marks the word, not the punctuation after it. */}
            <span className="text-brand-600">ask</span>.
          </h1>

          {/* ── The desk, in three facts ───────────────────────────────────
              What a masthead here is actually for. Ruled cells with hairline
              verticals between them — the footer's contact plate, reused
              because it is the same kind of statement — closed top and bottom
              so the strip reads as the base of the headline rather than as a
              row of loose text. Status first: it is the only one of the three
              that changes.

              Three equal centred cells under a centred headline: the strip
              carries the same axis, and the hairlines between them are what
              keep it from looking like three floating captions. */}
          <dl
            {...enter(
              mounted,
              220,
              cn(
                'mt-10 grid border-y border-ink-900/12 text-center sm:mt-14 sm:grid-cols-3',
                // Rules run between cells only: horizontal when stacked,
                // vertical once the three sit side by side.
                '[&>div]:border-t [&>div]:border-ink-900/12 [&>div]:first:border-t-0',
                'sm:[&>div]:border-t-0 sm:[&>div]:border-l sm:[&>div]:first:border-l-0',
                '[&>div]:px-4 [&>div]:py-5 sm:[&>div]:py-7',
              ),
            )}
          >
            <div>
              <dt className={LABEL}>Desk</dt>
              <dd className="mt-3 font-display text-[15px] font-bold tracking-[-0.01em] text-ink-900 sm:text-base">
                <DeskStatus />
              </dd>
            </div>

            <div>
              <dt className={LABEL}>Hours</dt>
              <dd className="mt-3 font-display text-[15px] font-bold tracking-[-0.01em] text-ink-900 sm:text-base">
                {CONTACT.hours}
              </dd>
            </div>

            <div>
              <dt className={LABEL}>Reply by</dt>
              <dd className="mt-3 font-display text-[15px] font-bold tracking-[-0.01em] text-ink-900 sm:text-base">
                Next working day
              </dd>
            </div>
          </dl>
        </Container>
      </section>

      {/* ── The working area ──────────────────────────────────────────────
          One grey band, ruled. Earlier passes put the form in a silver tray
          beside a black slab, which gave the page two competing objects and made
          the heaviest thing on screen a paragraph of reassurance rather than the
          thing you came to fill in. Both enclosures are gone: the working area
          is a full-width band a shade off the paper above it, so its own top and
          bottom edges do the separating and the only rule inside it is the
          vertical one between the two columns.

          The form takes the wide column and the rail beside it is quiet — a
          numbered sequence and one note about what happens to your details, set
          at caption weight so nothing there competes with the submit bar.

          On a phone the form comes first: the rail is context, and context is
          not worth 400px of scrolling before the first field. */}
      <section className="border-y border-ink-900/[0.07] bg-ink-50 py-14 sm:py-16 lg:py-20">
        {/* Wider than the rest of the page on purpose. The masthead is a
            sentence and reads best at book measure; this is a working surface,
            and every extra inch here goes into the fields rather than into the
            line length of anything you have to read. */}
        <Container className="max-w-[100rem]">
          {/* Nothing inside is marked, so the form and the rail arrive together
              as one block — see [[useScrollReveal]]. Staggering them would mean
              the fields landing after the column explaining them. */}
          <div ref={railRef} className="grid gap-12 lg:grid-cols-12 lg:gap-0">
            {/* No enclosure of its own — the sheet is the enclosure. */}
            <div className="lg:col-span-8 lg:pr-16">
              <ContactForm />
            </div>

            {/* ── The rail ────────────────────────────────────────────────
                Divided from the form by a hairline that only exists once the
                two sit side by side; stacked, the rail's own top rule does that
                job instead. */}
            <div className="lg:col-span-4 lg:border-l lg:border-ink-900/12 lg:pl-14">
              <h2 className={LABEL}>What happens next</h2>

              {/* Numbered, because it is a sequence and the numbers are the
                  only figures in the column — they carry the reading order
                  without a heading hierarchy of their own. */}
              <ol className="mt-5 divide-y divide-ink-900/12 border-t border-ink-900/12">
                {STEPS.map((step, index) => (
                  <li key={step.id} className="flex gap-5 py-6">
                    <span
                      aria-hidden="true"
                      className="font-display text-[1.375rem] leading-none font-extrabold tracking-[-0.02em] text-brand-600 tabular-nums"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div>
                      <h3 className="text-[15px] leading-[1.35] font-semibold text-ink-900">
                        {step.title}
                      </h3>
                      <p className="mt-2 max-w-[34ch] text-[14.5px] leading-[1.6] text-ink-500 text-pretty">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <h2 className={cn(LABEL, 'mt-10')}>Your details</h2>

              <p className="mt-4 max-w-[34ch] text-[14.5px] leading-[1.65] text-ink-500 text-pretty">
                We never pass your details on, and we don’t run a mailing list. One enquiry, one
                reply.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── The office ────────────────────────────────────────────────────
          The page used to close on an index of the same three facts the footer
          already carries — a phone number, an email address and the word
          "Kathmandu" — which is a list, not an ending. What somebody who has
          decided not to fill in a form wants is where to turn up, and that is
          one thing a page can only say with a map.

          Two drafts got here. The first boxed the map beside a column of ruled
          rows — two panels of equal weight, neither of them the subject. The
          second floated an ink panel over the map, which on a page drawn
          entirely in hairlines is a card gatecrashing a printed sheet.

          So nothing floats over anything. The section is three bands stacked in
          the order they are needed: the heading, one ruled strip of four facts —
          the same strip the masthead opens the page with, so the page ends in
          the grammar it started in — and the map underneath with its own readout
          and its own gate (see OfficeMap), which is the one thing here that a
          rule cannot say. */}
      <section ref={linesRef} className="pt-20 pb-24 sm:pt-24 sm:pb-28 lg:pb-32">
        {/* The same wide measure the form band uses, for the same reason: the
            strip and the map are surfaces, not sentences, and the page's book
            measure would waste half the viewport on margins either side of a
            map. */}
        <Container className="max-w-[100rem]">
          <div data-reveal className="text-center">
            {/* The masthead's opening move, repeated at the close: the label
                between two rules rather than at the head of one, because centred
                type needs its axis established before the headline lands. Same
                construction, same hairline, one size down — the page opens and
                shuts on the same gesture. */}
            <div className="flex items-center gap-5">
              <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
              {/* Red, unlike the masthead's grey twin at the top of the page.
                  Up there the label sits above a headline that already carries
                  the brand on its verb; down here there is no red left in the
                  section — the map is Google's colours and the strip under it is
                  ink — so the label is where the page puts its last mark. */}
              {/* Written out rather than `cn(LABEL, 'text-brand-600')`: `cn` is
                  a plain join, not tailwind-merge, so two colour utilities on
                  one element would leave the winner to stylesheet order. */}
              <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600 uppercase">
                Head office
              </p>
              <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            </div>

            {/* Set at the masthead's scale rather than a section heading's: the
                page opens and closes on the same size of statement, and this one
                is carrying a full-width map under it. */}
            <h2 className="mx-auto mt-8 max-w-[18ch] font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-extrabold tracking-[-0.04em] text-ink-900 text-balance sm:mt-9">
              Come in and take a{' '}
              {/* Same rule as the masthead at the top of the page: the red sits
                  on the word, and the full stop after it stays black. Colour
                  marks the verb, not the punctuation. */}
              <span className="text-brand-600">look</span>.
            </h2>
          </div>

        </Container>

        {/* The map, framed and gated — see OfficeMap. It comes before the facts
            rather than after them: the heading says come and see us, and the
            next thing anybody wants is to see where that is. The address then
            reads as the caption to it.

            Outside the Container: the map takes the whole viewport less the page
            gutter, which is wider than any measure on the site. A map is read by
            area, not by line length, and every column of margin either side of
            it is a street nobody can see. */}
        <div data-reveal className="mt-10 w-full px-4 sm:mt-12 sm:px-6 lg:px-8">
          <OfficeMap />
        </div>

        <Container className="max-w-[100rem]">
          {/* ── The four facts ────────────────────────────────────────────
              The masthead's ruled strip, reused: the page opens on three cells
              stating the desk and closes on four stating the door. Unequal
              columns, because the address needs twice the width of the hours
              and pretending otherwise is what makes a row of cells look like a
              row of cards.

              Under the map, this strip is the plate's caption — which is why the
              address is first and set no larger than the hours beside it: the
              map has already made the point, and this is the version you copy
              into a message. */}
          <dl
            data-reveal
            className={cn(
              'mt-12 grid border-y border-ink-900/12 sm:mt-14 lg:grid-cols-[1.5fr_1fr_1.1fr_1.4fr]',
              // Rules run between cells only: horizontal while stacked,
              // vertical once all four sit side by side. One column straight
              // to four, with no two-up step in between — two cells of unequal
              // width sharing a row is where a strip like this starts looking
              // like cards.
              '[&>div]:border-t [&>div]:border-ink-900/12 [&>div]:first:border-t-0',
              'lg:[&>div]:border-t-0 lg:[&>div]:border-l lg:[&>div]:first:border-l-0',
              '[&>div]:py-5 lg:[&>div]:px-7 lg:[&>div]:first:pl-0',
            )}
          >
            {OFFICE.map((row) => (
              <div key={row.term}>
                <dt className={LABEL}>{row.term}</dt>
                <dd className="mt-3">
                  {row.href ? (
                    <a
                      href={row.href}
                      className={cn(
                        'font-display text-[15px] font-bold tracking-[-0.01em] text-ink-900 sm:text-base',
                        'transition-colors duration-300',
                        EASE,
                        'hover:text-brand-600',
                        'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
                      )}
                    >
                      {row.value}
                    </a>
                  ) : (
                    <span className="font-display text-[15px] font-bold tracking-[-0.01em] text-ink-900 sm:text-base">
                      {row.value}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
    </>
  )
}
