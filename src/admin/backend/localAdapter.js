import { MOTORCYCLES } from '@/data/motorcycles'
import { POSTS } from '@/data/posts'
import { COLLECTIONS, slugify } from './schema'

const STORE_KEY = 'revolt:admin-store:v1'

// How long a write pretends to take. Not padding for its own sake: every screen
// in here has a loading and a saving state, and a backend that answers in zero
// milliseconds means those states never render during development and are
// therefore never checked. A real network will not be kind enough to be instant.
const LATENCY = 180

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY))

/**
 * Seed data, taken from the files the site already ships.
 *
 * The bundled image imports resolve to URL strings at runtime, so a seeded record
 * and a record typed into the admin hold the same kind of value in an image field
 * and nothing downstream can tell them apart. That is what makes this seam work
 * at all — see `media.js`.
 *
 * Deep-cloned, because these are the same objects the live site renders from: an
 * admin that mutated them in place would edit the running page and lose the edit
 * on reload, which is the most confusing possible combination.
 */
function seed() {
  return {
    motorcycles: structuredClone(MOTORCYCLES),
    posts: structuredClone(POSTS).map((post) => ({
      // The site's own posts predate the draft/published split and have no
      // status. They are live, so they seed as published rather than as drafts —
      // the alternative would quietly empty the journal the first time the admin
      // is opened.
      status: 'published',
      ...post,
    })),
  }
}

function read() {
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    if (!raw) return seed()

    const parsed = JSON.parse(raw)
    // Only trust the shape as far as the collections we know about. A store
    // written by an older version is missing whatever was added since, and
    // falling back per collection recovers from that without wiping the rest.
    return {
      motorcycles: Array.isArray(parsed.motorcycles) ? parsed.motorcycles : seed().motorcycles,
      posts: Array.isArray(parsed.posts) ? parsed.posts : seed().posts,
    }
  } catch {
    // Corrupt JSON, or storage blocked outright (private-mode Safari, a browser
    // refusing storage in a frame). Falling back to the seed keeps the admin
    // usable read-only rather than showing an empty catalogue.
    return seed()
  }
}

function write(store) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store))
  } catch (error) {
    // Worth surfacing rather than swallowing: the quota is the realistic cause,
    // and it means the last save did not persist even though the screen said it
    // did. Callers turn this into a visible failure.
    throw new Error(
      'Could not save. Browser storage is full or unavailable — this backend keeps everything on this device.',
      { cause: error },
    )
  }
}

const idOf = (collection, record) => record[COLLECTIONS[collection].idField]

/**
 * The development backend: every record in `localStorage`, seeded from the site's
 * own data files.
 *
 * Two things it deliberately is not. It is not shared — every browser has its own
 * copy, so two people cannot see each other's edits. It is not the live site
 * either: the pages still render from `src/data/*`, so an edit here shows in the
 * admin and nowhere else. Both are properties of *this adapter*, not of the
 * admin, and both go away when a real one is fitted.
 */
export const localAdapter = {
  async list(collection) {
    await wait()
    return read()[collection] ?? []
  },

  async get(collection, id) {
    await wait()
    const records = read()[collection] ?? []
    return records.find((record) => idOf(collection, record) === id) ?? null
  },

  async create(collection, record) {
    await wait()
    const store = read()
    const { idField } = COLLECTIONS[collection]
    const id = record[idField] || slugify(record.name || record.title || 'untitled')

    if (store[collection].some((existing) => idOf(collection, existing) === id)) {
      throw new Error(`A ${COLLECTIONS[collection].singular.toLowerCase()} already exists at "${id}".`)
    }

    const created = { ...record, [idField]: id }
    // Newest first, matching how both collections are read on the site.
    store[collection] = [created, ...store[collection]]
    write(store)
    return created
  },

  async update(collection, id, record) {
    await wait()
    const store = read()
    const index = store[collection].findIndex((existing) => idOf(collection, existing) === id)

    if (index === -1) throw new Error(`Nothing found at "${id}" to update.`)

    const updated = { ...store[collection][index], ...record }
    store[collection][index] = updated
    write(store)
    return updated
  },

  async remove(collection, id) {
    await wait()
    const store = read()
    store[collection] = store[collection].filter((record) => idOf(collection, record) !== id)
    write(store)
  },

  async reset() {
    await wait()
    write(seed())
  },
}
