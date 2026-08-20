// The showroom network. One showroom, in Kathmandu — the address and phone are
// still placeholders and need the real values before launch.
//
// `coords` is what puts a showroom on the network map (see [[NetworkMap]]), and
// it is required: the map fits its view to the pins it is given, so a showroom
// without a coordinate is a showroom nobody can find. Four decimal places is
// roughly 10m, which is the precision `CONTACT.coords` is stated at too.
//
// Adding a showroom is this file and nothing else. The map, the count above it
// and the index beside it all read from this array.

export const DEALERS = [
  {
    id: 'ktm-01',
    name: 'Revolt Kathmandu',
    city: 'Kathmandu',
    province: 'Bagmati',
    address: 'Naxal, Kathmandu',
    phone: '+977-1-0000001',
    // PLACEHOLDER — Naxal, not the showroom's own door. Replace with the
    // coordinate off the Maps listing when it is to hand.
    coords: { lat: 27.7172, lng: 85.3308 },
  },
]
