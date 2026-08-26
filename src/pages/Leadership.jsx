import Container from '@/components/ui/Container'
import { useMounted } from '@/hooks/useReveal'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useLeadership } from '@/hooks/useCollection'
import { BOARD, MANAGEMENT, PRINCIPLES } from '@/data/leadership'
import { cn } from '@/utils/cn'

/**
 * Leadership, in two tiers: the board that signs for the group, then the
 * management team that runs the distributorship.
 *
 * The two are set differently on purpose, because they answer different
 * questions. The board is who you are dealing with — four people, portraits, a
 * plate each, on the paper. The management team is who you reach — a centred
 * heading over panels on black, name at poster scale, and each panel prints to
 * paper under the pointer. Both rosters are whatever length
 * `data/leadership.js` says: every count and rule is read off the arrays.
 *
 * Portraits are not supplied yet. Rather than leave the board as a wall of grey
 * boxes or defer the band entirely, every plate renders a marked placeholder at
 * the exact aspect the photograph will occupy: hatched paper, the monogram, and
 * a line saying the portrait is to come. The layout it ships with is the layout
 * it keeps — see [[Portrait]].
 *
 *   1. Masthead — the rule-flanked label, the claim, one standfirst, and a
 *      ruled ledger on the bottom edge. About's masthead, set on this page.
 *   2. The board — four portrait plates on the paper, captioned below.
 *   3. The management team — a centred heading and panels on the black band.
 *   4. What that means — three ruled principles, numbered.
 *
 * No closing CTA. The page is a reference — who these people are — and the ask
 * is on every other page and in the footer of this one.
 *
 * DATA STATUS — every name and title on both tiers is real. The management
 * roster is the two confirmed people; the rest goes in from the admin. A panel
 * is a name, a title and a portrait, and nothing else: the remit and
 * in-post-since lines this band once carried are gone, because the copy for
 * them was never going to be approved. See `data/leadership.js`.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const LABEL = 'text-[11px] font-semibold tracking-[0.2em] uppercase'

/** Initials for the placeholder plate. Two letters — three reads as an acronym. */
const monogram = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

export default function Leadership() {
  // Read through the admin's adapter, falling back to the bundled roster. This is
  // what makes an edit in the back office — a portrait, a title, a new desk —
  // appear on this page instead of being written to a store nothing renders from.
  const { board, management } = useLeadership(BOARD, MANAGEMENT)
  const mounted = useMounted()

  const boardRef = useScrollReveal({ y: 16, duration: 0.7, stagger: 0.08 })
  const managementRef = useScrollReveal({ y: 16, duration: 0.7, stagger: 0.06 })
  const principlesRef = useScrollReveal({ y: 16, duration: 0.7, stagger: 0.07 })

  // Same helper the About masthead uses: the delay is a value, not a token, and
  // it drops to zero on the way out so a stagger never plays backwards.
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
          About's masthead, set on this page — deliberately the same object
          rather than a variation on it. Rule-flanked label, the claim centred
          at masthead scale, one standfirst, and the ledger sitting on the
          bottom edge of the first screen with the viewport's leftover height
          absorbed between them.

          The two pages are a pair: About is the operation, this is the people
          in it, and a reader arriving at the second from the first should
          recognise the page before they read a word of it. Every attempt to
          make this opening its own thing — a flush-left title block, a ghost
          nameplate behind the claim — made the pair look like two sites. */}
      <section className="flex min-h-[calc(100svh-6rem)] flex-col pt-24 pb-12 sm:pt-28 sm:pb-14">
        <Container className="flex max-w-[92rem] flex-1 flex-col">
          <div {...enter(mounted, 0, 'flex items-center gap-5')}>
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            <p className={cn(LABEL, 'shrink-0 text-brand-600')}>Leadership</p>
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
          </div>

          <h1
            {...enter(
              mounted,
              60,
              'mx-auto mt-4 max-w-[18ch] text-center font-display text-[clamp(2.5rem,7vw,5.25rem)] leading-[0.95] font-extrabold tracking-[-0.045em] text-ink-900 text-balance sm:mt-5',
            )}
          >
            Who signs for it, and who <span className="text-brand-600">runs</span> it.
          </h1>

          <p
            {...enter(
              mounted,
              140,
              'mx-auto mt-8 max-w-[52ch] text-center text-[15.5px] leading-relaxed text-ink-500 text-pretty sm:mt-9',
            )}
          >
            The board that signs for the group, and the desks you actually reach. No department to
            be escalated to: every job below has one name against it, and that is the person
            answerable when something goes wrong.
          </p>

          {/* Absorbs whatever height the viewport has left, so the ledger
              closes the first screen instead of trailing the copy. */}
          <div aria-hidden="true" className="hidden lg:block lg:flex-1" />

          {/* ── The ledger ────────────────────────────────────────────────
              Three figures, ruled, on the bottom edge — the shape of the page
              stated as numbers before either roster is read. The two counts are
              taken off `data/leadership.js`, so they cannot drift from the
              rosters below. Equal cells, because they are the same kind of fact
              at the same weight. */}
          <dl
            {...enter(
              mounted,
              160,
              cn(
                'mt-14 grid border-y border-ink-900/12 sm:mt-16 sm:grid-cols-3',
                '[&>div]:border-t [&>div]:border-ink-900/12 [&>div]:first:border-t-0',
                'sm:[&>div]:border-t-0 sm:[&>div]:border-l sm:[&>div]:first:border-l-0',
                '[&>div]:py-6 [&>div]:text-center sm:[&>div]:px-8 lg:[&>div]:py-7',
              ),
            )}
          >
            {[
              { term: 'Board of directors', value: String(board.length).padStart(2, '0') },
              { term: 'Management team', value: String(management.length).padStart(2, '0') },
              { term: 'Distributor since', value: '2023' },
            ].map((row) => (
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

      {/* ── The board ─────────────────────────────────────────────────────
          Four plates on the paper. Captions sit under the portrait rather than
          over it: a caption knocked out of the bottom of a photograph needs the
          photograph to be dark exactly there, which is a bet on four images
          that do not exist yet — and it would leave the placeholder state with
          white type on hatched paper. Under the plate it reads the same either
          way, and it is ruled, which the rest of the site is. */}
      <section id="board" ref={boardRef} className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
        <Container className="max-w-[92rem]">
          <div data-reveal className="flex items-center gap-5">
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            <p className={cn(LABEL, 'text-brand-600')}>Board of directors</p>
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            <p className={cn(LABEL, 'hidden shrink-0 text-ink-900/35 tabular-nums sm:block')}>
              01 — {String(board.length).padStart(2, '0')}
            </p>
          </div>

          {/* The heading over the plates, matching the one over the management
              panels — the two tiers are the same object twice, one on paper and
              one on black, and a label alone on this band left the second one
              looking like the only titled section on the page. A step smaller
              than the masthead above it, so the hierarchy still reads
              page → tier → person. */}
          <h2
            data-reveal
            className="mx-auto mt-10 max-w-[20ch] text-center font-display text-[clamp(2.25rem,5.2vw,4rem)] leading-[1.0] font-extrabold tracking-[-0.045em] text-ink-900 text-balance"
          >
            The four who <span className="text-brand-600">sign</span> for it.
          </h2>

          <p
            data-reveal
            className="mx-auto mt-7 max-w-[54ch] text-center text-[15.5px] leading-[1.75] text-ink-500 text-pretty"
          >
            The MV Dugar Group board, which holds the authorised distributorship for Revolt Motors
            in Nepal. They commit the capital, and they carry what the operation below them
            promises.
          </p>

          <ul className="mt-16 grid gap-x-6 gap-y-12 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
            {board.map((person, index) => {
              return (
                <li key={person.slug} id={person.slug} data-reveal className="group scroll-mt-28">
                  <Portrait person={person} />

                  {/* The rule under the plate is the caption's top edge, and it
                      turns red as the whole cell is pointed at — the one place
                      the board band moves. */}
                  <div
                    className={cn(
                      'mt-5 border-t-2 border-ink-900/12 pt-4',
                      'transition-colors duration-500',
                      EASE,
                      'group-hover:border-brand-500',
                    )}
                  >
                    {/* The index sits on the caption rule rather than over the
                        plate: a numeral on the image has to be legible against
                        a photograph that does not exist yet *and* against light
                        hatched paper, and nothing is both. */}
                    <div className="flex items-baseline justify-between gap-4">
                      <p className={cn(LABEL, 'text-brand-600')}>{person.role}</p>
                      <p aria-hidden="true" className={cn(LABEL, 'text-ink-900/25 tabular-nums')}>
                        {String(index + 1).padStart(2, '0')}
                      </p>
                    </div>

                    {/* One line. Four people share the surname, so it was set
                        under the given names to put the part that differs on
                        its own line — but the name is read as a name, and
                        breaking it made the plates look like four entries for
                        the same person. The size is clamped to the narrowest
                        cell so the longest of the four still sets flat. */}
                    <h3 className="mt-3 font-display text-[clamp(1.25rem,1.7vw,1.5rem)] leading-[1.15] font-extrabold tracking-[-0.03em] text-ink-900">
                      {person.name}
                    </h3>
                  </div>
                </li>
              )
            })}
          </ul>
        </Container>
      </section>

      {/* ── The management team ───────────────────────────────────────────
          Two desks, and the band is designed for two rather than tolerating
          them. The previous version was a six-row ledger with a remit column;
          on a roster this short that layout read as a table with the data
          missing. So the tier is set as panels on black — the only dark band
          between two white ones — and the thing that fills the panel is the
          name at poster scale with the initial standing behind it, because the
          name *is* the content.

          Three deliberate moves:

          1. The heading is centred over the roster, the way the masthead at the
             top of this page is centred over the ledger. A left rail put the
             claim beside the panels and made the band read as two unrelated
             columns; centred, it is one object with a title.
          2. The panels sit square under it — equal cells, no stepping. A
             centred title asks for a symmetrical roster beneath it, and the
             grid takes three or six without any of it being restated.
          3. Hover prints the panel to paper: the chalk ground scales up from
             the bottom edge under a red rule pulling left to right, which is
             the press pass the launch gate uses. The row version filled to ink;
             on a black band the same gesture has to run the other way.

          Everything the admin sends is already wired: `photo` swaps the ghost
          initial for a plate. Nothing here is sized to a fixed roster length. */}
      <section
        id="management"
        ref={managementRef}
        className="relative scroll-mt-24 overflow-hidden bg-ink-950 py-20 sm:py-24 lg:py-28"
      >
        {/* Tooth on the black, the same grain the dark photographic bands use.
            A flat near-black panel this large reads as a switched-off screen. */}
        <div aria-hidden="true" className="grain pointer-events-none absolute inset-0 opacity-[0.35]" />

        <Container className="relative max-w-[92rem]">
          {/* ── The heading, centred over the roster ───────────────────────
              Rule-flanked label, claim, standfirst — the page's own masthead
              set in reverse on the black. The count rides the right-hand rule
              rather than sitting under the copy as a figure: at two it would be
              a statistic about nothing. */}
          <div data-reveal className="flex items-center gap-5">
            <span aria-hidden="true" className="h-px flex-1 bg-white/15" />
            <p className={cn(LABEL, 'shrink-0 text-brand-500')}>Management team</p>
            <span aria-hidden="true" className="h-px flex-1 bg-white/15" />
            <p className={cn(LABEL, 'hidden shrink-0 text-white/30 tabular-nums sm:block')}>
              01 — {String(management.length).padStart(2, '0')}
            </p>
          </div>

          <h2
            data-reveal
            className="mx-auto mt-10 max-w-[20ch] text-center font-display text-[clamp(2.25rem,5.2vw,4rem)] leading-[1.0] font-extrabold tracking-[-0.045em] text-chalk-100 text-balance"
          >
            The desks you <span className="text-brand-500">actually</span> reach.
          </h2>

          <p
            data-reveal
            className="mx-auto mt-7 max-w-[54ch] text-center text-[15.5px] leading-[1.75] text-chalk-400 text-pretty"
          >
            The board signs for the group. These are the people who answer the phone, quote the job
            and are named when it goes wrong — reachable by name at the showroom.
          </p>

          {/* ── The panels ─────────────────────────────────────────────────
              Held to a narrower measure than the band so two cells centre
              under the heading instead of stretching to the full 92rem, where
              a pair reads as two billboards with a gap between them. */}
          <ul className="mx-auto mt-16 grid max-w-[64rem] gap-8 sm:mt-20 sm:grid-cols-2">
            {management.map((person, index) => (
              <li key={person.slug} id={person.slug} data-reveal className="group scroll-mt-28">
                <div className="relative overflow-hidden border-t border-white/15">
                  {/* The press pass: a red rule printing left to right. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-0 top-0 z-10 h-[2px] origin-left scale-x-0 bg-brand-500',
                      'transition-transform duration-700',
                      EASE,
                      'group-hover:scale-x-100',
                    )}
                  />
                  {/* Paper, pulled up from the bottom edge. Only where there is
                      no photograph: the sweep exists to give an empty panel
                      something to do on hover, and pulling a sheet of chalk up
                      over a portrait would just wipe the portrait off. */}
                  {!person.photo && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute inset-0 origin-bottom scale-y-0 bg-chalk-100',
                        'transition-transform duration-500',
                        EASE,
                        'group-hover:scale-y-100',
                      )}
                    />
                  )}

                  {/* The photograph, filling the panel.

                      Full-bleed rather than the square chip this used to be. The
                      board plates give a portrait the whole frame and these read
                      as the lesser tier for having a thumbnail in the corner,
                      which is not the distinction the page is drawing — one tier
                      signs, the other answers the phone, and neither is junior.

                      `object-top` for the same reason the board plates use it: a
                      head-and-shoulders frame cropped to a landscape panel from
                      the centre takes the chin off. The lift on hover is the
                      board's `scale-[1.03]`, so a portrait behaves the same way
                      in both tiers. */}
                  {person.photo && (
                    <>
                      <img
                        src={person.photo}
                        alt={person.name}
                        loading="lazy"
                        className={cn(
                          'absolute inset-0 h-full w-full object-cover object-top',
                          'transition-transform duration-700',
                          EASE,
                          'group-hover:scale-[1.03]',
                        )}
                      />

                      {/* The scrim, and it is doing real work rather than
                          darkening for the sake of it: the name is set at 3rem
                          in chalk and the role in brand red, and both sit over
                          whatever the photograph happens to be behind them. A
                          gradient weighted to the bottom keeps the type on a
                          field it can hold without flattening the whole frame
                          into grey. It deepens on hover, which is what replaces
                          the paper sweep here. */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute inset-0 transition-opacity duration-500 opacity-85',
                          EASE,
                          'group-hover:opacity-95',
                        )}
                        style={{
                          background:
                            'linear-gradient(to top, rgba(10,10,11,0.94) 0%, rgba(10,10,11,0.72) 38%, rgba(10,10,11,0.28) 70%, rgba(10,10,11,0.12) 100%)',
                        }}
                      />
                    </>
                  )}

                  {/* The initial, standing behind the name. This is the
                      portrait's slot: it is what a missing photograph looks
                      like here, and it is deliberately not a grey box. */}
                  {!person.photo && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none absolute -right-3 -bottom-10 font-display',
                        'text-[10rem] leading-none font-extrabold tracking-[-0.06em] text-white/[0.07]',
                        'transition-colors duration-500 sm:text-[12rem]',
                        EASE,
                        'group-hover:text-ink-900/[0.07]',
                      )}
                    >
                      {monogram(person.name)}
                    </span>
                  )}

                  <div className="relative flex min-h-[17rem] flex-col justify-between p-7 sm:p-8 lg:min-h-[21rem]">
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className={cn(
                          LABEL,
                          'text-white/35 tabular-nums transition-colors duration-500',
                          EASE,
                          !person.photo && 'group-hover:text-ink-900/40',
                        )}
                      >
                        Desk {String(index + 1).padStart(2, '0')}
                      </span>

                    </div>

                    <div className="mt-12">
                      <h3
                        className={cn(
                          'font-display text-[clamp(2.25rem,4.4vw,3.25rem)] leading-[0.98] font-extrabold tracking-[-0.045em] text-chalk-100',
                          'transition-colors duration-500',
                          EASE,
                          !person.photo && 'group-hover:text-ink-900',
                        )}
                      >
                        {person.name}
                      </h3>

                      <p
                        className={cn(
                          LABEL,
                          'mt-4 text-brand-500 transition-colors duration-500',
                          EASE,
                          !person.photo && 'group-hover:text-brand-600',
                        )}
                      >
                        {person.role}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* The roster is short on purpose and says so, once, quietly. A page
              that lists two desks without a word about it invites the reader to
              assume the rest failed to load. Centred to the panels above it, on
              their measure rather than the band's. */}
          <p
            data-reveal
            className={cn(
              LABEL,
              'mx-auto mt-16 max-w-[64rem] border-t border-white/12 pt-6 text-center text-white/30 sm:mt-20',
            )}
          >
            Further desks are published here as each appointment is confirmed
          </p>
        </Container>
      </section>

      {/* ── What that means ───────────────────────────────────────────────
          Three, numbered and ruled. Equal cells, because these are the same
          kind of claim at the same weight — the one case for equal columns. */}
      <section ref={principlesRef} className="py-16 sm:py-20 lg:py-24">
        <Container className="max-w-[92rem]">
          <div data-reveal className="flex items-center gap-5">
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            <p className={cn(LABEL, 'text-brand-600')}>What that means for you</p>
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
          </div>

          <div
            className={cn(
              'mt-12 grid border-y border-ink-900/12 sm:mt-14 lg:grid-cols-3',
              '[&>div]:border-t [&>div]:border-ink-900/12 [&>div]:first:border-t-0',
              'lg:[&>div]:border-t-0 lg:[&>div]:border-l lg:[&>div]:first:border-l-0',
              '[&>div]:py-8 lg:[&>div]:px-8 lg:[&>div]:py-10 lg:[&>div]:first:pl-0',
            )}
          >
            {PRINCIPLES.map((principle, index) => (
              <div key={principle.title} data-reveal>
                <p className={cn(LABEL, 'text-brand-600 tabular-nums')}>
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-6 font-display text-[1.5rem] leading-[1.1] font-extrabold tracking-[-0.03em] text-ink-900 sm:text-[1.75rem]">
                  {principle.title}
                </h3>
                <p className="mt-4 max-w-[38ch] text-[16px] leading-[1.75] text-ink-500 text-pretty">
                  {principle.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}

// Paper tooth for the empty plate: a hairline diagonal hatch, low enough in
// contrast to read as ruled stock rather than as a pattern. It is what tells a
// reader the box is a reserved slot and not a photograph that failed to load.
const HATCH = {
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(18,18,20,0.055) 0 1px, transparent 1px 9px)',
}

/**
 * A board member's portrait, or the slot one will occupy. 3:4, on the paper.
 *
 * It renders the photograph when `person.photo` is set and a marked placeholder
 * when it is not, at identical dimensions — so dropping a file in later changes
 * what is inside the box and nothing about the page around it.
 *
 * Board only. The management panels carry their own portrait slot, because on
 * black a hatched paper square is a hole rather than a reserved space, and the
 * ghost initial does that job there instead.
 *
 * `object-top` on the image, not `object-center`: a head-and-shoulders frame
 * cropped to 3:4 from the centre takes the chin off.
 */
function Portrait({ person }) {
  const frame = 'aspect-[3/4] w-full'

  if (person.photo) {
    return (
      <div className={cn('overflow-hidden bg-ink-50 ring-1 ring-ink-900/10', frame)}>
        <img
          src={person.photo}
          alt={person.name}
          loading="lazy"
          className={cn(
            'h-full w-full object-cover object-top',
            'transition-transform duration-700 group-hover:scale-[1.03]',
            EASE,
          )}
        />
      </div>
    )
  }

  return (
    <div
      role="img"
      aria-label={`Portrait of ${person.name} to come`}
      style={HATCH}
      className={cn('relative grid place-items-center bg-ink-50 ring-1 ring-ink-900/12', frame)}
    >
      <span
        aria-hidden="true"
        className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.03em] text-ink-900/25"
      >
        {monogram(person.name)}
      </span>

      <span aria-hidden="true" className={cn(LABEL, 'absolute bottom-4 text-[10px] text-ink-900/30')}>
        Portrait to come
      </span>
    </div>
  )
}
