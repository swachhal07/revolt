import { cloudinary } from './cloudinary.js'
import { config } from './config.js'

/**
 * The persistence layer: each collection is one private JSON asset in
 * Cloudinary, overwritten whole on every save.
 *
 * No database, deliberately. This service stores three short lists that change a
 * few times a week and are read far more often than written — a Postgres
 * instance for that is a second thing to provision, pay for, back up and keep
 * awake, and Cloudinary is already in the stack because the images have to live
 * somewhere. Storing the records beside them costs nothing extra.
 *
 * What that buys and what it costs:
 *
 *   - Writes are whole-collection. Two people saving different models within the
 *     same second would otherwise lose one of the two edits, so writes are
 *     serialised per collection by `queue` below. That is enough for a back
 *     office with a handful of editors and would not be enough for a hundred.
 *   - Reads are cached in memory and served from there. A cold instance pays one
 *     signed fetch per collection and nothing after that.
 *   - Assets are `private`, so the store is not a public URL somebody can guess.
 *     Reading one means signing a short-lived download URL with the API secret,
 *     which only this service holds.
 *
 * `load` and `save` are the entire surface. Everything above this file goes
 * through the two of them, so swapping in a real database later is this file and
 * nothing else.
 */

/** In-memory copy of what is in Cloudinary, per collection. */
const cache = new Map()

/**
 * The write queue, per collection.
 *
 * Read-modify-write over a whole document has an obvious race: two requests both
 * read the same list, both append, and the second overwrites the first. Chaining
 * each collection's writes onto a promise makes that impossible within one
 * instance — and one instance is what this runs as.
 */
const queue = new Map()

/**
 * The asset id for a collection, extension included.
 *
 * The extension is part of the id rather than a `format` option, and that is not
 * cosmetic. A raw upload folds the format into the stored `public_id` — asking
 * for `data/motorcycles` with `format: 'json'` stores `data/motorcycles.json` —
 * but `private_download_url` signs whatever id it is handed. Pass the id without
 * the extension and it signs a URL for an asset that does not exist, which comes
 * back as a 404 the read path treats as "never written". The write succeeds, the
 * read silently returns nothing, and the data looks lost while sitting safely in
 * the account.
 *
 * One id, spelled the same way on both sides, and the failure is impossible.
 */
const publicId = (name) => `${config.cloudinary.folder}/data/${name}.json`

/** Serialise an operation against one collection behind whatever is in flight. */
export function withCollectionLock(name, operation) {
  const previous = queue.get(name) ?? Promise.resolve()
  // `.catch` so one failed write does not poison every subsequent write on the
  // same collection — the chain is for ordering, not for propagating failure.
  const next = previous.then(operation, operation)

  queue.set(
    name,
    next.catch(() => {}),
  )

  return next
}

/**
 * Read a collection.
 *
 * A collection that has never been written 404s, which is not an error — it is a
 * service that has not been seeded yet. It resolves to an empty list so the site
 * renders an empty section rather than a stack trace.
 */
export async function load(name) {
  if (cache.has(name)) return cache.get(name)

  // The memory driver is nothing but the cache — a collection that has not been
  // written yet is empty, and one that has is already sitting above this line.
  if (config.storeDriver === 'memory') {
    cache.set(name, [])
    return []
  }

  // Empty format: the extension is already in the id. See `publicId`.
  const url = cloudinary.utils.private_download_url(publicId(name), '', {
    resource_type: 'raw',
    type: 'private',
    // Sixty seconds is all the URL is alive for. It is generated per read and
    // used immediately; a longer window is a link somebody can copy out of a log.
    expires_at: Math.floor(Date.now() / 1000) + 60,
  })

  // The cache-buster is against Cloudinary's own CDN, not against ours: the
  // asset is overwritten in place under a stable public id, so a cached response
  // would serve the previous version of the collection after a save.
  const response = await fetch(`${url}&_cb=${Date.now()}`)

  if (response.status === 404) {
    cache.set(name, [])
    return []
  }

  if (!response.ok) {
    throw new Error(`Could not read "${name}" from storage (${response.status}).`)
  }

  const records = await response.json()
  const list = Array.isArray(records) ? records : []

  cache.set(name, list)
  return list
}

/**
 * Overwrite a collection.
 *
 * The cache is updated only after Cloudinary confirms the write. Updating it
 * first would leave the service serving an edit that was never stored, which is
 * the one failure mode worse than reporting the error.
 */
export async function save(name, records) {
  if (config.storeDriver === 'memory') {
    cache.set(name, records)
    return records
  }

  const body = Buffer.from(JSON.stringify(records)).toString('base64')

  await cloudinary.uploader.upload(`data:application/json;base64,${body}`, {
    resource_type: 'raw',
    type: 'private',
    public_id: publicId(name),
    overwrite: true,
    invalidate: true,
  })

  cache.set(name, records)
  return records
}

/**
 * Drop the in-memory copy.
 *
 * For the rare case of the asset being changed out of band — a restore, or a
 * hand-edited upload. Without it the only way to pick that up is a redeploy.
 */
export function forget(name) {
  if (name) cache.delete(name)
  else cache.clear()
}
