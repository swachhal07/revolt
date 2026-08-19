import { Link, useParams } from 'react-router-dom'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { ArrowRight, ArrowUpRight } from '@/components/ui/icons'
import { useMounted } from '@/hooks/useReveal'
import { formatPostDate, getPostBySlug } from '@/data/posts'
import { cn } from '@/utils/cn'

/**
 * One note.
 *
 * The draft this replaces opened on a back link, a line of tracked caps, a
 * title, a standfirst and a byline — five stacked text blocks on white before
 * anything to look at. It read as a document rather than as a page, and the
 * photograph arrived after the reader had already decided.
 *
 * So the head is now a spread. The title takes seven columns, the cover takes
 * five in a tall crop beside it, and the two share one hairline. An image is on
 * screen in the first viewport, the page has an axis that is not dead centre,
 * and the title has something to be big against.
 *
 * Below it, the reading column and four devices, each doing one job.
 *
 *   1. A drop cap on the first paragraph. It marks where the piece starts, which
 *      is the one thing a wall of even paragraphs cannot say for itself.
 *   2. A short red rule over every section head. It marks the change of gear
 *      without a bold sentence inside the copy doing it, and it is the same mark
 *      the pull quotes carry, so the two read as one system.
 *   3. Pull quotes as display type in the column, no indent and no left border —
 *      a quotation is a change of voice, and the size is what says so.
 *   4. An end mark, then the colophon: who wrote it, when it was filed, and the
 *      way back. A reading page needs an ending, and a reader at the foot of one
 *      needs somewhere to go that is not the browser's back button.
 *
 * Everything below the head sits on one centred axis. Measure is 40rem at
 * 17px/1.75 — about 70 characters, which is the only reason any of those numbers
 * are what they are.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const LABEL = 'text-[11px] font-semibold tracking-[0.2em] uppercase'

/** Initials, for the colophon's monogram. Two at most: "Sabina Thapa" → ST. */
const initials = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

export default function BlogPost() {
  const { slug } = useParams()
  const mounted = useMounted()

  const post = getPostBySlug(slug)

  // A slug that does not exist is a mistyped URL or a note that has been pulled,
  // and either way the useful answer is the archive rather than a 404 shrug.
  if (!post) {
    return (
      <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
        <Container>
          <p className={cn(LABEL, 'text-brand-600')}>Not filed</p>
          <h1 className="mt-6 max-w-[24ch] font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1] font-extrabold tracking-[-0.04em] text-ink-900 text-balance">
            There is no note at that address.
          </h1>
          <Button
            to="/blog"
            variant="secondary"
            size="lg"
            className="mt-10"
            trailingIcon={<ArrowRight className="size-4" />}
          >
            Back to the journal
          </Button>
        </Container>
      </section>
    )
  }

  const enter = (delay, className) => ({
    style: { transitionDelay: mounted ? `${delay}ms` : '0ms' },
    className: cn(
      'transition-[opacity,transform] duration-700',
      EASE,
      mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      className,
    ),
  })

  // The body is walked once here rather than inside the map: a section head needs
  // to know whether it is the first block on the page (no top rule wanted) and
  // the first paragraph needs to know it is the first (drop cap), and both are
  // cheaper to answer from an index than from state.
  const firstParagraph = post.body.findIndex((block) => !block.type || block.type === 'p')

  return (
    <article>
      {/* ── The head ──────────────────────────────────────────────────────
          Seven columns of type against five of photograph. Top padding clears
          the fixed navbar. */}
      <header className="pt-22 pb-12 sm:pt-24 sm:pb-14">
        <Container className="max-w-[84rem]">
          <div {...enter(0, 'grid gap-10 lg:grid-cols-12 lg:gap-14')}>
            <div className="lg:col-span-7">
              <Link
                to="/blog"
                className={cn(
                  'group inline-flex items-center gap-2 text-sm font-semibold text-ink-500',
                  'transition-colors duration-300',
                  EASE,
                  'hover:text-ink-900',
                  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
                )}
              >
                <ArrowUpRight
                  className={cn(
                    'size-4 -scale-x-100 transition-transform duration-500',
                    EASE,
                    'group-hover:-translate-x-0.5 group-hover:-translate-y-0.5',
                  )}
                />
                Field notes
              </Link>

              {/* Category in red and set apart by a rule; the date and length are
                  grey, because they are reference and it is not. */}
              <p className={cn('mt-9 flex flex-wrap items-center gap-x-4 gap-y-2', LABEL)}>
                <span className="text-brand-600">{post.category}</span>
                <span aria-hidden="true" className="h-px w-6 bg-ink-900/20" />
                <span className="text-ink-500 tabular-nums">{formatPostDate(post.date)}</span>
                <span className="text-ink-500 tabular-nums">{post.read} min read</span>
              </p>

              <h1 className="mt-6 font-display text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[0.98] font-extrabold tracking-[-0.042em] text-ink-900 text-balance">
                {post.title}
              </h1>

              {/* The standfirst is grey and a step above the body: the sentence
                  that decides whether anybody reads the rest is not body copy. */}
              <p className="mt-7 max-w-[50ch] text-[17.5px] leading-[1.6] text-ink-500 text-pretty">
                {post.standfirst}
              </p>
            </div>

            {/* A tall crop, not the index's 4/3: portrait against a block of
                type is what stops the spread reading as two rectangles. Trayed
                with concentric radii, the way every photograph on this site is
                seated. */}
            <div className="lg:col-span-5">
              <div
                {...enter(
                  100,
                  'rounded-[1.75rem] bg-ink-50/80 p-2 ring-1 ring-ink-900/[0.06] shadow-[0_40px_90px_-60px_rgba(5,5,5,0.5)]',
                )}
              >
                <div className="overflow-hidden rounded-[calc(1.75rem-0.5rem)] bg-ink-50">
                  <img
                    src={post.cover}
                    alt={post.coverAlt}
                    className="aspect-[4/5] w-full object-cover lg:aspect-[4/5]"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* ── The body ──────────────────────────────────────────────────────
          One axis, centred. An earlier pass hung the section heads out into the
          left margin and let the pull quotes break wider than the measure, which
          is a real editorial device and the wrong one here: with a head every
          two paragraphs the page stepped left and right down its whole length,
          and a reading page has one job that asymmetry does not help.

          So heads and quotes sit in the column with everything else, and the red
          rule above each of them is what marks the change of gear. */}
      <div className="border-t border-ink-900/12 pt-12 pb-8 sm:pt-14">
        <Container className="max-w-[84rem]">
          <div className="mx-auto max-w-[40rem]">
            {post.body.map((block, index) => {
              if (block.type === 'h') {
                return (
                  <h2 key={index} className="mt-14 first:mt-0">
                    <span aria-hidden="true" className="mb-3 block h-[2px] w-8 bg-brand-500" />
                    <span className="block font-display text-[1.375rem] leading-[1.2] font-extrabold tracking-[-0.028em] text-ink-900 sm:text-[1.5rem]">
                      {block.text}
                    </span>
                  </h2>
                )
              }

              if (block.type === 'quote') {
                return (
                  <blockquote key={index} className="my-12">
                    <span aria-hidden="true" className="mb-5 block h-[2px] w-10 bg-brand-500" />
                    <p className="font-display text-[1.375rem] leading-[1.25] font-extrabold tracking-[-0.03em] text-ink-900 text-balance sm:text-[1.625rem]">
                      {block.text}
                    </p>
                  </blockquote>
                )
              }

              const isFirst = index === firstParagraph

              return (
                <p
                  key={index}
                  className={cn(
                    'text-[17px] leading-[1.75] text-ink-800 text-pretty',
                    // A section head hung in the left margin leaves the paragraph
                    // under it at the top of its own block, so the first
                    // paragraph after one gets a smaller gap than the run.
                    'mt-6',
                    isFirst && 'mt-0',
                    // The drop cap: three lines deep, in the display face, with
                    // the optical corrections a cap needs — pulled up off its own
                    // leading and kerned into the word it starts.
                    isFirst &&
                      'first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-display first-letter:text-[3.75rem] first-letter:leading-[0.78] first-letter:font-extrabold first-letter:tracking-[-0.04em] first-letter:text-ink-900',
                  )}
                >
                  {block.text}
                </p>
              )
            })}

            {/* The end mark. Every note on the site ends on the same square, so
                a reader knows the piece has finished rather than the images
                having failed to load. */}
            <p aria-hidden="true" className="mt-10">
              <span className="inline-block size-2 bg-brand-500" />
            </p>
          </div>
        </Container>
      </div>

      {/* ── The colophon ──────────────────────────────────────────────────
          Who wrote it, when it was filed, and the way back — on the reading
          column's own axis, ruled off rather than boxed, and the only place on
          the page with a filled control. */}
      <footer className="pb-24 sm:pb-28 lg:pb-32">
        <Container className="max-w-[84rem]">
          <div className="mx-auto max-w-[40rem] border-t border-ink-900/12 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
              <div className="flex items-center gap-4">
                {/* A monogram rather than a stock portrait. Squared, not a
                    circle: the site has one round shape and it is a button. */}
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center bg-ink-900 font-display text-[13px] font-extrabold tracking-[0.02em] text-white"
                >
                  {initials(post.author)}
                </span>

                <span className="block">
                  <span className="block font-display text-[15px] font-bold tracking-[-0.01em] text-ink-900">
                    {post.author}
                  </span>
                  <span className={cn('mt-1 block text-ink-500', LABEL)}>
                    Filed {formatPostDate(post.date)}
                  </span>
                </span>
              </div>

              <Button
                to="/blog"
                variant="secondary"
                size="md"
                trailingIcon={<ArrowRight className="size-4" />}
              >
                More field notes
              </Button>
            </div>
          </div>
        </Container>
      </footer>
    </article>
  )
}
