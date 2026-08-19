import Container from '@/components/ui/Container'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { CONTACT } from '@/constants/site'
import { cn } from '@/utils/cn'

/**
 * The shared shell for the two legal documents — terms, and the privacy policy.
 *
 * Built as one component and two thin pages because these are the same document
 * twice: a masthead, a date, and a numbered run of headed sections. Two separate
 * implementations would drift on the type scale within a month, and a reader
 * comparing them would notice.
 *
 * PAPER, LIKE CONTACT. Same register as `/contact` and for the same reason —
 * nobody arrives at a privacy policy to be sold to. No hero, no photograph, no
 * closing pitch, no reveal on the body copy. The rule-flanked eyebrow and the
 * centred headline with one red word are lifted from that page deliberately, so
 * the quiet corners of the site look like each other rather than each looking
 * like a different site.
 *
 * A SINGLE NARROW COLUMN. `max-w-[68ch]` on the prose against the page's own
 * wider container: legal text is read, not scanned, and the measure that makes
 * a spec table legible makes a paragraph of clauses exhausting. The numbered
 * headings are the only navigation — no sidebar, no sticky contents. At ten
 * sections a table of contents is furniture.
 *
 * THE SECTIONS RENDER WHETHER OR NOT THEY HAVE TEXT, and a section with none
 * says so in the open rather than being dropped. A privacy policy that quietly
 * omits its retention clause reads as complete and is not; one that prints the
 * heading with "in preparation" under it tells a reader exactly where the
 * document stands. See the note in each page file about why the bodies are
 * empty.
 */
export default function LegalPage({ eyebrow, title, accent, updated, summary, sections }) {
  const revealRef = useScrollReveal({ y: 20, stagger: 0.06 })

  const pending = sections.filter((s) => !s.body?.length).length

  return (
    <div ref={revealRef} className="bg-white">
      {/* The top padding clears the fixed navbar, matching Contact — the bar is
          `py-5` around a 48/56px logo, so 6rem is the first value that clears it
          on a phone. */}
      <section className="pt-24 pb-20 sm:pt-26 sm:pb-24">
        <Container>
          <div data-reveal="16" className="flex items-center gap-5">
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600 uppercase">
              {eyebrow}
            </p>
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
          </div>

          {/* Smaller than Contact's masthead. That page's headline is the whole
              of its top half and has nothing under it; this one is a title on a
              document, and a document's title should not be the largest thing a
              reader has to get past to reach the text. */}
          <h1
            data-reveal="24"
            className="mx-auto mt-7 max-w-[18ch] text-center font-display text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1] font-extrabold tracking-[-0.04em] text-ink-900 text-balance sm:mt-9"
          >
            {title} <span className="text-brand-600">{accent}</span>
          </h1>

          {/* The date is a fact about the document and belongs with its title,
              not in a footer. `dateTime` so it is machine-readable — a policy
              date is the one thing on a legal page a crawler or a reader in a
              dispute actually wants to parse. */}
          <p
            data-reveal="16"
            className="mt-6 text-center text-[11px] font-semibold tracking-[0.2em] text-ink-500 uppercase"
          >
            Last updated <time dateTime={updated.iso}>{updated.label}</time>
          </p>

          {summary ? (
            <p
              data-reveal="16"
              className="mx-auto mt-8 max-w-[52ch] text-center text-lg leading-relaxed text-ink-500 text-pretty"
            >
              {summary}
            </p>
          ) : null}

          {/* The state of the document, stated on the document. A page carrying
              headings with nothing under them looks broken; a page that says
              which of them are unwritten and where to ask in the meantime is a
              draft, which is what it is. It disappears on its own once every
              section has text — there is no flag to remember to remove. */}
          {pending > 0 ? (
            <div
              data-reveal="16"
              className="mx-auto mt-10 max-w-[68ch] border-l-2 border-brand-500 bg-ink-50 px-6 py-5"
            >
              <p className="text-[15px] leading-[1.65] text-ink-800">
                This document is being prepared. {pending} of {sections.length} sections are
                still to be written and are marked below. For anything you need answered before
                it is published, write to{' '}
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="font-semibold text-brand-600 underline decoration-brand-600/30 decoration-1 underline-offset-4 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:decoration-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  {CONTACT.email}
                </a>{' '}
                or call {CONTACT.phone}.
              </p>
            </div>
          ) : null}

          {/* 68 characters, not the container's width. Legal text is read
              start to finish rather than scanned, and past about seventy
              characters a reader starts losing their place returning to the
              left margin — which on a page of clauses is where comprehension
              goes. */}
          <div className="mx-auto mt-14 max-w-[68ch] sm:mt-16">
            {sections.map((section, i) => (
              <section
                key={section.heading}
                data-reveal="20"
                className={cn(
                  'border-t border-ink-900/12 pt-8',
                  i > 0 && 'mt-12',
                  i === sections.length - 1 && 'border-b pb-12',
                )}
              >
                {/* The number is the section's name as much as the words are —
                    "clause 4" is how one of these gets cited. Set in the plate
                    face beside the heading rather than above it: a numeral on
                    its own line is a chapter opener, and this is a clause. */}
                <h2 className="flex gap-4 font-display text-xl font-bold tracking-[-0.01em] text-ink-900 sm:text-2xl">
                  <span aria-hidden="true" className="font-plate text-ink-500 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {section.heading}
                </h2>

                {section.body?.length ? (
                  section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-5 text-[16px] leading-[1.7] text-ink-800 first:mt-6"
                    >
                      {paragraph}
                    </p>
                  ))
                ) : (
                  // Not styled as body copy, on purpose. Grey italic small caps
                  // cannot be mistaken for a clause by a reader skimming, which
                  // an ordinary-looking paragraph reading "to be confirmed"
                  // absolutely could.
                  <p className="mt-6 font-plate text-[11px] font-semibold tracking-[0.2em] text-ink-500 uppercase">
                    Section in preparation
                  </p>
                )}
              </section>
            ))}
          </div>
        </Container>
      </section>
    </div>
  )
}
