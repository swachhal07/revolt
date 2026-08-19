import LegalPage from '@/components/legal/LegalPage'
import { CONTACT, SITE } from '@/constants/site'

/**
 * Terms and conditions. Reached from the footer.
 *
 * WRITTEN AGAINST WHAT THE SITE ACTUALLY CLAIMS, which is what makes these
 * worth having rather than boilerplate. The specification clause exists because
 * this catalogue has already been through it: the figures on these pages come
 * off Revolt's own sheets, several models had placeholder numbers that turned
 * out to be wrong, and at least one source disagreed with another about which
 * colours a bike is sold in. Section 03 says so in the language of a term
 * rather than pretending it cannot happen.
 *
 * The warranty section quotes no periods. The catalogue does — 5 years or
 * 60,000 km on the vehicle and 8 years or 80,000 km on the battery, on every
 * model — but a warranty term is the manufacturer's document, and restating its
 * numbers in a second document that can fall out of date is how a dealer ends
 * up bound to a period the maker has since changed. The clause points at the
 * warranty card instead.
 *
 * IT STILL NEEDS A LAWYER. Nothing here has been reviewed against Nepal's
 * Consumer Protection Act 2075 or the Electronic Transactions Act 2063, and the
 * limitation of liability in section 09 is the clause most likely to be
 * unenforceable as drafted — consumer statute usually overrides it in part.
 * Treat this as a draft to hand to counsel, not as settled terms.
 *
 * `updated` must move whenever a clause does.
 */
const UPDATED = { iso: '2026-08-19', label: '19 August 2026' }

const SECTIONS = [
  {
    heading: 'Scope',
    body: [
      `These terms cover your use of ${SITE.url} and anything you ask us for through it — an enquiry, a test ride, a quotation, a dealership referral.`,
      'They do not replace the separate documents you sign when you actually buy a motorcycle. Where a sale agreement, a warranty card or a finance contract says something different, that document governs.',
    ],
  },
  {
    heading: 'Using this website',
    body: [
      'Use the site for what it is for: looking at the motorcycles, working out what they cost, and getting in touch. Do not attempt to break it, scrape it wholesale, or use it to send us anything abusive or unlawful.',
      'We may change or take down any part of the site at any time, including individual model pages, without notice.',
    ],
  },
  {
    heading: 'Product information and specifications',
    body: [
      'The figures on the model pages are taken from the manufacturer’s published specifications and are given in good faith. They describe the model, not the individual motorcycle you will be handed.',
      'Manufacturer figures are measured under standard test conditions. Real range in particular depends on load, terrain, riding style, weather and the age of the battery, and on Nepali roads it will commonly be lower than the quoted figure. Treat a range number as a comparison between models rather than a promise about your commute.',
      'Specifications, features and available colours change, and can differ between markets. We correct this site as we learn of changes, but we cannot guarantee every page is current at the moment you read it. Confirm anything you are relying on with us before you commit to it.',
    ],
  },
  {
    heading: 'Pricing and availability',
    body: [
      'Prices shown are ex-showroom Kathmandu in Nepali rupees. They exclude registration, insurance, accessories and delivery unless we say otherwise in writing.',
      'A price on this site is an invitation to enquire, not a binding offer. Prices and availability change, taxes and duties change, and neither is within our control. The price we confirm to you in writing at the time of order is the one that applies.',
      'Where a model shows no price, we have not published one yet — ask us.',
    ],
  },
  {
    heading: 'Test rides and bookings',
    body: [
      'Submitting the form requests a test ride; it does not confirm one. We will contact you to arrange a time, and a booking exists once we have confirmed it.',
      'To ride, you must hold a valid Nepali licence for the category of motorcycle and be able to show it. We may decline a test ride at our discretion, including on safety grounds, and we may require a deposit or a signed acknowledgement before handing over a machine.',
      'Ride within the law and within the route or area agreed with us. You are responsible for traffic offences committed during a test ride.',
    ],
  },
  {
    heading: 'Orders, payment and delivery',
    body: [
      'An order is placed through us directly or through an authorised dealer, not on this website — there is no checkout here. Payment terms, deposits and any cancellation or refund arrangements are set out in the sale document you sign at that point.',
      'Delivery dates given before an order is confirmed are estimates. Supply of electric motorcycles depends on import and manufacturing schedules that we do not control.',
    ],
  },
  {
    heading: 'Warranty and service',
    body: [
      'Motorcycles are covered by the manufacturer’s warranty. The exact periods, what they cover and what voids them are set out on the warranty card supplied with the vehicle, and that document — not this page and not the model pages — is the authoritative statement of your warranty.',
      'Warranty cover generally depends on servicing at authorised centres and on the vehicle not having been modified, misused or repaired elsewhere.',
      'Nothing in these terms limits rights you have under Nepali consumer law.',
    ],
  },
  {
    heading: 'Intellectual property',
    body: [
      'The text, photographs, layout and code of this site belong to us or to our licensors. The Revolt name, logo and model names belong to their owner and are used here under licence.',
      'You may link to the site and quote briefly from it with attribution. You may not republish its photography or reproduce substantial parts of it without our written permission.',
    ],
  },
  {
    heading: 'Limitation of liability',
    body: [
      'We take reasonable care to keep this site accurate and available, but we do not warrant that it is free of errors or that it will always be reachable.',
      'To the extent the law permits, we are not liable for indirect or consequential loss arising from your use of this site or from reliance on information published on it.',
      'Nothing here excludes liability that cannot lawfully be excluded — including for death or personal injury caused by our negligence, or for fraud. Your rights under Nepali consumer law stand regardless of anything on this page.',
    ],
  },
  {
    heading: 'Governing law and contact',
    body: [
      'These terms are governed by the laws of Nepal, and the courts of Nepal have jurisdiction over any dispute arising from them.',
      'If we change these terms we will update this page and move the date at the top of it.',
      `Questions go to ${CONTACT.email} or ${CONTACT.phone}. ${SITE.name}, ${CONTACT.address}, open ${CONTACT.hours}.`,
    ],
  },
]

export default function Terms() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms and"
      accent="conditions"
      updated={UPDATED}
      summary="The terms you agree to when you use this site, book a test ride, or buy a motorcycle from Revolt Nepal."
      sections={SECTIONS}
    />
  )
}
