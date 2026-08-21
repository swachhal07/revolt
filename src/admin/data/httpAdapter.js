import { clearToken, getToken, setToken } from './session'

/**
 * The real backend: the Node service in `backend/`.
 *
 * Satisfies the same port as `localAdapter` — see `port.js` — so every admin
 * screen works against either one without knowing which. That symmetry is not
 * incidental: the service's record routes were written to match this adapter's
 * semantics exactly (ids derived and slugified server-side, 409 on a clash,
 * update as a merge), so switching between them changes latency and nothing else.
 *
 * Reads go out unauthenticated because the public site makes the same calls. Only
 * writes carry the token.
 */

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

if (!BASE && import.meta.env.VITE_ADMIN_BACKEND === 'http') {
  // Loud and immediate. The alternative is every request going to the frontend's
  // own origin, where it 404s into the SPA's index.html and surfaces as a JSON
  // parse error several layers away from the missing variable that caused it.
  throw new Error('VITE_ADMIN_BACKEND=http needs VITE_API_URL set to the API origin.')
}

export const API_BASE = BASE

/**
 * One fetch wrapper, because the error handling is the interesting part.
 *
 * Three failure modes, all of which have to end as a thrown Error with a message
 * worth showing somebody:
 *
 *   - The network never got there. `fetch` rejects with "Failed to fetch", which
 *     tells a non-developer nothing, so it is rewritten.
 *   - The service answered with a status and a JSON `error`. That message was
 *     written for this moment; it is used verbatim.
 *   - The service answered with a status and something that is not JSON — a proxy
 *     error page, a cold-start timeout from the host. Falling back to the status
 *     is the only honest thing left to say.
 */
async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const headers = {}

  if (body !== undefined) headers['content-type'] = 'application/json'

  if (auth) {
    const token = getToken()
    if (!token) throw new Error('Your session has ended. Sign in again.')
    headers.authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  if (response.status === 204) return null

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    // A rejected token means the session is over, whatever the screen thinks. It
    // is cleared here rather than at the call site so no screen has to remember
    // to — the next render sees no session and lands on the sign-in.
    if (response.status === 401) clearToken()

    throw new Error(payload?.error ?? `The server answered ${response.status}.`)
  }

  return payload
}

/** Exchange the shared password for a token. Used by `session.js`. */
export async function login(password) {
  const { token } = await request('/auth/login', { method: 'POST', body: { password } })
  setToken(token)
  return token
}

/** Whether the token in hand is still accepted. Cheap, and called on load. */
export async function verifySession() {
  if (!getToken()) return false

  try {
    await request('/auth/me', { auth: true })
    return true
  } catch {
    return false
  }
}

/**
 * Upload an image through the service.
 *
 * Multipart, so no `content-type` is set by hand — the browser has to write the
 * boundary into it, and setting it manually produces a header with no boundary
 * and a request the server cannot parse.
 */
export async function uploadImage(file) {
  const token = getToken()
  if (!token) throw new Error('Your session has ended. Sign in again.')

  const form = new FormData()
  form.append('file', file)

  let response

  try {
    response = await fetch(`${BASE}/api/media/image`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: form,
    })
  } catch {
    throw new Error('Could not reach the server to upload that image.')
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401) clearToken()
    throw new Error(payload?.error ?? `The upload failed (${response.status}).`)
  }

  return payload.url
}

export const httpAdapter = {
  async list(collection) {
    return (await request(`/${collection}`)) ?? []
  },

  async get(collection, id) {
    try {
      return await request(`/${collection}/${encodeURIComponent(id)}`)
    } catch (error) {
      // The port says a missing record resolves to null rather than throwing —
      // the editor distinguishes "no such record" from "the read failed", and
      // collapsing the two would show a fault banner for a mistyped URL.
      if (/nothing on file/i.test(error.message)) return null
      throw error
    }
  },

  async create(collection, record) {
    return request(`/${collection}`, { method: 'POST', body: record, auth: true })
  },

  async update(collection, id, record) {
    return request(`/${collection}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: record,
      auth: true,
    })
  },

  async remove(collection, id) {
    await request(`/${collection}/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true })
  },

  async reset() {
    // Deliberately not implemented. `reset` exists on the port because the local
    // adapter can honestly offer it — it reseeds from the site's own data files.
    // Against a real service it would mean "delete everything and put the sample
    // data back", which is not an operation a back office should have a button
    // for. It throws rather than silently doing nothing, so nobody wires a
    // control to it believing it works.
    throw new Error('Resetting is only available on the local backend.')
  },
}
