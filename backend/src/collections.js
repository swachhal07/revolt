/**
 * What this API is allowed to store, and how a record in each collection is
 * identified.
 *
 * An allow-list rather than "whatever comes in the URL". `/api/:collection` is
 * one generic router, and without this a request to `/api/../../secrets` or
 * simply `/api/anything` would create a new document in the store on demand —
 * an open write endpoint dressed as a REST API.
 *
 * Mirrors the keys in `src/admin/data/schema.js` on the frontend. The two are
 * separate on purpose: the frontend schema also describes labels, help text and
 * form controls, none of which the server has any business knowing about. What
 * has to agree between them is this list and the id field, and that is small
 * enough to keep in step by hand.
 */
export const COLLECTIONS = {
  motorcycles: { idField: 'slug', label: 'Motorcycle' },
  leadership: { idField: 'slug', label: 'Person' },
  posts: { idField: 'slug', label: 'Post' },
}

export const COLLECTION_KEYS = Object.keys(COLLECTIONS)

export const isCollection = (name) => Object.hasOwn(COLLECTIONS, name)

/**
 * Turn any string into a usable id.
 *
 * The same rule as the frontend's `slugify`. Duplicated rather than shared,
 * because the two run in different processes and the server cannot trust the
 * client's version of it anyway — a slug arriving over the wire is input, not a
 * value the browser already validated.
 */
export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
