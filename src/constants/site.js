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
  { label: 'Motorcycles', to: '/motorcycles' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export const CONTACT = {
  // Printed and dialled from the same string — every caller sets it as the
  // label and wraps it in `tel:`. The country code is part of it so the link
  // works from a phone roaming outside Nepal.
  phone: '+977-9801568003',
  email: 'info@revoltnepal.com',
  address: 'Balaju, Kathmandu, Nepal',
  // The office map is centred on the coordinate, not on a search string: a name
  // makes Google resolve a listing and a resolved listing opens its own info
  // window over the map. Both the embed and the directions link are built from
  // this one pair in OfficeMap, so the pin and the route cannot disagree.
  //
  // Taken off the showroom's own Google Maps place. Four decimal places is
  // roughly 10m — precise enough to be a real coordinate, short enough to print
  // as a readout in one line.
  coords: { lat: 27.7292, lng: 85.3015 },
  hours: 'Sun – Fri, 09:30 – 18:00',
}

export const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com/' },
  { label: 'Instagram', href: 'https://instagram.com/' },
  { label: 'YouTube', href: 'https://youtube.com/' },
  { label: 'TikTok', href: 'https://tiktok.com/' },
]
