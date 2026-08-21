// Single source of truth for site-wide copy, links and contact details.
// Update here instead of hunting through components.

export const SITE = {
  name: 'Revolt Nepal',
  tagline: 'Electric motorcycles, made for Nepal.',
  description:
    'Revolt Nepal brings next-generation electric motorcycles to Nepali roads — zero emissions, low running cost, built for the hills.',
  url: 'https://revoltnepal.com',
}

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  // "Vehicles", not "Motorcycles". The label is the longest in the bar and in
  // the footer index, and with Leadership added it was the one crowding its
  // divider — six cells cannot carry an eleven-character word. The path is
  // untouched: `/motorcycles` is the URL, the data and the page, and only the
  // word on the bar changed.
  //
  // `jumpTo` is where a plain link actually goes, and it exists because
  // `/motorcycles` is currently a stub that renders a heading and nothing else.
  // Anything that navigates should land on the lineup band on the home page
  // instead of on an empty screen.
  //
  // `to` stays `/motorcycles` and is not rewritten, because two things in the
  // navbar match on it: `HEADER_PATHS`, which decides whether this appears in
  // the bar at all, and `MENU_PATH`, which makes this the one bar item that
  // opens the lineup panel rather than navigating. Point `to` at an anchor and
  // Vehicles silently drops out of the header and the panel loses its trigger.
  //
  // So this is a deliberate, single, documented divergence rather than a second
  // source of truth: `to` is still the canonical route, and `jumpTo` is the
  // stand-in until the lineup page is built. Delete it then and the footer goes
  // back to `to` on its own.
  { label: 'Vehicles', to: '/motorcycles', jumpTo: '/#lineup' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
  // Sits next to About because it answers the follow-up question that page
  // raises: the operation is described there, and named here.
  { label: 'Leadership', to: '/leadership' },
  { label: 'Contact', to: '/contact' },
]

export const CONTACT = {
  // Printed and dialled from the same string — every caller sets it as the
  // label and wraps it in `tel:`. The country code is part of it so the link
  // works from a phone roaming outside Nepal.
  phone: '+977-9801568003',
  email: 'revolt@mvdugar.com',
  address: 'Panipokhari, Kathmandu',
  // The office map is centred on the coordinate, not on a search string: a name
  // makes Google resolve a listing and a resolved listing opens its own info
  // window over the map. Both the embed and the directions link are built from
  // this one pair in OfficeMap, so the pin and the route cannot disagree.
  //
  // Four decimal places is roughly 10m — precise enough to be a real
  // coordinate, short enough to print as a readout in one line.
  //
  // MOVED WITH THE ADDRESS, AND ONLY APPROXIMATELY. The pair below is
  // Panipokhari itself — the junction on Lazimpat Road — not the showroom's own
  // Google Maps place, which is what the old Balaju coordinate was. So the map
  // now centres on the right neighbourhood rather than on the right door.
  // Replace with the coordinate off the showroom's Maps listing when it is to
  // hand; nothing else has to change.
  coords: { lat: 27.7371, lng: 85.3232 },
  hours: 'Sun – Fri, 09:30 – 18:00',
}

export const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com/' },
  { label: 'Instagram', href: 'https://instagram.com/' },
  { label: 'YouTube', href: 'https://youtube.com/' },
  { label: 'TikTok', href: 'https://tiktok.com/' },
]
