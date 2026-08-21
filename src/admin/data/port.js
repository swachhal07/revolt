/**
 * The contract every backend has to satisfy. This file is documentation with a
 * runtime assertion attached — there is no implementation here on purpose.
 *
 * The admin screens call nothing but these six methods. That is the whole point
 * of the arrangement: today they resolve against `localAdapter`, which keeps
 * records in `localStorage` and lets the interface be designed and used before
 * any service exists; tomorrow they resolve against Supabase, a REST API or a
 * git-committing CMS, and no screen changes. The seam is worth having even if the
 * first real backend arrives next week, because it is what stops the shape of a
 * particular vendor's client leaking into thirty components.
 *
 * Every method is async, including the ones the local adapter could answer
 * synchronously. A synchronous read is a promise the next backend cannot keep,
 * and code written against it would have to be unpicked from every call site.
 *
 *   list(collection)            → Promise<Record[]>
 *   get(collection, id)         → Promise<Record | null>
 *   create(collection, record)  → Promise<Record>
 *   update(collection, id, rec) → Promise<Record>
 *   remove(collection, id)      → Promise<void>
 *   reset()                     → Promise<void>   // back to the seeded data
 *
 * Errors are thrown, not returned. A failed write has to be impossible to ignore
 * by accident, and a `{ ok: false }` return is very easy to ignore by accident.
 */

const METHODS = ['list', 'get', 'create', 'update', 'remove', 'reset']

/**
 * Check an adapter implements the port, and fail loudly at startup if not.
 *
 * Called once when the client is assembled. A half-implemented adapter otherwise
 * surfaces as `backend.update is not a function` in the middle of somebody's
 * first save, which is both the worst moment to find out and the hardest place to
 * read the cause from.
 */
export function assertPort(adapter, name) {
  const missing = METHODS.filter((method) => typeof adapter?.[method] !== 'function')

  if (missing.length > 0) {
    throw new Error(
      `The "${name}" backend adapter is missing: ${missing.join(', ')}. ` +
        `See src/admin/data/port.js for the contract.`,
    )
  }

  return adapter
}
