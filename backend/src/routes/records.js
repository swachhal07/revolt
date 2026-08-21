import { Router } from 'express'
import { requireAdmin } from '../auth.js'
import { COLLECTIONS, COLLECTION_KEYS, slugify } from '../collections.js'
import { badRequest, conflict, notFound, route } from '../errors.js'
import { load, save, withCollectionLock } from '../store.js'

/**
 * One router for every collection.
 *
 * The frontend admin is schema-driven — one list screen and one editor serve
 * every collection — and the API is the same idea for the same reason:
 * registering a collection should not mean writing a fifth set of five identical
 * handlers that drift apart the first time one of them gets a bug fix.
 *
 * Reads are public. The site renders from these, so requiring a token to list
 * motorcycles would mean shipping one in the public bundle. Writes need the
 * admin token.
 *
 * The semantics deliberately match the browser-side `localAdapter` exactly —
 * same id derivation, same 409 on a clash, same merge on update — so the two are
 * interchangeable behind the frontend's adapter port and switching between them
 * is an environment variable rather than a behaviour change.
 */
const router = Router({ mergeParams: true })

/**
 * The allow-list, as the route pattern itself.
 *
 * Structural rather than a guard that runs inside the handler: an unregistered
 * name does not match the route at all, so it falls through to the service's own
 * 404 instead of being answered by a collection handler that has to remember to
 * check. It also stops this router — mounted at `/api` — from claiming `/auth`
 * and `/media` and reporting them as collections that do not exist.
 */
const COLLECTION = `/:collection(${COLLECTION_KEYS.join('|')})`

const idOf = (collection, record) => record[COLLECTIONS[collection].idField]

router.get(
  COLLECTION,
  route(async (req, res) => {
    res.json(await load(req.params.collection))
  }),
)

router.get(
  `${COLLECTION}/:id`,
  route(async (req, res) => {
    const { collection, id } = req.params
    const found = (await load(collection)).find((record) => idOf(collection, record) === id)

    if (!found) throw notFound(`Nothing on file at "${id}".`)

    res.json(found)
  }),
)

router.post(
  COLLECTION,
  requireAdmin,
  route(async (req, res) => {
    const { collection } = req.params
    const { idField, label } = COLLECTIONS[collection]
    const body = req.body

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw badRequest('Expected a record object.')
    }

    // Derived server-side even when the client sent one, and re-slugified either
    // way: an id is a URL, and this is the last point at which anything can stop
    // a space or a slash becoming part of one.
    const id = slugify(body[idField] || body.name || body.title || 'untitled')

    if (!id) throw badRequest(`A ${label.toLowerCase()} needs a name to derive its address from.`)

    const created = await withCollectionLock(collection, async () => {
      const records = await load(collection)

      if (records.some((record) => idOf(collection, record) === id)) {
        throw conflict(`A ${label.toLowerCase()} already exists at "${id}".`)
      }

      const record = { ...body, [idField]: id }
      // Newest first, matching how both the admin register and the site read
      // these lists.
      await save(collection, [record, ...records])
      return record
    })

    res.status(201).json(created)
  }),
)

/**
 * Update. `PUT` and `PATCH` are the same handler, and both merge.
 *
 * A merge rather than a replace because the editor posts the whole record it
 * loaded, and a field added to the schema after that record was written would
 * otherwise be erased by the first save from a client that has not been
 * refreshed. Merging costs nothing and makes a stale tab harmless.
 */
const update = route(async (req, res) => {
  const { collection, id } = req.params
  const { idField, label } = COLLECTIONS[collection]
  const body = req.body

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw badRequest('Expected a record object.')
  }

  const updated = await withCollectionLock(collection, async () => {
    const records = await load(collection)
    const index = records.findIndex((record) => idOf(collection, record) === id)

    if (index === -1) throw notFound(`Nothing on file at "${id}" to update.`)

    const nextId = body[idField] === undefined ? id : slugify(body[idField])

    if (!nextId) throw badRequest('The address cannot be blank.')

    // Renaming the id is a move, and it can collide with something that already
    // lives at the destination. Checked against every *other* record, so saving
    // a record under its own unchanged id is not a clash with itself.
    if (
      nextId !== id &&
      records.some((record, position) => position !== index && idOf(collection, record) === nextId)
    ) {
      throw conflict(`A ${label.toLowerCase()} already exists at "${nextId}".`)
    }

    const record = { ...records[index], ...body, [idField]: nextId }
    const next = [...records]
    next[index] = record

    await save(collection, next)
    return record
  })

  res.json(updated)
})

router.put(`${COLLECTION}/:id`, requireAdmin, update)
router.patch(`${COLLECTION}/:id`, requireAdmin, update)

router.delete(
  `${COLLECTION}/:id`,
  requireAdmin,
  route(async (req, res) => {
    const { collection, id } = req.params

    await withCollectionLock(collection, async () => {
      const records = await load(collection)
      const next = records.filter((record) => idOf(collection, record) !== id)

      if (next.length === records.length) throw notFound(`Nothing on file at "${id}".`)

      await save(collection, next)
    })

    res.status(204).end()
  }),
)

export default router
