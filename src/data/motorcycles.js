// Placeholder catalogue. Swap for a CMS or API response later — the
// shape is what the components depend on, not the source.

// Two kinds of photograph per bike, and they are not interchangeable:
// `image` is an action frame for full-bleed use, `studio` is a cutout on
// white for the lineup selector. Imported rather than referenced from
// `public/` so Vite hashes them and fingerprints the cache.
import studioRv400 from '@/assets/images/eclipse-red-02.png'
import studioRv400Brz from '@/assets/images/cosmic-black-02.png'
import studioRv1 from '@/assets/images/sterling-silver.png'

export const MOTORCYCLES = [
  {
    slug: 'rv400',
    name: 'RV400',
    class: 'Sport',
    tagline: 'The flagship. Full-size, full-torque, fully electric.',
    priceNpr: 549000,
    image: '/images/hero/rv400brz.webp',
    studio: studioRv400,
    specs: {
      range: '150 km',
      topSpeed: '85 km/h',
      battery: '3.24 kWh',
      chargeTime: '4.5 hrs',
      motor: '3000 W mid-drive',
    },
    highlights: [
      'Three ride modes — Eco, Normal, Sport',
      'Swappable lithium-ion battery',
      'Mobile app with geo-fencing and remote start',
    ],
  },
  {
    slug: 'rv400-brz',
    name: 'RV400 BRZ',
    class: 'City',
    tagline: 'Same platform, sharper city focus.',
    priceNpr: 489000,
    image: '/images/hero/rvx.webp',
    studio: studioRv400Brz,
    specs: {
      range: '150 km',
      topSpeed: '85 km/h',
      battery: '3.24 kWh',
      chargeTime: '4.5 hrs',
      motor: '3000 W mid-drive',
    },
    highlights: [
      'Lightweight commuter geometry',
      'Combi-braking system',
      'Regenerative braking',
    ],
  },
  {
    slug: 'rv1',
    name: 'RV1',
    class: 'Commuter',
    tagline: 'Entry-level electric that still gets out of its own way.',
    priceNpr: 299000,
    image: '/images/hero/hardik-rvx.webp',
    studio: studioRv1,
    specs: {
      range: '100 km',
      topSpeed: '70 km/h',
      battery: '2.2 kWh',
      chargeTime: '4 hrs',
      motor: '1500 W hub',
    },
    highlights: [
      'Removable battery for flat-dwellers',
      'Under-seat storage',
      'Low maintenance belt drive',
    ],
  },
]

export const getMotorcycleBySlug = (slug) =>
  MOTORCYCLES.find((bike) => bike.slug === slug)
