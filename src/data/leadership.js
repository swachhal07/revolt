// The people who run the operation, in two tiers: the board that signs for the
// group, and the management team that runs the distributorship day to day.
//
// WHAT IS REAL AND WHAT IS NOT — every name and title on both tiers is real.
// The management tier is deliberately short: only the two confirmed people are
// listed, and the rest of the team goes in from the admin. The board's
// portraits are supplied; the management team's are still `null`.
//
// A person is a name, a title and a portrait. Both tiers once had room for a
// remit — a line on what that person is answerable for — and it is gone: it is
// a sentence that has to be approved by the person it is printed under, and a
// field nobody will ever fill is worse than no field at all.

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
 * Two entries for now — the real ones. The rest of the team is added from the
 * admin, so this array is the shape that feed has to produce: `slug`, `name`,
 * `role`, `photo`. A missing portrait is `null` rather than absent, and the
 * panel holds a marked slot for it. Nothing on the page reads the length as a
 * fixed number.
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
