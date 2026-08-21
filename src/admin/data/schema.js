/**
 * What the admin can edit, described once.
 *
 * This file is the single source of truth for three things that would otherwise
 * drift apart: what a record is allowed to contain, which columns the list view
 * shows, and which controls the editor renders. A hand-written form per
 * collection is the obvious build and it rots — a field added to the data ends up
 * in the editor but not the validator, or in the validator but not the list.
 *
 * Adding a collection is an entry here. No new screens: `Collection` and `Editor`
 * are generic and read this.
 *
 * The field types map to controls in `Editor` — `text`, `slug`, `textarea`,
 * `number`, `select`, `image`, `pairs` (a free-form key/value table) and
 * `objects` (a repeater over `subfields`). Anything not in that list will render
 * as a plain text input, deliberately: an unknown type should degrade to
 * something editable rather than throw.
 */

/** Blocks a post body is built from. Matches what `BlogPost` already renders. */
const BLOCK_TYPES = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h', label: 'Heading' },
  { value: 'quote', label: 'Pull quote' },
]

export const COLLECTIONS = {
  motorcycles: {
    label: 'Motorcycles',
    singular: 'Motorcycle',
    // The catalogue is keyed by slug rather than by a generated id because the
    // slug is already the public URL of the model's page. A second identifier
    // would mean two things to keep in step for no gain.
    idField: 'slug',
    title: (record) => record.name || 'Untitled model',
    subtitle: (record) => record.tagline,
    // The list's columns. Kept short on purpose — a table that shows every field
    // is a form with the labels moved to the top.
    columns: [
      { name: 'name', label: 'Model' },
      { name: 'class', label: 'Class' },
      { name: 'priceNpr', label: 'Price', format: 'npr' },
      { name: 'colours', label: 'Colours', format: 'count' },
    ],
    // How the editor breaks the form up. Stated here as an ordered list rather
    // than tagged onto each field, because the useful thing to be able to read
    // in one glance is the *shape of the form* — and that is a property of the
    // form, not of any one field in it.
    //
    // A field left out of every group still renders; see `fieldGroups`. So this
    // can go stale without anything disappearing, which is the failure mode
    // worth designing against in a schema-driven editor.
    groups: [
      { label: 'Identity', fields: ['name', 'slug', 'class', 'priceNpr'] },
      { label: 'Words', fields: ['tagline', 'pitch', 'intro'] },
      { label: 'Photography', fields: ['image', 'hero', 'studio'] },
      { label: 'Colourways', fields: ['colours'] },
      { label: 'Detail', fields: ['specs', 'highlights'] },
    ],
    fields: [
      { name: 'name', label: 'Model name', type: 'text', required: true, width: 'half' },
      {
        name: 'slug',
        label: 'URL slug',
        type: 'slug',
        required: true,
        width: 'half',
        from: 'name',
        help: 'The address of the model page: /motorcycles/<slug>. Changing it breaks any link already shared.',
      },
      {
        name: 'class',
        label: 'Class',
        type: 'select',
        width: 'half',
        options: ['Sport', 'Street', 'Commuter', 'Adventure'].map((v) => ({ value: v, label: v })),
      },
      {
        name: 'priceNpr',
        label: 'Price (NPR)',
        type: 'number',
        width: 'half',
        help: 'Leave empty for an unannounced model. Anything that ranks or quotes by money skips a model with no price rather than showing zero.',
      },
      {
        name: 'tagline',
        label: 'Tagline',
        type: 'text',
        required: true,
        help: 'One line, read in passing — on a card, in a list, inside an alt attribute. Short enough to survive a narrow column.',
      },
      {
        name: 'pitch',
        label: 'Pitch',
        type: 'text',
        help: 'The headline over the spec fold, set at display size. Two or three clauses. Falls back to the tagline when empty.',
      },
      {
        name: 'intro',
        label: 'Intro',
        type: 'textarea',
        help: 'The paragraph under the name in the hero, and again beside the studio shot. Falls back to the tagline.',
      },
      {
        name: 'image',
        label: 'Action photograph',
        type: 'image',
        required: true,
        help: 'Full-bleed use. Wide, and it will be cropped from the centre.',
      },
      {
        name: 'hero',
        label: 'Hero frame',
        type: 'image',
        help: 'The opening frame of the model page: wide and dark, with room on the left for the name and bottom-right for the price. Falls back to the action photograph.',
      },
      {
        name: 'studio',
        label: 'Studio cutout',
        type: 'image',
        required: true,
        help: 'Cutout on white, for the lineup rail and the nav menu. Should be the same colourway that leads the list below, or a reader lands on a different machine to the one they clicked.',
      },
      {
        name: 'colours',
        label: 'Colourways',
        type: 'objects',
        addLabel: 'Add colourway',
        help: 'Newest first. The picker appears on the model page only past the second one — a single colourway is a fact about the bike, not a choice to offer.',
        subfields: [
          { name: 'name', label: 'Name', type: 'text', width: 'half' },
          { name: 'studio', label: 'Cutout', type: 'image', width: 'half' },
          {
            name: 'swatch',
            label: 'Swatch',
            type: 'colorpair',
            help: 'These machines are painted in two tones, and one flat colour would print two different reds as the same dot.',
          },
        ],
      },
      {
        name: 'specs',
        label: 'Specification',
        type: 'pairs',
        keyLabel: 'Row',
        valueLabel: 'Value',
        help: 'Measurements, ratings and named parts — anything where the value carries the information. A feature that is merely present belongs in Highlights, where the name is the whole statement.',
      },
      {
        name: 'highlights',
        label: 'Highlights',
        type: 'objects',
        addLabel: 'Add highlight',
        subfields: [
          { name: 'title', label: 'Title', type: 'text', width: 'half' },
          { name: 'body', label: 'Detail', type: 'text', width: 'half' },
        ],
      },
    ],
  },

  /**
   * The leadership page's two rosters, as one register.
   *
   * One collection with a `tier` rather than a `board` collection and a
   * `management` collection, because they are the same record — a name, a title,
   * a portrait — filed under two headings, and the page is what draws the line
   * between them. Two collections would mean two identical schemas to keep in
   * step and a rail entry spent on a distinction that is one field wide.
   *
   * `order` exists because these rosters are ranked and a register is not: the
   * board reads Chairman first and nothing about a record says so. The site sorts
   * on it, so moving somebody up the list is a number change rather than a
   * rebuild of it. Plain 1, 2, 3 within each tier — a scheme with gaps in it
   * saves a renumber that nobody doing this once a year will thank it for, and
   * costs a column of numbers that do not mean what they look like.
   */
  leadership: {
    label: 'Leadership',
    singular: 'Person',
    idField: 'slug',
    title: (record) => record.name || 'Unnamed',
    subtitle: (record) => record.role,
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'role', label: 'Title' },
      { name: 'order', label: 'Rank', format: 'rank' },
    ],
    // Split the register the way the page splits: two ruled blocks, not one list
    // with a Tier column you have to read every row of to see where the boundary
    // falls. These are two rosters that answer different questions — who signs,
    // and who a customer reaches — and a register that renders them as one list
    // is quietly asserting they are the same thing.
    //
    // With the split doing the work, `tier` comes off the columns: it would be
    // the same word repeated down every row of a block already titled with it.
    partition: {
      field: 'tier',
      groups: [
        { value: 'board', label: 'Board', note: 'Signs for the group. Listed by title.' },
        {
          value: 'management',
          label: 'Management',
          note: 'Runs the distributorship day to day. The tier that carries a remit.',
        },
      ],
    },
    // Ranked, not chronological: these lists have an order and the register has
    // to show it, or the first thing anyone does after editing is wonder why the
    // Chairman is third.
    sortBy: 'order',
    groups: [
      { label: 'Identity', fields: ['name', 'slug', 'role', 'tier', 'order'] },
      { label: 'Portrait', fields: ['photo'] },
      { label: 'Accountability', fields: ['remit', 'since'] },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, width: 'half' },
      {
        name: 'slug',
        label: 'URL slug',
        type: 'slug',
        required: true,
        width: 'half',
        from: 'name',
        help: 'Not a page address — nobody has their own page. It is the record’s identity, and the portrait file is named for it.',
      },
      {
        name: 'role',
        label: 'Title',
        type: 'text',
        required: true,
        width: 'half',
        help: 'As it should be printed under the name. Chairman, Sales Manager.',
      },
      {
        name: 'tier',
        label: 'Tier',
        type: 'select',
        required: true,
        width: 'half',
        options: [
          { value: 'board', label: 'Board' },
          { value: 'management', label: 'Management' },
        ],
        help: 'The board signs for the group and is listed by title alone. Management is who a customer actually reaches, and only that tier prints a remit.',
      },
      {
        name: 'order',
        label: 'Rank',
        type: 'number',
        width: 'half',
        help: 'Position within the tier, counting from 1. The board reads Chairman first.',
      },
      {
        name: 'photo',
        label: 'Portrait',
        type: 'image',
        help: 'Leave empty and the page holds a marked slot at the same aspect rather than closing the gap, so a director joining tomorrow has somewhere to land.',
      },
      {
        name: 'remit',
        label: 'Remit',
        type: 'textarea',
        help: 'What this person is answerable for, not a biography. A customer wants to know who owns the problem when their bike is off the road. Management only, and only once they have approved the wording.',
      },
      {
        name: 'since',
        label: 'With the group since',
        type: 'text',
        width: 'half',
        help: 'A year. Optional, and the row drops the line when it is empty.',
      },
    ],
  },

  posts: {
    label: 'Journal',
    singular: 'Post',
    idField: 'slug',
    title: (record) => record.title || 'Untitled post',
    subtitle: (record) => record.standfirst,
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category' },
      { name: 'date', label: 'Date', format: 'date' },
      { name: 'status', label: 'Status', format: 'status' },
    ],
    groups: [
      { label: 'Identity', fields: ['title', 'slug', 'status', 'standfirst'] },
      { label: 'Filing', fields: ['category', 'date', 'author', 'read'] },
      { label: 'Photography', fields: ['cover', 'coverAlt'] },
      { label: 'Body', fields: ['body'] },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      {
        name: 'slug',
        label: 'URL slug',
        type: 'slug',
        required: true,
        width: 'half',
        from: 'title',
        help: 'The address of the post: /blog/<slug>.',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        width: 'half',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' },
        ],
        help: 'A draft is invisible on the site. Nothing else about it differs.',
      },
      {
        name: 'standfirst',
        label: 'Standfirst',
        type: 'textarea',
        required: true,
        help: 'Runs under the title on the index and again at the top of the post, so it has to work in both places. Write it as a claim, not a teaser.',
      },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        width: 'half',
        options: ['Ownership', 'Workshop', 'Charging', 'Road'].map((v) => ({ value: v, label: v })),
      },
      { name: 'date', label: 'Date', type: 'date', width: 'half' },
      { name: 'author', label: 'Author', type: 'text', width: 'half' },
      {
        name: 'read',
        label: 'Read time (min)',
        type: 'number',
        width: 'half',
        help: 'Printed as given rather than counted from the body, so a post can claim the time it actually takes.',
      },
      { name: 'cover', label: 'Cover image', type: 'image', required: true },
      {
        name: 'coverAlt',
        label: 'Cover alt text',
        type: 'text',
        help: 'What the photograph shows, for a reader who cannot see it. Not the title again.',
      },
      {
        name: 'body',
        label: 'Body',
        type: 'objects',
        addLabel: 'Add block',
        help: 'Blocks rather than a string of HTML: the index needs none of it, the post page renders it, and nobody has to sanitise anything.',
        subfields: [
          { name: 'type', label: 'Block', type: 'select', options: BLOCK_TYPES, width: 'half' },
          { name: 'text', label: 'Text', type: 'textarea' },
        ],
      },
    ],
  },
}

/** Every collection key, in the order the sidebar should list them. */
export const COLLECTION_KEYS = Object.keys(COLLECTIONS)

/**
 * A blank record for a collection, with every field present and empty.
 *
 * Present-and-empty rather than absent: a form bound to `undefined` makes React
 * treat the input as uncontrolled and warn the first time it is typed into, and
 * an editor that starts uncontrolled loses the first keystroke.
 */
export function blankRecord(key) {
  const blank = {}

  for (const field of COLLECTIONS[key].fields) {
    if (field.type === 'objects') blank[field.name] = []
    else if (field.type === 'pairs') blank[field.name] = {}
    else if (field.type === 'number') blank[field.name] = null
    else if (field.type === 'select') blank[field.name] = field.options?.[0]?.value ?? ''
    else blank[field.name] = ''
  }

  return blank
}

/**
 * A collection's fields, resolved into the groups the editor renders as
 * sections.
 *
 * Anything a group names but the schema does not define is skipped, and anything
 * the schema defines but no group names is collected into a trailing section. So
 * a field added to `fields` without being filed appears at the bottom of the form
 * rather than vanishing from it — a schema-driven editor where forgetting a line
 * in one list silently makes a field uneditable is a data-loss bug waiting for
 * the day somebody is in a hurry.
 *
 * Collections with no `groups` return one unlabelled section holding everything,
 * which is exactly what the editor used to render.
 */
export function fieldGroups(key) {
  const { fields, groups } = COLLECTIONS[key]
  const byName = new Map(fields.map((field) => [field.name, field]))

  if (!groups) return [{ label: null, fields }]

  const filed = new Set()

  const sections = groups.map((group) => ({
    label: group.label,
    fields: group.fields
      .map((name) => {
        filed.add(name)
        return byName.get(name)
      })
      .filter(Boolean),
  }))

  const unfiled = fields.filter((field) => !filed.has(field.name))
  if (unfiled.length > 0) sections.push({ label: 'Other', fields: unfiled })

  return sections.filter((section) => section.fields.length > 0)
}

/** Turn any string into a usable slug. Shared by the slug field and the seeder. */
export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Validate a record against its schema. Returns `{ field: message }`, empty when
 * the record is good.
 *
 * Runs in the editor on save rather than on every keystroke: a field that turns
 * red while it is still being typed into is telling the writer they are wrong
 * before they have finished being right.
 */
export function validate(key, record, existingIds = []) {
  const errors = {}
  const { idField, fields } = COLLECTIONS[key]

  for (const field of fields) {
    const value = record[field.name]

    if (field.required) {
      const empty =
        value == null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (field.type === 'number' && Number.isNaN(value))

      if (empty) {
        errors[field.name] = `${field.label} is required.`
        continue
      }
    }

    if (field.type === 'slug' && value) {
      if (slugify(value) !== value) {
        errors[field.name] = 'Lower case, numbers and single hyphens only.'
      } else if (field.name === idField && existingIds.includes(value)) {
        errors[field.name] = 'Something already lives at this address.'
      }
    }
  }

  return errors
}
