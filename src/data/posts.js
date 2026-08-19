// Placeholder journal. Swap for a CMS or API response later — the shape is what
// the pages depend on, not the source.
//
// One post is one object. `standfirst` is the sentence that runs under the title
// on the index and again at the top of the post, so it has to work in both places
// — written as a claim, not a teaser. `body` is an array of blocks rather than a
// string of HTML: the index needs none of it, the post page renders it, and
// nobody has to sanitise anything.
//
// Covers are imported rather than referenced from `public/` so Vite hashes them
// and fingerprints the cache.
import coverRange from '@/assets/images/Hardik with RVX.jpg'
import coverCharging from '@/assets/images/bike-status.avif'
import coverService from '@/assets/images/service-and-support.avif'
import coverApp from '@/assets/images/live-tracking.avif'
import coverSecurity from '@/assets/images/geofence.avif'
import coverBattery from '@/assets/images/digital-key.avif'
import coverSos from '@/assets/images/sos-alerts.avif'

export const CATEGORIES = ['Ownership', 'Workshop', 'Charging', 'Road']

export const POSTS = [
  {
    slug: 'what-150km-means-on-nepali-roads',
    title: 'What 150 km actually means on a Nepali road',
    standfirst:
      'A range figure is measured on a flat test loop at a steady speed. Kathmandu is neither. Here is what the number does when you put a hill, a pillion and a July afternoon under it.',
    category: 'Ownership',
    date: '2026-08-11',
    read: 7,
    author: 'Prateek Rana',
    cover: coverRange,
    coverAlt: 'An RVX parked on a hill road above the valley',
    featured: true,
    body: [
      {
        type: 'p',
        text: 'Every electric motorcycle sold anywhere quotes a range, and every one of those numbers comes off a test where the road is flat, the rider is light and the throttle is held somewhere near a third. It is a real measurement. It is also the best case, and best cases are not what anybody rides.',
      },
      {
        type: 'p',
        text: 'On the ring road at 45 km/h with one rider and no cargo, an RV400 will hold close to its rated figure through a full charge. Add a pillion and you lose roughly a tenth. Ride the Nagarkot climb and you lose a quarter on the way up — then take about half of that back on the way down, because the motor turns generator the moment you stop asking it for torque.',
      },
      {
        type: 'quote',
        text: 'Range is not a fuel tank. It is a budget, and hills are the only line item that ever surprises anybody.',
      },
      {
        type: 'h',
        text: 'The three things that actually move the number',
      },
      {
        type: 'p',
        text: 'Speed, weight and gradient, in that order. Speed costs the most because drag rises with the square of it: the difference between 45 and 65 km/h is not a fifth of your range, it is closer to a third. Weight matters on the climbs and almost nowhere else. Gradient is the one riders overestimate, because they forget the descent pays some of it back.',
      },
      {
        type: 'p',
        text: 'What barely matters: cold, at least at valley temperatures. Battery chemistry does lose capacity in real cold, but Kathmandu in January is not cold enough for it to show up as anything you would notice on a commute.',
      },
      {
        type: 'h',
        text: 'How to plan a day around it',
      },
      {
        type: 'p',
        text: 'Take the rated figure, cut a fifth off it for the way you actually ride, and treat what is left as the distance you can cover without thinking about it. On that arithmetic an RV400 covers a week of ordinary valley commuting on two charges, and a day trip to Dhulikhel and back with the charger left at home.',
      },
    ],
  },
  {
    slug: 'charging-from-a-flat-in-kathmandu',
    title: 'Charging from a flat, when the meter is not yours',
    standfirst:
      'Most riders in the valley do not own a garage with a socket in it. Four arrangements that work, and the one question to settle with a landlord before you buy.',
    category: 'Charging',
    date: '2026-07-28',
    read: 6,
    author: 'Sabina Thapa',
    cover: coverCharging,
    coverAlt: 'The battery status screen on the Revolt app',
    body: [
      {
        type: 'p',
        text: 'The single most common reason somebody walks out of the showroom without buying is not price and it is not range. It is that they live on the third floor and cannot picture where the bike plugs in.',
      },
      {
        type: 'h',
        text: 'Take the battery upstairs',
      },
      {
        type: 'p',
        text: 'The pack comes out. It weighs about as much as a full jerrycan of water and it charges off an ordinary 15 A socket, which means the arrangement most riders end up with is the simplest one: the bike stays parked downstairs and the battery comes up with you.',
      },
      {
        type: 'quote',
        text: 'A removable pack turns a parking problem into a shopping-bag problem.',
      },
      {
        type: 'h',
        text: 'Settle the meter question first',
      },
      {
        type: 'p',
        text: 'A full charge is a few units of electricity — less than a night of air conditioning. That is a small enough number that most landlords will wave it through, and a specific enough number that the conversation is easy to have. Have it before you buy, not after.',
      },
    ],
  },
  {
    slug: 'first-service-what-we-actually-do',
    title: 'The first service, and what is actually done to your bike',
    standfirst:
      'No oil, no filters, no valve clearances. Six things get checked at 1,000 km, and two of them are the ones that decide how the bike feels for the next five years.',
    category: 'Workshop',
    date: '2026-07-14',
    read: 5,
    author: 'Nabin Shrestha',
    cover: coverService,
    coverAlt: 'A service technician working on a Revolt motorcycle',
    body: [
      {
        type: 'p',
        text: 'An electric drivetrain deletes most of a service schedule. What is left is not nothing, and the first visit is the one that matters most, because it is where a new bike gets set up for the rider who actually owns it rather than the one who rode it off the floor.',
      },
      {
        type: 'h',
        text: 'The six checks',
      },
      {
        type: 'p',
        text: 'Belt tension, brake pad depth and lever throw, tyre pressure against your riding weight, suspension preload, every torque value on the wheel and swingarm fasteners, and a full read of the battery management log — cell balance, charge cycles, any thermal event the pack recorded and did not tell you about.',
      },
      {
        type: 'quote',
        text: 'The log is the part you cannot do yourself, and it is the part that catches a bad cell a year before it strands anybody.',
      },
      {
        type: 'p',
        text: 'Preload and pressure are the two that change how the bike feels. A machine set up for a 60 kg rider and handed to an 85 kg one is not broken, it is just wrong, and most people ride out the whole first year assuming that is how it came.',
      },
    ],
  },
  {
    slug: 'living-with-live-tracking',
    title: 'Living with live tracking for a year',
    standfirst:
      'The feature nobody buys the bike for, and the one every owner ends up using weekly. Notes from twelve months of watching a dot move across a map.',
    category: 'Ownership',
    date: '2026-06-30',
    read: 4,
    author: 'Aashish Gurung',
    cover: coverApp,
    coverAlt: 'Live tracking view in the Revolt mobile app',
    body: [
      {
        type: 'p',
        text: 'Tracking is sold as anti-theft. It is used, overwhelmingly, for something far more ordinary: finding out whether the person who borrowed your bike has left yet.',
      },
      {
        type: 'p',
        text: 'Over a year the log becomes something else again — a fairly honest record of how you actually move around the valley, which turns out to be four routes and almost nothing else.',
      },
      {
        type: 'quote',
        text: 'Twelve months of data and the answer was: you ride the same four kilometres, most days, at the same two times.',
      },
    ],
  },
  {
    slug: 'geofencing-is-for-parents',
    title: 'Geo-fencing is not a security feature. It is a parenting one.',
    standfirst:
      'Draw a circle on a map and get told when the bike leaves it. Sold to owners worried about theft, used by families with a teenager and a licence.',
    category: 'Ownership',
    date: '2026-06-16',
    read: 4,
    author: 'Rojina Maharjan',
    cover: coverSecurity,
    coverAlt: 'Geo-fence boundary drawn on a map in the app',
    body: [
      {
        type: 'p',
        text: 'The feature is simple enough to explain in a sentence: pick a centre, pick a radius, get a notification when the bike crosses it. What is interesting is who turns it on.',
      },
      {
        type: 'p',
        text: 'Almost nobody sets a fence around their own commute. The fences that exist are drawn around neighbourhoods, and the notifications go to whoever paid for the bike rather than whoever is riding it.',
      },
    ],
  },
  {
    slug: 'what-a-battery-does-in-five-years',
    title: 'What a battery does over five years',
    standfirst:
      'Capacity does not fall off a cliff. It slopes, predictably, and how steep the slope is comes down to two habits — one of which is almost the opposite of what people assume.',
    category: 'Workshop',
    date: '2026-05-26',
    read: 8,
    author: 'Nabin Shrestha',
    cover: coverBattery,
    coverAlt: 'Digital key and battery management screen',
    body: [
      {
        type: 'p',
        text: 'A lithium pack loses capacity by cycling and by sitting at the extremes of its charge. Cycling is unavoidable — that is what the bike is for. Sitting is a habit, and it is the one worth changing.',
      },
      {
        type: 'quote',
        text: 'Charging to 100% every night and leaving it there until morning is harder on a pack than the ride you took that day.',
      },
      {
        type: 'p',
        text: 'Charge to full when you need the full range. On an ordinary week, stopping around 80% and plugging in before you get down to 10% costs nothing you will notice and measurably flattens the slope.',
      },
    ],
  },
  {
    slug: 'the-sos-button-we-hope-nobody-presses',
    title: 'The SOS button we hope nobody presses',
    standfirst:
      'Every bike has one. Here is exactly what happens in the ninety seconds after it is held down, and why the first thing it does is not call an ambulance.',
    category: 'Road',
    date: '2026-05-12',
    read: 5,
    author: 'Prateek Rana',
    cover: coverSos,
    coverAlt: 'SOS alert screen in the Revolt app',
    body: [
      {
        type: 'p',
        text: 'Hold the button for three seconds and the bike sends its position, the time, and the last thirty seconds of speed data to the numbers on your emergency list. It does not dial an emergency service, and that is deliberate.',
      },
      {
        type: 'p',
        text: 'The people most likely to reach a rider on a hill road outside the valley are the people who know which hill road they took. A dispatcher four districts away does not.',
      },
      {
        type: 'quote',
        text: 'The list is the feature. The button is just how you use it.',
      },
    ],
  },
]

export const getPostBySlug = (slug) => POSTS.find((post) => post.slug === slug)

/** The lead story, and the only post the index sets at display size. */
export const getFeaturedPost = () => POSTS.find((post) => post.featured) ?? POSTS[0]

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** "11 August 2026". One formatter, so no two pages print a date differently. */
export const formatPostDate = (iso) => DATE_FORMAT.format(new Date(`${iso}T00:00:00`))

/** "11 Aug" — for the index, where the year is the same on every row. */
export const formatPostDateShort = (iso) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(
    new Date(`${iso}T00:00:00`),
  )
