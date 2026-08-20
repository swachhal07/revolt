// MV Dugar Group's auto division, branch by branch.
//
// SUPPLIED DATA, and it is the group's own — not Revolt's. `data/dealers.js`
// holds the Revolt showrooms, which is a different and much shorter list; this
// is the distribution and service network the motorcycles sit inside, and it is
// why a rider in Taplejung is not on their own. Kept in two files because they
// answer two questions and will grow at completely different rates.
//
// Names, addresses, branch managers and their numbers are as supplied by the
// group. Addresses are printed close to verbatim — the ward numbers are how a
// branch is actually found in Nepal — with only capitalisation and spacing
// normalised. No name has been re-spelled.
//
// COORDINATES ARE TOWN-LEVEL AND APPROXIMATE. They place each branch in its own
// town, which is what a national network map is read for; they are not the
// door. Replace any of them with the coordinate off the branch's own Maps
// listing and the pin sharpens with no other change.
//
// `labelSide` moves a branch's name chip off the default right-hand side. Only
// set where the country puts two branches close enough that their labels collide
// at the map's fitted zoom — Nepalgunj into Dang, Janakpur into Lahan. It is a
// hint rather than a guarantee: the map runs its own collision pass on top and
// drops whatever still overlaps at the reader's actual window width. See
// [[NetworkMap]].
//
// A `sales point` is a smaller counter reporting to the branch above it, which
// is why they are nested rather than listed flat: the manager and the number
// are shared with the parent, and printing them twice would suggest two desks.

export const BRANCHES = [
  {
    id: 'jeetpur',
    name: 'Jeetpur',
    address: 'Chhatapipra, Ward 9, Jeetpur Simara',
    manager: 'Lilaraj Wagle',
    phone: '9802794315',
    labelSide: 'left',
    coords: { lat: 27.1667, lng: 84.9833 },
    points: [],
  },
  {
    id: 'biratnagar',
    name: 'Biratnagar',
    address: 'Kanchanwari, Ward 3, Morang',
    manager: 'Deepak Poudel',
    phone: '9802701808',
    labelSide: 'bottom',
    coords: { lat: 26.4525, lng: 87.2718 },
    points: [
      {
        id: 'mangalwari',
        name: 'Mangalwari',
        address: 'Rangeli Nagarpalika, Ward 2, Morang',
        coords: { lat: 26.5333, lng: 87.4167 },
      },
    ],
  },
  {
    id: 'birtamode',
    name: 'Birtamode',
    address: 'Bhagwan Chowk, Birtamod 1, Jhapa',
    manager: 'Ankit Thapa Magar',
    phone: '9802750877',
    coords: { lat: 26.6417, lng: 87.9917 },
    points: [
      {
        id: 'phidim',
        name: 'Phidim',
        address: 'Phidim 2, Panchthar',
        coords: { lat: 27.15, lng: 87.75 },
      },
      {
        id: 'taplejung',
        name: 'Taplejung',
        address: 'Phungling Nagarpalika 1, Taplejung',
        coords: { lat: 27.35, lng: 87.6667 },
      },
    ],
  },
  {
    id: 'lahan',
    name: 'Lahan',
    address: 'Lahan 3, Siraha',
    manager: 'Abdul Qudir Jeelani',
    phone: '9801169058',
    coords: { lat: 26.72, lng: 86.48 },
    points: [
      {
        id: 'katari',
        name: 'Katari',
        address: 'Katari 4, Udayapur',
        coords: { lat: 26.9167, lng: 86.3333 },
      },
    ],
  },
  {
    id: 'janakpur',
    name: 'Janakpur',
    address: 'Mujheliya 14, Dhanusha',
    manager: 'Lalit Kumar Jha',
    phone: '9802961266',
    labelSide: 'bottom',
    coords: { lat: 26.7288, lng: 85.9266 },
    points: [
      {
        id: 'bardibas',
        name: 'Bardibas',
        address: 'Bardibas 1, Mahottari',
        coords: { lat: 26.9833, lng: 85.9 },
      },
    ],
  },
  {
    id: 'hile',
    name: 'Hile',
    address: 'Dhankuta 1, Dhankuta',
    manager: 'Nirmal Bhandari',
    phone: '9802701823',
    labelSide: 'top',
    coords: { lat: 27.0333, lng: 87.3 },
    points: [],
  },
  {
    id: 'hariwon',
    name: 'Hariwon',
    address: 'Naya Road, Hariwon 9, Sarlahi',
    manager: 'Sujan Rokka Kshetri',
    phone: '9801558687',
    labelSide: 'top',
    coords: { lat: 26.9333, lng: 85.65 },
    points: [],
  },
  {
    id: 'hetauda',
    name: 'Hetauda',
    address: 'Hetauda 8, Makwanpur',
    manager: 'Dipak Shaarma',
    phone: '9802902124',
    coords: { lat: 27.4287, lng: 85.0322 },
    points: [],
  },
  {
    id: 'narayangadh',
    name: 'Narayangadh',
    address: 'Bharatpur 12, Milan Chowk, Chitwan',
    manager: 'Ramesh Prasad Dahal',
    phone: '9802902131',
    coords: { lat: 27.6833, lng: 84.4333 },
    points: [],
  },
  {
    id: 'pokhara',
    name: 'Pokhara',
    address: 'Swagat Nagar 14, Kaski',
    manager: 'Sunil Kumar Thakur',
    phone: '9802921039',
    coords: { lat: 28.2096, lng: 83.9856 },
    points: [],
  },
  {
    id: 'butwal',
    name: 'Butwal',
    address: 'Tilottama 2, Janakinagar, Rupandehi',
    manager: 'Rajesh Kumar Sah',
    phone: '9802902103',
    labelSide: 'left',
    coords: { lat: 27.6866, lng: 83.4323 },
    points: [
      {
        id: 'kapilvastu',
        name: 'Kapilvastu',
        address: 'Kapilvastu Nagarpalika 1, Purano Ataria Bazar',
        coords: { lat: 27.55, lng: 83.05 },
      },
      {
        id: 'parasi',
        name: 'Parasi',
        address: 'Ramgram Nagarpalika 12, Nawalparasi',
        coords: { lat: 27.5333, lng: 83.6167 },
      },
    ],
  },
  {
    id: 'nepalgunj',
    name: 'Nepalgunj',
    address: 'Khajura Road 1, near Janta Doodh Dairy, Banke',
    manager: 'Harish Regmi',
    phone: '9802902128',
    labelSide: 'left',
    coords: { lat: 28.05, lng: 81.6167 },
    points: [
      {
        id: 'gauriganj',
        name: 'Gauriganj',
        address: 'Ganapur 6, Janaki Gaunpalika, Banke',
        coords: { lat: 28.05, lng: 81.5 },
      },
    ],
  },
  {
    id: 'dhangadhi',
    name: 'Dhangadhi',
    address: 'Dhangadhi 13, Mohanpur, Kailali',
    manager: 'Binay Kumar Jha',
    phone: '9802971502',
    coords: { lat: 28.7, lng: 80.6 },
    points: [
      {
        id: 'mahendranagar',
        name: 'Mahendranagar',
        address: 'Bhimdatta Nagarpalika 1, Bhasi, Kanchanpur',
        coords: { lat: 28.9634, lng: 80.1817 },
      },
      {
        id: 'tikapur',
        name: 'Tikapur',
        address: 'Tikapur Nagarpalika 1, Kailali',
        coords: { lat: 28.5167, lng: 81.1167 },
      },
    ],
  },
  {
    id: 'surkhet',
    name: 'Surkhet',
    address: 'Birendranagar 11, Surkhet',
    manager: 'Madhav Regmi',
    phone: '9802075800',
    coords: { lat: 28.6, lng: 81.6167 },
    points: [],
  },
  {
    id: 'dang',
    name: 'Dang',
    address: 'Ward 14, Ghorahi Upa-Mahanagarpalika, Dang',
    manager: 'Dhiraj Regmi',
    phone: '9802500803',
    labelSide: 'bottom',
    coords: { lat: 28.0333, lng: 82.4833 },
    points: [],
  },
]

/**
 * Every location on one flat list, branches and sales points together, each
 * tagged with which it is.
 *
 * The map wants a flat list and the index wants the nesting, so the nesting is
 * what is stored and this is derived from it. The other way round — a flat file
 * with a `parent` key on each sales point — puts the relationship in two places
 * and lets them disagree.
 */
export const NETWORK_POINTS = BRANCHES.flatMap((branch) => [
  { ...branch, kind: 'branch' },
  ...branch.points.map((point) => ({
    ...point,
    kind: 'point',
    manager: branch.manager,
    phone: branch.phone,
  })),
])

/**
 * Every sales point on its own, each carrying the branch it reports to and
 * that branch's manager and line.
 *
 * The contact index lists the two tiers as two uniform lists rather than as one
 * nested one, so it needs the smaller tier flattened — and flattened *with* its
 * parent's name, which is the one fact the nesting was carrying that the row
 * cannot state on its own.
 */
export const SALES_POINTS = BRANCHES.flatMap((branch) =>
  branch.points.map((point) => ({
    ...point,
    branch: branch.name,
    manager: branch.manager,
    phone: branch.phone,
  })),
)

export const BRANCH_COUNT = BRANCHES.length

export const POINT_COUNT = NETWORK_POINTS.length - BRANCHES.length
