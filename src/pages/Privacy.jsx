import LegalPage from '@/components/legal/LegalPage'
import { CONTACT, SITE } from '@/constants/site'

/**
 * Privacy policy. Reached from the footer.
 *
 * WRITTEN FROM THE CODE, NOT FROM A TEMPLATE. Every claim below was checked
 * against what this site actually does:
 *
 *   - the fields are the ones `ContactForm` renders — name, email, phone, the
 *     enquiry type, the message, plus a honeypot named `company` that a human
 *     never sees or fills;
 *   - there is no analytics of any kind in the bundle. No gtag, no GTM, no
 *     Plausible, nothing;
 *   - the site sets no cookies and writes nothing to localStorage or
 *     sessionStorage — searched for, not assumed;
 *   - Google Fonts is loaded from `fonts.googleapis.com` in `index.html`, on
 *     every page, which discloses the visitor's IP to Google;
 *   - the office map on `/contact` is a Google iframe, so it does the same, on
 *     that page only.
 *
 * IT STILL NEEDS A LAWYER. It is accurate about the mechanics and plainly
 * written, which is most of the work, but it has not been reviewed against
 * Nepal's Individual Privacy Act 2075 or the Consumer Protection Act 2075, and
 * whether the business needs to register as a data controller is not a question
 * a component file can answer. Treat this as a draft to hand to counsel.
 *
 * Sections 1 and 4 describe the form delivering to an inbox, and it now does:
 * submissions are relayed by Web3Forms, which is named in section 4 because a
 * policy that says "a service" is not telling anyone anything. If the form is
 * ever pointed somewhere else, that clause is the one to change.
 *
 * `updated` must move whenever a clause does.
 */
const UPDATED = { iso: '2026-08-19', label: '19 August 2026' }

const SECTIONS = [
  {
    heading: 'What we collect',
    body: [
      'When you send us an enquiry through the contact form we collect your name, your email address, the kind of enquiry you are making, and your message. A phone number is optional and only collected if you give one.',
      'We collect nothing else on this site. There is no account to create, no newsletter sign-up, and no tracking of the pages you visit. Browsing the site without contacting us leaves us with no information about you at all.',
      'Our web host may keep standard server logs, which typically include IP addresses and browser details. We do not use those logs to build any picture of individual visitors.',
    ],
  },
  {
    heading: 'How we use it',
    body: [
      'We use what you send us to answer you, and to arrange whatever you asked for — a test ride, a price, a service appointment, a dealership enquiry.',
      'We do not use it for marketing. We will not add you to a mailing list because you asked a question, and we will not send you anything you did not ask for.',
    ],
  },
  {
    heading: 'Cookies and analytics',
    body: [
      'This site sets no cookies and stores nothing in your browser. There is no analytics on it — no Google Analytics, no tracking pixels, no third-party measurement of any kind. This is why you are not asked to accept anything when you arrive.',
      'Two Google services are loaded as part of the page. The site uses Google Fonts, which means Google receives your IP address and browser details on every page you open. The office map on our contact page is a Google Maps embed, which does the same on that page. Both are governed by Google’s own privacy policy rather than this one.',
    ],
  },
  {
    heading: 'Who we share it with',
    body: [
      'Your enquiry goes to us. We do not sell personal information, and we do not pass it to advertisers or data brokers.',
      'We share it only where doing so is the point — for example with a dealership or service centre when your enquiry is one they need to handle — or where the law requires it.',
      'Our contact form is delivered by Web3Forms, which relays what you send to our inbox and necessarily processes it in transit, as does our web host. Web3Forms is governed by its own privacy policy rather than this one.',
    ],
  },
  {
    heading: 'How long we keep it',
    body: [
      'We keep enquiry correspondence while it is useful: for as long as it takes to deal with your question, and afterwards for a reasonable period so that we have a record of the conversation if you come back to us about the same thing.',
      'Where an enquiry becomes a purchase or a service record, we keep it as long as our warranty and tax obligations require.',
      'You can ask us to delete your correspondence at any time. See section 07.',
    ],
  },
  {
    heading: 'Where it is stored',
    body: [
      'Our website and our email are hosted by third-party providers, which means your enquiry may be stored on servers outside Nepal. We choose providers that offer reasonable, industry-standard protection for the data they hold.',
    ],
  },
  {
    heading: 'Your rights over your data',
    body: [
      'You can ask us what we hold about you, ask us to correct it if it is wrong, and ask us to delete it. You can also ask us to stop using it.',
      'Write to us at the address in section 10 and we will respond. There is no charge for asking.',
    ],
  },
  {
    heading: 'Security',
    body: [
      'The site is served over HTTPS, so what you type into the contact form is encrypted in transit.',
      'No system is perfectly secure, and we will not claim otherwise. Please do not send anything highly sensitive — identity documents, card numbers, passwords — through the contact form. If we need something of that kind we will tell you a safer way to send it.',
    ],
  },
  {
    heading: 'Changes to this policy',
    body: [
      'If we change how we handle your information we will update this page and move the date at the top of it. That date is the reliable indication of when this policy last changed.',
    ],
  },
  {
    heading: 'How to reach us',
    body: [
      `Questions about this policy, or about the information we hold on you, go to ${CONTACT.email} or ${CONTACT.phone}.`,
      `${SITE.name}, ${CONTACT.address}. Our desk is open ${CONTACT.hours}.`,
    ],
  },
]

export default function Privacy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy"
      accent="policy"
      updated={UPDATED}
      summary="What Revolt Nepal collects when you use this site or get in touch, what happens to it, and how to ask us about it."
      sections={SECTIONS}
    />
  )
}
