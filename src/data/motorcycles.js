// Placeholder catalogue. Swap for a CMS or API response later — the
// shape is what the components depend on, not the source.

// Three kinds of photograph per bike, and they are not interchangeable:
// `image` is an action frame for full-bleed use, `studio` is a cutout on
// white for the lineup selector, and `hero` is the opening frame of the model's
// own page — a wide, dark, cinematic shot with room on the left for the name
// and room bottom-right for the price. Imported rather than referenced from
// `public/` so Vite hashes them and fingerprints the cache.
//
// `hero` is optional. DetailHero falls back to `image`, so a model with no
// dedicated frame still opens on a photograph rather than on a gap.
//
// Three lengths of copy, and they are not interchangeable — each is sized for
// the slot it appears in, which is why one field could not serve all three:
//
//   tagline  One line, read in passing: on a card, in a list, as the second
//            half of an alt attribute. Short enough to survive a narrow column.
//   pitch    The headline over the spec fold on the model's own page, set at
//            display size. Wants two or three clauses — a card tagline set at
//            2.75rem is a caption that has been enlarged, not a headline.
//   intro    The paragraph. Runs under the name in the hero and again as the
//            aside beside the studio shot.
//
// `pitch` and `intro` are both optional and both fall back: the spec fold uses
// the tagline as its headline when there is no pitch, and the hero uses the
// tagline when there is no intro. A model with only a tagline therefore reads
// as terse rather than as broken.
//
// `colours` is the paint the model is sold in, newest-first, each entry naming
// itself and carrying its own cutout:
//
//   { name: 'Cosmic Black', swatch: ['#2f3034', '#0c0c0e'], studio: <import> }
//
// `swatch` is the pair the disc in the picker is split between — these bikes
// are painted in two tones and a single flat colour would make two different
// reds the same dot. DetailSpecs shows the picker only once a model has more
// than one; below that the name still prints under the photograph, because one
// colourway is a fact about the bike rather than a choice to offer.
//
// Every model currently has exactly one, named off the cutout it already ships
// with. Adding a second is an import and a line — nothing in the component
// needs to change for the picker to appear.

// Named for what the photograph is rather than for the model it is filed
// under — see the note on the RVX below.
import heroPitLane from '@/assets/images/2.png'
// The BRZ's own opening frame, and the first `hero` on this list that is
// genuinely the model it is filed under: a night city pass with the machine
// right of centre, the RV400 BRZ badge legible on the swingarm cover, dark
// glass down the left for the name to sit against and dark road bottom-right
// for the price.
import heroBrz from '@/assets/images/RVbrz.png'
// The RV1+'s opening frame: a seaside promenade pass, red machine, RV1 badge on
// the side panel. Bright where the other two heroes are dark — see the note on
// the entry about what that costs the type set over it.
import heroRv1Plus from '@/assets/images/rv1+ (2) banner.png'
// The RV1's opening frame, and the only hero on this list that arrived already
// encoded: 91KB of AVIF against 1.5–1.6MB of PNG for the two above it. Same job,
// a seventeenth of the weight, on the element the page blocks its LCP behind.
// The other two should be converted to match.
import heroRv1 from '@/assets/images/rv1-top-banner-1.avif'
import studioRv400 from '@/assets/images/eclipse-red-02.png'
// The RV400's other four colourways, shot in the same three-quarter pose and
// under the same lighting as the red one above — which is what lets the picker
// cross-fade between them without the machine appearing to turn on the spot.
import studioRv400Black from '@/assets/images/rv400 cosmic-black-02 (2).png'
import studioRv400Blue from '@/assets/images/rv 400 india-blue-02.png'
import studioRv400Green from '@/assets/images/rv400 dark-lunar-green-02.png'
import studioRv400Mist from '@/assets/images/rv400 mist-grey-02.png'
import studioRv400Brz from '@/assets/images/cosmic-black-02.png'
// The BRZ's other three colourways, on the same bodywork and in the same
// three-quarter pose as the black one above — which is what lets the picker
// swap between them without the machine appearing to change or turn.
import studioBrzSilver from '@/assets/images/brz dark-silver-02.png'
import studioBrzBlue from '@/assets/images/brz pacific-blue-02.png'
import studioBrzRed from '@/assets/images/brz rebel-red-02.png'
// The RV1's own cutouts, at last. This entry spent its whole life illustrated by
// `sterling-silver.png`, which is a photograph of the RV BlazeX — so the lineup
// rail, the nav menu and this model's colour picker were all showing a different
// machine. These four are the RV1, badged as such, in the pose the rest of the
// catalogue uses.
//
// Distinct files from the RV1+'s four, despite sharing all four colour names and
// most of the bodywork — checked, not assumed.
import studioRv1 from '@/assets/images/rv1 neon_green-02 (2).png'
import studioRv1Blue2 from '@/assets/images/rv1 midnight_blue-02.png'
import studioRv1Cosmos2 from '@/assets/images/rv1 cosmos_red-02.png'
import studioRv1Titan2 from '@/assets/images/rv1 titan_red-02.png'
import studioRvx from '@/assets/images/cosmic-black-02 (1).png'
// The RVX's other two colourways, shot in the same three-quarter pose as the
// black one — which is what lets the picker swap between them without the
// machine appearing to turn on the spot.
import studioRvxRed from '@/assets/images/rvx eclipse-red-02 (1).png'
import studioRvxBlue from '@/assets/images/rvx electric-blue-02.png'
import studioBlazeX from '@/assets/images/eclipse-red.png'
// The BlazeX's second colourway, and the only importer of `sterling-silver.png`
// now that the RV1 has its own cutouts. That file was always a photograph of
// this machine; it spent the project so far filed under the RV1.
import studioBlazeXSilver from '@/assets/images/sterling-silver.png'
import studioRv1Neon from '@/assets/images/neon_green-02 (1).png'
// The RV1+'s other three colourways, in the same pose as the green one above.
// Two of them are reds and they are not the same idea: Cosmos is a black
// machine wearing red graphics, Titan is a red-bodied one. The discs have to
// carry that difference or the picker offers what looks like the same paint
// twice — see the swatch pairs on the entry.
import studioRv1Blue from '@/assets/images/rv1+ midnight_blue-02.png'
import studioRv1Cosmos from '@/assets/images/rv1+ cosmos_red-02.png'
import studioRv1Titan from '@/assets/images/rv1+ titan_red-02.png'

/**
 * The full wording for every measurement a model may quote, against the
 * abbreviated headings the spec fold uses. This is the reference a reader
 * consults, so the qualifications belong here: "range" on its own is a claim,
 * "Range (IDC)" is a measurement under a named cycle.
 *
 * It lives beside the data rather than in the page that first needed it because
 * two surfaces now read it — the table on the detail page and the marquee that
 * carries whatever the spec fold's rail did not take. A label map kept in one of
 * its two consumers is a label map that drifts the first time the other is
 * edited.
 *
 * A spec is rendered only if the model carries it, so entries for measurements
 * no bike quotes yet are harmless — the map is a dictionary, not a schema.
 */
export const SPEC_LABELS = {
  range: 'Range (IDC)',
  topSpeed: 'Top speed',
  battery: 'Battery',
  chargeTime: 'Charging time (0–80%)',
  fastCharge: 'Fast charging time',
  motor: 'Motor type',
  telematics: 'Telematics',
  display: 'Screen size',
  screenType: 'Screen type',
  dashboardIp: 'IP rating (dashboard)',
  startSystem: 'Start system',
  headlight: 'Headlight',
  drl: 'Daytime running light',
  tailLight: 'Tail light',
  indicators: 'Indicators',
  storage: 'Storage',
  seatHandleLock: 'Seat and handle lock',
  seatHeight: 'Seat height',
  reverseMode: 'Reverse mode',
  vehicleWarranty: 'Vehicle warranty',
  batteryWarranty: 'Battery warranty',
}

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
    // TODO: highlights
    //
    // DRAFT COPY. Deliberately free of numbers, unlike `specs` below: every
    // claim in it is about character, which the photograph is making anyway.
    tagline: 'The sharpest machine we make.',
    pitch: 'Sharpened for Speed. Built for the Hills.',
    // The line the model page sets at display size, and the only copy on the
    // site written to a length rather than to a thought: six words at most, one
    // sentence, one full stop — which the page prints in red. Anything longer
    // wraps to two lines and stops being a punch.
    //
    // Kept separate from `tagline`, which is the sentence the lineup rail and
    // the menu use and is allowed to explain itself. A model with no `punch`
    // falls back to the tagline and simply wraps. See [[DetailSpecs]].
    punch: 'Sharpened for the hills.',
    // THE SHOW PRICE, and `priceNpr` is deliberately the one being charged
    // rather than the one being crossed out. Every other reader of this field —
    // the lineup cards, the EMI calculator, the FAQ's "from X to Y" sentence —
    // is answering "what does it cost", and for as long as the offer stands the
    // honest answer is 3,99,000. `mrpNpr` is what it is measured against and is
    // shown struck through beside it; `priceLabel` replaces the standing
    // "Starting at".
    //
    // WHEN THE SHOW ENDS: drop `mrpNpr` and `priceLabel` and set `priceNpr` to
    // 433000. Nothing else has to change, and no other model carries the two
    // optional fields.
    priceNpr: 399000,
    mrpNpr: 433000,
    priceLabel: 'Exclusive NADA offer',
    image: '/images/hero/rvx.webp',
    // PLACEHOLDER FRAME, assigned deliberately. The machine in this photograph
    // wears an RV BlazeX badge on the swingarm cover; it is filed on the RVX on
    // request, as the stand-in until the RVX's own hero shot exists. Swap the
    // import for the real frame and this line needs no other change.
    hero: heroPitLane,
    studio: studioRvx,
    // Cosmic Black leads because it is also `studio` above — the cutout the
    // lineup rail and the menu already show — so a reader arriving from either
    // finds the same machine they clicked rather than a different colour.
    colours: [
      { name: 'Cosmic Black', swatch: ['#3a3b40', '#0c0c0e'], studio: studioRvx },
      { name: 'Eclipse Red', swatch: ['#c11b21', '#141416'], studio: studioRvxRed },
      { name: 'Electric Blue', swatch: ['#1e35cc', '#121214'], studio: studioRvxBlue },
    ],

    // The real sheet, replacing the RV400 figures that stood in for it.
    //
    // No `battery` and no `topSpeed`: the sheet does not give a pack capacity
    // or a top speed, and the two that were here were the placeholders. They
    // are left out rather than carried over — the spec fold picks whichever
    // three figures a model actually has, so their absence costs nothing but
    // inventing them would cost the page its accuracy.
    // WHAT IS A SPEC AND WHAT IS A HIGHLIGHT. The manufacturer's sheet answers
    // most of its own questions with the word "Yes", and a table of fifteen rows
    // reading Yes / Yes / Yes is a table that has stopped informing anybody. The
    // split is by the shape of the answer, not by the heading it arrived under:
    // a measurement, a rating or a named part goes in `specs` where the value
    // carries information; a feature that is simply present goes in `highlights`
    // where the name is the whole statement.
    //
    // The four lighting rows are kept apart rather than collapsed to "Full LED".
    // The summary would be true, but it is a sentence this page wrote rather
    // than one the sheet gave it, and set in the same table as the warranty
    // terms it would carry the same authority as the figures that were quoted.
    //
    // NOT CARRIED OVER: the Dimensions group, on request, except for the seat
    // height already here. Also dropped are the two rows the sheet answers "NA"
    // — an anti-theft wheel lock and a USB charger. Neither exists on the
    // machine, and a spec table is a list of what a thing is, not an inventory
    // of what it is not.
    //
    // No `battery` and no `topSpeed`: the sheet gives neither a pack capacity
    // nor a top speed, and the two that were once here were placeholders. They
    // are left out rather than carried over — the spec fold picks whichever
    // three figures a model actually has, so their absence costs nothing but
    // inventing them would cost the page its accuracy.
    specs: {
      range: '160 km/charge',
      chargeTime: '3 hrs 30 mins',
      fastCharge: '80 mins',
      display: '3.5 inch',
      screenType: 'PMVA (colour)',
      dashboardIp: 'IP67',
      startSystem: 'Push button with remote key',
      headlight: 'LED',
      drl: 'LED',
      tailLight: 'LED',
      indicators: 'LED',
      storage: 'Front storage box',
      seatHandleLock: 'Manual key',
      seatHeight: '815 mm',
      vehicleWarranty: '5 years or 60,000 km',
      batteryWarranty: '8 years or 80,000 km',
    },
    highlights: [
      'Mobile app connectivity',
      // GPS and the locator are two rows on the manufacturer's sheet and stay
      // two rows here. They were briefly folded into one line, which was the
      // page paraphrasing its source for tidiness — and it also left the
      // two-column list on an odd count, so the grid closed with an open cell.
      // Splitting them back is both the more faithful reading and the one that
      // squares the block.
      'GPS',
      'Vehicle locator',
      'Bluetooth and music control',
      'Call and message alerts on the cluster',
      'Geo-fencing',
      'Immobilisation',
      'Telematics',
      'Reverse mode',
      'Hill hold',
      'Walk assist',
      'Motor cover',
    ],
  },
  {
    slug: 'rv400',
    name: 'RV400',
    class: 'Sport',
    tagline: 'The flagship. Full-size, full-torque, fully electric.',
    punch: 'Full-size, fully electric.',
    priceNpr: 449000,
    image: '/images/hero/rv400brz.webp',
    studio: studioRv400,
    // Eclipse Red leads because it is also `studio` above — the cutout the
    // lineup rail and the menu already show — so a reader arriving from either
    // finds the same machine they clicked rather than a different colour.
    //
    // Every one of the five is the body colour over the same black lower half,
    // which is what the two-tone disc is split between. Mist Grey's upper stop
    // is near-white and would vanish against the fold's grey ground on its own;
    // the disc's hairline border is what keeps it a visible control.
    colours: [
      { name: 'Eclipse Red', swatch: ['#d81f26', '#141416'], studio: studioRv400 },
      { name: 'Cosmic Black', swatch: ['#33353a', '#0c0c0e'], studio: studioRv400Black },
      { name: 'India Blue', swatch: ['#1b5fd1', '#121417'], studio: studioRv400Blue },
      { name: 'Dark Lunar Green', swatch: ['#7c8a6c', '#141613'], studio: studioRv400Green },
      { name: 'Mist Grey', swatch: ['#e3e6e9', '#131417'], studio: studioRv400Mist },
    ],
    // Reconciled against the manufacturer's full sheet — performance, battery,
    // electricals and smart features. Two of the figures that were here did not
    // survive it:
    //
    // `motor` was "3000 W mid-drive". The sheet gives a motor *type*, Mid Drive
    // PMSM, and no wattage anywhere. The drive layout was right and the number
    // beside it was not, so the type is kept and the invented output is gone.
    //
    // `topSpeed` was "85 km/h" and is now dropped. The Performance section is
    // exactly where a top speed would be printed and it is not there — it gives
    // acceleration to 40 km/h and a gradability figure instead. The RVX's sheet
    // omits it too, so this looks like something Revolt does not publish rather
    // than something one page happened to leave out. A figure whose source
    // cannot be found is a figure this page should not be making. Restore it if
    // it turns up on a document.
    //
    // `chargeTime` was corrected earlier in the same pass: it read 4.5 hrs and
    // the sheet says 3 hrs 30 mins.
    //
    // Matched to the RVX's list rather than to the length of the sheet. The full
    // document runs to about thirty measurements and all thirty were briefly
    // here, which turned the table at the foot of the page into eight rows of
    // cells a reader scrolls past — the torque at the wheel, the gradability in
    // degrees, four separate IP ratings. Every one of them is true and almost
    // none of them is why somebody is on this page.
    //
    // So the same keys the RVX carries, plus the two its own sheet could not
    // give: a pack capacity and a motor type. Nineteen against sixteen — the
    // two models read as the same kind of page, which is the point.
    //
    // WHAT WAS CUT IS NOT LOST, IT IS UNQUOTED: torque at motor and wheel,
    // acceleration, gradability, belt drive, the battery's chemistry, cooling
    // and removability, and the motor / controller / battery IP ratings. All are
    // on the manufacturer's sheet and all can come back the moment there is a
    // reason to print them.
    //
    // Ordered by what a reader asks first, not by the order the sheet prints:
    // how far and how fast it fills, then the machine, then the cluster, then
    // the parts you touch, then the terms.
    specs: {
      range: '150 km/charge',
      chargeTime: '3 hrs 30 mins',
      fastCharge: '80 mins',
      battery: '3.24 kWh',
      motor: 'Mid drive PMSM',
      display: '6 inch',
      screenType: 'LCD cluster',
      telematics: '4G',
      dashboardIp: 'IP65',
      startSystem: 'Push button with remote key',
      headlight: 'LED',
      drl: 'LED',
      tailLight: 'LED',
      indicators: 'LED',
      storage: 'Front storage box',
      seatHandleLock: 'Manual key',
      seatHeight: '815 mm',
      vehicleWarranty: '5 years or 60,000 km',
      batteryWarranty: '8 years or 80,000 km',
    },
    // The sheet answers Hill Hold, Walk Assist, cluster call alerts and Motor
    // Cover with "NA" on this model — all four are the RVX's, and none of them
    // belong here. The RV400 has two the RVX does not: an anti-theft wheel lock
    // and the optional USB charger.
    //
    // "Swappable lithium-ion battery" came off this list. The sheet's own words
    // are Removable and NMC, and both are now spec rows — the highlight was
    // saying the same thing a third time, in wording nobody quoted. The old
    // "Mobile app with geo-fencing and remote start" is likewise replaced by the
    // discrete features the sheet actually lists; there is no remote start on it.
    //
    // The ride modes stay. They are not on this sheet, but the catalogue has
    // carried them from the start and the home page's ride-mode fold reads them.
    highlights: [
      'Three ride modes — Eco, Normal, Sport',
      'Mobile app connectivity',
      'Inbuilt GPS',
      'Vehicle locator',
      'Bluetooth and music control',
      'Geo-fencing',
      'Immobilisation',
      'Anti-theft wheel lock',
      'USB mobile charger (optional)',
      'Reverse mode',
    ],
  },
  {
    slug: 'rv400-brz',
    name: 'RV400 BRZ',
    class: 'City',
    tagline: 'Same platform, sharper city focus.',
    punch: 'Sharper in the city.',
    priceNpr: 419000,
    // STILL AN RVX FRAME, and still wrong. `image` is the action shot for
    // full-bleed use away from this model's own page; `hero` below now overrides
    // it there, so the detail page is correct, but anything else reaching for
    // `image` is showing a different motorcycle. Worth replacing.
    image: '/images/hero/rvx.webp',
    hero: heroBrz,
    studio: studioRv400Brz,
    // Cosmic Black leads because it is also `studio` above — the cutout the
    // lineup rail and the menu already show — so a reader arriving from either
    // finds the same machine they clicked.
    //
    // All four are the same machine in the same pose, so the picker changes the
    // paint and nothing else. Each is a body colour over the same black lower
    // half, which is what the two-tone disc is split between.
    colours: [
      { name: 'Cosmic Black', swatch: ['#3a3b40', '#0c0c0e'], studio: studioRv400Brz },
      { name: 'Rebel Red', swatch: ['#e8302a', '#141416'], studio: studioBrzRed },
      { name: 'Pacific Blue', swatch: ['#2138a8', '#121417'], studio: studioBrzBlue },
      { name: 'Dark Silver', swatch: ['#8f9298', '#17181b'], studio: studioBrzSilver },
    ],
    // Reconciled against the full sheet, and trimmed to the RVX's shape for the
    // same reason that one is: the document runs to about thirty measurements
    // and printing all of them turns the table at the foot of the page into
    // something a reader scrolls past.
    //
    // `motor` is restored. It read "3000 W mid-drive", a wattage no Revolt sheet
    // quotes; the BRZ's own document gives Mid Drive PMSM, so the type is now
    // sourced from this model rather than borrowed from the RV400's.
    //
    // `topSpeed` stays gone. The Performance section is where it would be
    // printed and it gives acceleration and gradability instead — the third
    // sheet in a row to omit it.
    //
    // SAME PLATFORM, NOT THE SAME BIKE. The tagline is right about the running
    // gear — identical pack, identical drive, identical geometry figures — but
    // the sheet is emphatic that this is the stripped variant, and the specs
    // that differ are the ones worth having on the page. Start is a manual key
    // where the RV400 has push-button with a remote. There is no telematics at
    // all. The torque figures are the surprise and go the other way: 45 Nm at
    // the motor and 180 Nm at the wheel, against the RV400's 37.4 and 149.6.
    //
    // NOT PRINTED, BUT ON THE SHEET: both torque figures, acceleration (5.2
    // sec), gradability (13.5°), belt drive, the battery's chemistry, cooling
    // and removability, and the motor / controller / battery IP ratings.
    specs: {
      range: '150 km/charge',
      chargeTime: '3 hrs 30 mins',
      fastCharge: '80 mins',
      battery: '3.24 kWh',
      motor: 'Mid drive PMSM',
      display: '6 inch',
      screenType: 'LCD cluster',
      dashboardIp: 'IP65',
      startSystem: 'Manual key',
      headlight: 'LED',
      drl: 'LED',
      tailLight: 'LED',
      indicators: 'LED',
      storage: 'Front storage box',
      seatHandleLock: 'Manual key',
      seatHeight: '815 mm',
      vehicleWarranty: '5 years or 60,000 km',
      batteryWarranty: '8 years or 80,000 km',
    },
    // A short list, and it should be. The sheet marks the app, Bluetooth,
    // geo-fencing, immobilisation, the anti-theft lock and the vehicle locator
    // as absent on this model, and hill hold, walk assist and cluster call
    // alerts as NA. Only three of the RV400's connected features survive here,
    // two of them as options. Padding it out would make the two bikes look
    // alike on the one axis where they are not.
    //
    // The first three are catalogue copy that pre-dates the sheet. Nothing on it
    // contradicts them, so they stay.
    highlights: [
      'Lightweight commuter geometry',
      'Combi-braking system',
      'Regenerative braking',
      'Reverse mode',
      'GPS (optional)',
      'USB mobile charger (optional)',
    ],
  },
  {
    slug: 'rv1',
    name: 'RV1',
    class: 'Commuter',
    tagline: 'Entry-level electric that still gets out of its own way.',
    punch: 'Quick where it counts.',
    priceNpr: null,
    // ANOTHER MODEL'S PHOTOGRAPH, like the BRZ's was. `hero` below overrides it
    // on this model's own page; anything else reaching for `image` is showing an
    // RVX under an RV1 name.
    image: '/images/hero/hardik-rvx.webp',
    hero: heroRv1,
    // MIDNIGHT BLUE LEADS, NOT NEON GREEN — and the reason is the lineup rail
    // rather than anything about this bike. The RV1 and the RV1+ share their
    // bodywork, their pose and their lighting, so with both entries leading on
    // Neon Green the two cards sat side by side as what looked like the same
    // photograph printed twice. The badge on the side panel is the only thing
    // that differs and it is a few pixels wide at card size.
    //
    // Changing the paint on one of them is what separates them, and it is the
    // RV1 that changes: green is the colour the RV1+ is shown in everywhere
    // else on the site, so moving that one would cost more than it fixed.
    //
    // The colours array is reordered to match rather than left alone. `studio`
    // leading the list is the rule the whole catalogue keeps — a reader who
    // clicks a blue machine in the rail should land on a blue machine, not on a
    // page that swaps the paint out from under them. Neon Green is still sold
    // and still in the picker, one place down.
    studio: studioRv1Blue2,
    colours: [
      { name: 'Midnight Blue', swatch: ['#1e57e0', '#17181b'], studio: studioRv1Blue2 },
      { name: 'Neon Green', swatch: ['#9bf218', '#1a1a1c'], studio: studioRv1 },
      { name: 'Cosmos Red', swatch: ['#e01b24', '#17181b'], studio: studioRv1Cosmos2 },
      { name: 'Titan Red', swatch: ['#b8232f', '#4b4e54'], studio: studioRv1Titan2 },
    ],
    // From the full sheet. Seventeen keys rather than the RV1+'s eighteen,
    // because two of the sheet's own rows are dashes on this model.
    //
    // TWO PLACEHOLDERS SURVIVED CONTACT WITH IT, the only two on this whole
    // list to do so: `range` at 100 km and `battery` at 2.2 kWh, both confirmed
    // and only reworded. Everything else that was here was wrong. `chargeTime`
    // read 4 hrs and is 2 hrs 15 mins. `topSpeed` (70 km/h) and `motor`
    // (1500 W hub) had already been dropped on the grounds that no Revolt sheet
    // publishes a top speed or a wattage, and that its siblings are all Mid
    // Drive PMSM — this sheet confirms the motor type and still gives no top
    // speed and no wattage.
    //
    // NO FAST CHARGING, and no telematics. The sheet prints a dash against both,
    // where every other model quotes 80 mins and all but the RV1+ quote 4G.
    // Those are real differences, and leaving the keys out is how the page says
    // so — a `fastCharge` of "—" would read as a figure nobody had filled in.
    //
    // ITS OWN BATTERY CHEMISTRY. Alone in the lineup the RV1 runs LFP where
    // every other model runs NMC. Not printed, because chemistry is trimmed off
    // all six entries — but if it is ever surfaced, this is the model it says
    // something about.
    //
    // Drivetrain identical to the RV1+ otherwise: same Mid Drive PMSM, same
    // 32 Nm / 128 Nm, same 7.8 sec, same 10.5° gradability, same chain drive.
    // The whole difference between the two bikes is the pack — 2.2 kWh LFP
    // against 3.24 kWh NMC — and everything that follows from it.
    //
    // NOT PRINTED, BUT ON THE SHEET: both torque figures, acceleration,
    // gradability, chain drive, the battery's chemistry, cooling and
    // removability, and the motor / controller / battery IP ratings.
    specs: {
      range: '100 km/charge',
      chargeTime: '2 hrs 15 mins',
      battery: '2.2 kWh',
      motor: 'Mid drive PMSM',
      display: '6 inch',
      screenType: 'LCD cluster',
      dashboardIp: 'IP65',
      startSystem: 'Combination lock — manual key',
      headlight: 'LED',
      drl: 'LED',
      tailLight: 'LED',
      indicators: 'LED',
      storage: 'Front storage box and underseat charger box',
      seatHandleLock: 'Manual key',
      seatHeight: '772 mm',
      vehicleWarranty: '5 years or 60,000 km',
      batteryWarranty: '8 years or 80,000 km',
    },
    // Both of the old catalogue lines are gone, and the sheet is why.
    //
    // "Low maintenance belt drive" was wrong: Drive System reads Chain Drive.
    // It had already been removed on the strength of the RV1+ and BlazeX both
    // running chains; this confirms it. "Under-seat storage" was right but is
    // now the `storage` spec above, in the sheet's own fuller wording.
    //
    // What is left matches the RV1+ exactly, which is correct — the two share
    // every connected feature and every absence. This and the RV1+ are the
    // least connected machines in the lineup.
    highlights: ['Reverse mode', 'GPS (optional)', 'USB mobile charger (optional)'],
  },

  // ── AWAITING REAL DATA ────────────────────────────────────────────────
  // Both below now carry a supplied MRP. What they still lack is `specs` and
  // `highlights`, which are deliberately left empty rather than guessed — a
  // made-up range figure on a real product is worse than a gap, and every
  // component that reads them handles the gap (the lineup on the home page
  // needs none of them).
  //
  // To finish a bike: fill the empty fields and delete its TODO line. Nothing
  // else has to change.
  //
  // On prices generally: only a figure from the MRP sheet goes in. Anything not
  // on it stays `null`, which every surface renders as "on request" rather than
  // as a blank — see `MotorcycleCard` and `DetailHero`. That is why RVX and RV1
  // carry no figure: a stale price on a real product is the one error here that
  // costs somebody money.
  {
    slug: 'blazex',
    name: 'RV BlazeX',
    class: 'Commuter',
    //
    // DRAFT COPY, written here rather than supplied. Free of numbers like the
    // rest of the taglines — the figure it is built on is real (this machine
    // quotes the RV400's torque exactly, 37.4 Nm at the motor and 149.6 at the
    // wheel, in a commuter body) but a tagline is read in passing and the spec
    // fold is where a number earns its place. The rhythm deliberately answers
    // the RV400's "Full-size, full-torque".
    tagline: 'Commuter shape. Flagship torque.',
    punch: 'Commuter shape, flagship torque.',
    priceNpr: 399000,
    image: '/images/hero/rv400brz.webp',
    studio: studioBlazeX,
    // Eclipse Red leads because it is also `studio` above — the cutout the
    // lineup rail and the menu already show.
    //
    // Both point at files already in the bundle. The two uploaded as "blazex
    // eclipse-red (1).png" and "blazex sterling-silver (1).png" are
    // byte-identical to `eclipse-red.png` and `sterling-silver.png` — same
    // md5s — so importing the copies as well would carry the same ~575KB twice
    // under two hashes.
    //
    // Sterling Silver is the same machine in the same pose as the red one, so
    // the picker cross-fades cleanly. It is also, finally, filed under the model
    // it actually shows: the RV1 entry has been carrying this photograph as its
    // own cutout, and still is.
    //
    // Both discs are split against black, per Revolt's own picker — Sterling
    // Silver reads as near-white over black there, not as silver over grey.
    colours: [
      { name: 'Eclipse Red', swatch: ['#d81f26', '#141416'], studio: studioBlazeX },
      { name: 'Sterling Silver', swatch: ['#e8e9ec', '#141416'], studio: studioBlazeXSilver },
    ],
    // From the full sheet, trimmed to the same nineteen keys the RV400 carries.
    //
    // WHAT IT SHARES AND WHAT IT DOES NOT: the RV400's torque exactly — 37.4 Nm
    // at the motor, 149.6 at the wheel — and the same 3.24 kWh removable NMC
    // pack the rest of the lineup runs, but on the RV1+'s chain drive rather
    // than the RV400's belt, and started by the RV1+'s combination lock rather
    // than a push button. Its 5.1 sec to 40 km/h is the quickest figure quoted
    // anywhere here, a tenth up on the RV400 and the BRZ.
    //
    // NOT PRINTED, BUT ON THE SHEET: both torque figures, acceleration,
    // gradability (13.5°), chain drive, the battery's chemistry, cooling and
    // removability, and the motor / controller / battery IP ratings.
    specs: {
      range: '150 km/charge',
      chargeTime: '3 hrs 30 mins',
      fastCharge: '80 mins',
      battery: '3.24 kWh',
      motor: 'Mid drive PMSM',
      display: '6 inch',
      screenType: 'LCD cluster',
      telematics: '4G',
      dashboardIp: 'IP65',
      startSystem: 'Combination lock — manual key',
      headlight: 'LED',
      drl: 'LED',
      tailLight: 'LED',
      indicators: 'LED',
      storage: 'Front storage box and underseat charger box',
      seatHandleLock: 'Manual key',
      seatHeight: '780 mm',
      vehicleWarranty: '5 years or 60,000 km',
      batteryWarranty: '8 years or 80,000 km',
    },
    // Between the two ends of the lineup on connectivity, and the list should
    // show that. It has the app, inbuilt GPS, geo-fencing, immobilisation and 4G
    // telematics, which the RV1+ has none of — but not the RV400's Bluetooth,
    // anti-theft wheel lock or vehicle locator. Hill hold, walk assist, cluster
    // alerts and the motor cover are NA, as on every model except the RVX.
    highlights: [
      'Mobile app connectivity',
      'Inbuilt GPS',
      'Geo-fencing',
      'Immobilisation',
      'Reverse mode',
      'USB mobile charger (optional)',
    ],
  },
  {
    // The RV1+. Kept as its own model rather than merged into the RV1 above,
    // which now has cutouts of its own — the two were previously told apart only
    // by their slugs, and only one of them was photographed on the right bike.
    //
    // Kept as a separate model rather than merged into that one on request. The
    // display name is what now tells the two apart on a card; before this it was
    // two entries both reading "RV1" and only the slug distinguishing them.
    slug: 'rv1-neon',
    name: 'RV1+',
    class: 'Commuter',
    //
    // DRAFT COPY, written here rather than supplied. The claim is the one thing
    // that actually separates this from the RV1: same motor, same torque, same
    // acceleration, same gradability, same chain drive — a bigger pack, and the
    // range that follows from it. Naming the sibling is the shortest way to say
    // that, and it is accurate rather than a comparison invented for effect.
    tagline: 'The RV1, with the range to leave town.',
    punch: 'The range to leave town.',
    priceNpr: 349000,
    image: '/images/hero/hardik-rvx.webp',
    // BRIGHT, WHERE THE HERO WANTS DARK. The other two frames on this list are a
    // night city and an overcast pit lane; this one is midday on a seaside
    // promenade, and the left third of it — where `DetailHero` sets the model
    // name in white — is pale sky over pale water. The section's horizontal
    // scrim runs to 78% black at the left edge and will carry the name, but it
    // is doing considerably more work here than it was drawn for, and the
    // photograph pays for it: this is the one frame on the site where the wash
    // is visible as a wash. A frame with its own dark quarter would need none
    // of that.
    hero: heroRv1Plus,
    studio: studioRv1Neon,
    // Neon Green leads because it is also `studio` above — the cutout the lineup
    // rail and the menu already show — so a reader arriving from either finds
    // the same machine they clicked.
    //
    // Cosmos Red and Titan Red are the awkward pair. Both read "red" in a list
    // and they are different machines to look at, so the discs have to say
    // which is which — given two identical red dots a reader would reasonably
    // assume one of them was a mistake.
    //
    // The lower stops are taken from Revolt's own picker, which splits its
    // discs the same way this one does: Titan is red over grey, Cosmos is red
    // over black. That is the bike in both cases — Titan is red bodywork on the
    // grey frame, Cosmos is the black machine wearing red graphics.
    colours: [
      { name: 'Neon Green', swatch: ['#9bf218', '#1a1a1c'], studio: studioRv1Neon },
      { name: 'Midnight Blue', swatch: ['#1e57e0', '#17181b'], studio: studioRv1Blue },
      { name: 'Cosmos Red', swatch: ['#e01b24', '#17181b'], studio: studioRv1Cosmos },
      { name: 'Titan Red', swatch: ['#b8232f', '#4b4e54'], studio: studioRv1Titan },
    ],
    // From the full sheet, trimmed to the same eighteen keys the BRZ carries.
    //
    // NOT THE BIKE THE ENTRY ABOVE DESCRIBES. That one quotes 2.2 kWh and a
    // 1500 W hub motor; the RV1+ runs the same 3.24 kWh removable NMC pack and
    // the same Mid Drive PMSM as the RV400 and the BRZ. Given every placeholder
    // wattage on this list has turned out to be invented, the other entry's
    // figures should be treated as unverified until its own sheet turns up.
    //
    // WHERE IT DIFFERS FROM THE REST OF THE LINEUP: chain drive, where the
    // RV400 and BRZ run belts. A combination lock rather than a push button or
    // a plain key. Underseat charger storage on top of the front box. And a
    // 772 mm seat, 43 mm lower than everything else here. The range is the
    // surprise — 160 km/charge, matching the RVX, on the cheapest machine in
    // the lineup.
    //
    // NOT PRINTED, BUT ON THE SHEET: 32 Nm at the motor and 128 Nm at the wheel,
    // acceleration (7.8 sec), gradability (10.5°), chain drive, the battery's
    // chemistry, cooling and removability, and the motor / controller / battery
    // IP ratings.
    specs: {
      range: '160 km/charge',
      chargeTime: '3 hrs 30 mins',
      fastCharge: '80 mins',
      battery: '3.24 kWh',
      motor: 'Mid drive PMSM',
      display: '6 inch',
      screenType: 'LCD cluster',
      dashboardIp: 'IP65',
      startSystem: 'Combination lock — manual key',
      headlight: 'LED',
      drl: 'LED',
      tailLight: 'LED',
      indicators: 'LED',
      storage: 'Front storage box and underseat charger box',
      seatHandleLock: 'Manual key',
      seatHeight: '772 mm',
      vehicleWarranty: '5 years or 60,000 km',
      batteryWarranty: '8 years or 80,000 km',
    },
    // Three, and the sheet does not offer a fourth. The app, Bluetooth,
    // geo-fencing, immobilisation, the anti-theft lock, the vehicle locator and
    // telematics are all marked absent; hill hold, walk assist, cluster alerts
    // and the motor cover are NA. This is the least connected machine in the
    // lineup and the list should read that way.
    highlights: ['Reverse mode', 'GPS (optional)', 'USB mobile charger (optional)'],
  },
]

/** Bikes with a confirmed price, for anything that quotes or ranks by money. */
export const PRICED_MOTORCYCLES = MOTORCYCLES.filter((bike) => bike.priceNpr != null)

/**
 * The two machines the showroom leads on. Held as slugs rather than as a
 * position in `MOTORCYCLES` for the same reason `FLAGSHIP` is: that array is
 * ordered for the catalogue and gets reshuffled, and a lineup that decides which
 * bikes are its heroes by index would quietly promote whichever ones happened to
 * move to the front.
 *
 * `FLAGSHIP` is a different question and deliberately not derived from this —
 * that one is "which bike do the home page's figures come from", and it is the
 * RV400 because the RV400 is the model with a complete spec sheet. This is
 * "which bikes does the lineup put on top", which is a commercial decision.
 */
const HERO_SLUGS = ['rvx', 'blazex']

/**
 * The two bands the home page's lineup is set in, for any catalogue — the array
 * below, or the one the admin's store answers with.
 *
 * A function rather than two constants because the lineup is no longer fixed at
 * build time: `FeaturedBikes` reads the live collection and falls back to
 * `MOTORCYCLES`, so the split has to run on whichever it got. It stays here
 * rather than in the component because which bikes lead is a commercial
 * decision about the catalogue, not a layout decision about the section.
 *
 * `rest` is derived by subtraction, so a model added in the back office appears
 * in the rail without anybody naming it — and a hero is only ever a hero
 * because its slug is listed above, never because it happens to be first.
 */
export function splitLineup(bikes = MOTORCYCLES) {
  return {
    // In the order named above rather than in catalogue order.
    heroes: HERO_SLUGS.map((slug) => bikes.find((bike) => bike.slug === slug)).filter(Boolean),
    rest: bikes.filter((bike) => !HERO_SLUGS.includes(bike.slug)),
  }
}

/** The build-time split of the bundled catalogue. */
export const { heroes: HERO_MOTORCYCLES, rest: REST_MOTORCYCLES } = splitLineup(MOTORCYCLES)

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
