// Placeholder catalogue. Swap for a CMS or API response later — the
// shape is what the components depend on, not the source.

// Two kinds of photograph per bike, and they are not interchangeable:
// `image` is an action frame for full-bleed use, `studio` is a cutout on
// white for the lineup selector. Imported rather than referenced from
// `public/` so Vite hashes them and fingerprints the cache.
import studioRv400 from '@/assets/images/eclipse-red-02.png'
import studioRv400Brz from '@/assets/images/cosmic-black-02.png'
import studioRv1 from '@/assets/images/sterling-silver.png'
import studioRvx from '@/assets/images/cosmic-black-02 (1).png'
import studioBlazeX from '@/assets/images/eclipse-red.png'
import studioRv1Neon from '@/assets/images/neon_green-02 (1).png'

export const MOTORCYCLES = [
  // RVX leads the lineup. Array order is showroom order — which bike a visitor
  // meets first — and nothing reads position 0 as "the flagship" any more; see
  // FLAGSHIP below.
  //
  // AWAITING REAL DATA, like the two at the bottom of this list.
  {
    slug: 'rvx',
    name: 'RVX',
    class: 'Sport',
    // TODO: tagline, priceNpr, specs, highlights
    tagline: '',
    priceNpr: null,
    image: '/images/hero/rvx.webp',
    studio: studioRvx,
    specs: {},
    highlights: [],
  },
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

  // ── AWAITING REAL DATA ────────────────────────────────────────────────
  // The three below carry only what the photographs themselves establish:
  // the model on the badge, the class, and the cutout. `tagline`, `priceNpr`,
  // `specs` and `highlights` are deliberately left empty rather than guessed —
  // a made-up range figure or price on a real product is worse than a gap, and
  // every component that reads them handles the gap (the lineup on the home
  // page needs none of them).
  //
  // To finish a bike: fill the four empty fields and delete its TODO line.
  // Nothing else has to change.
  {
    slug: 'blazex',
    name: 'RV BlazeX',
    class: 'Commuter',
    // TODO: tagline, priceNpr, specs, highlights
    tagline: '',
    priceNpr: null,
    image: '/images/hero/rv400brz.webp',
    studio: studioBlazeX,
    specs: {},
    highlights: [],
  },
  {
    // Second RV1 entry, kept separate from the one above on request. Note the
    // two share a display name: the card above is photographed on a BlazeX
    // (`sterling-silver.png`), this one on an actual RV1.
    slug: 'rv1-neon',
    name: 'RV1',
    class: 'Commuter',
    // TODO: tagline, priceNpr, specs, highlights
    tagline: '',
    priceNpr: null,
    image: '/images/hero/hardik-rvx.webp',
    studio: studioRv1Neon,
    specs: {},
    highlights: [],
  },
]

/** Bikes with a confirmed price, for anything that quotes or ranks by money. */
export const PRICED_MOTORCYCLES = MOTORCYCLES.filter((bike) => bike.priceNpr != null)

/**
 * The bike the home page's running-cost, charging, ride-mode and FAQ folds
 * quote their figures from. Named rather than `MOTORCYCLES[0]`: the array is
 * ordered for the showroom, so its first entry changes whenever the lineup is
 * reshuffled, and those folds would then be quoting whichever bike happened to
 * be moved to the front — or, once a model is added ahead of its spec sheet,
 * quoting nothing at all.
 */
export const FLAGSHIP = MOTORCYCLES.find((bike) => bike.slug === 'rv400')

export const getMotorcycleBySlug = (slug) =>
  MOTORCYCLES.find((bike) => bike.slug === slug)
