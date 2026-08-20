// The people who run the operation, in two tiers: the board that signs for the
// group, and the management team that runs the distributorship day to day.
//
// WHAT IS REAL AND WHAT IS NOT — the four board names and their titles are
// real. Everything else is drafted: the management team's names and titles are
// stand-ins, and no `remit` line on this page has been approved by the person
// it is printed under. The board's portraits are supplied; the management
// team's are still `null`.
//
// Only the management tier carries a `remit`. The board is listed by title.
//
// `remit` is deliberately what the person is answerable for rather than a
// biography. A leadership page that lists degrees answers a question nobody
// asked; a customer wants to know who owns the problem when their bike is off
// the road, and an institution wants to know who signs.

import motiLalDugar from '@/assets/images/leadership/moti-lal-dugar.webp'
import namanDugar from '@/assets/images/leadership/naman-dugar.webp'
import shubhamDugar from '@/assets/images/leadership/shubham-dugar.webp'
import vivekDugar from '@/assets/images/leadership/vivek-dugar.webp'

/**
 * The board. These four names and their titles are real.
 *
 * `photo` is the portrait, imported at the top of this file from
 * `assets/images/leadership/`, where each file is named for the person's slug.
 * The plates still render a marked placeholder at the same aspect when a photo
 * is missing, so a director joining tomorrow gets a reserved slot rather than a
 * broken card — set `photo: null` and the page holds the shape.
 *
 * No `remit` here: the board plates carry the title and the name only. What a
 * director is answerable for is a sentence that has to be approved by them, and
 * the page reads better without four paragraphs of it under four portraits.
 */
export const BOARD = [
  {
    slug: 'moti-lal-dugar',
    name: 'Moti Lal Dugar',
    role: 'Chairman',
    photo: motiLalDugar,
  },
  {
    slug: 'vivek-dugar',
    name: 'Vivek Dugar',
    role: 'Vice Chairman',
    photo: vivekDugar,
  },
  {
    slug: 'shubham-dugar',
    name: 'Shubham Dugar',
    role: 'Director',
    photo: shubhamDugar,
  },
  {
    slug: 'naman-dugar',
    name: 'Naman Dugar',
    role: 'Director',
    photo: namanDugar,
  },
]

/** The desk-level team. This is who a customer actually reaches. */
export const MANAGEMENT = [
  {
    slug: 'managing-director',
    name: 'Nirajan Dugar',
    role: 'Managing Director',
    since: '2023',
    photo: null,
    remit:
      'Runs the operation against what the board committed to. Every escalation that leaves the showroom stops here.',
  },
  {
    slug: 'service',
    name: 'Bibek Shrestha',
    role: 'Head of Service',
    since: '2023',
    photo: null,
    remit:
      'Owns the workshop and the diagnostic bench. Every warranty call and every battery log that comes back reading wrong ends on this desk.',
  },
  {
    slug: 'parts',
    name: 'Anisha Gurung',
    role: 'Parts & Supply Chain',
    since: '2023',
    photo: null,
    remit:
      'Decides what sits on the shelf before anyone asks for it. Controllers, chargers, harnesses — the parts that decide a week from a month.',
  },
  {
    slug: 'sales',
    name: 'Prakash Adhikari',
    role: 'Sales & Showroom',
    since: '2024',
    photo: null,
    remit:
      'Runs the floor and the test-ride book. Answerable for the bike a rider is put on being the one that suits the road they actually ride.',
  },
  {
    slug: 'workshop',
    name: 'Ramesh Tamang',
    role: 'Workshop Lead Technician',
    since: '2023',
    photo: null,
    remit:
      'Factory-trained on the platform. The last person to touch a bike before it is handed back, and the one who signs that it is right.',
  },
  {
    slug: 'support',
    name: 'Sneha Maharjan',
    role: 'Customer Support',
    since: '2024',
    photo: null,
    remit:
      'The number on the contact page rings at this desk. Tracks every open case to a closed one and reports the ones that took too long.',
  },
]

// How the two rosters above are meant to behave. Three, because a list of
// values long enough to scroll is a list nobody is held to.
export const PRINCIPLES = [
  {
    title: 'A name, not a department',
    body: 'Every part of this operation has one person answerable for it, and that person is listed above. Nothing is escalated to a team.',
  },
  {
    title: 'The workshop reports to the board',
    body: 'Service data goes up the same month it is recorded. A recurring fault is a purchasing decision, not a complaint.',
  },
  {
    title: 'Reachable in person',
    body: 'Ask for someone by name at the showroom or on the phone. If they are not in, you are told when they will be — not passed on.',
  },
]
