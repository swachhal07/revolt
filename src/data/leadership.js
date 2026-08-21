// The people who run the operation, in two tiers: the board that signs for the
// group, and the management team that runs the distributorship day to day.
//
// WHAT IS REAL AND WHAT IS NOT — every name and title on both tiers is real.
// The management tier is deliberately short: only the two confirmed people are
// listed, and the rest of the team goes in from the admin once that section
// exists. No `remit` has been approved by the person it would be printed
// under, so none is set. The board's portraits are supplied; the management
// team's are still `null`.
//
// Only the management tier can carry a `remit`. The board is listed by title.
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

/**
 * The desk-level team. This is who a customer actually reaches.
 *
 * Two entries for now — the real ones. The rest of the team is to be added from
 * the admin once the section for it is built, so this array is the shape that
 * feed has to produce: `slug`, `name`, `role`, `photo`, and optionally `remit`
 * and `since`. Both optional fields are omitted here rather than filled with a
 * guess; the row drops the line it has no value for and the band still sets
 * flat. Nothing on the page reads the length as a fixed number.
 */
export const MANAGEMENT = [
  {
    slug: 'nidhi',
    name: 'Nidhi',
    role: 'Deputy Business Head',
    photo: null,
  },
  {
    slug: 'saugat',
    name: 'Saugat',
    role: 'Sales Manager',
    photo: null,
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
