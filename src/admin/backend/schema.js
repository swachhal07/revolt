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
