/**
 * Who is allowed into the admin.
 *
 * There are two answers, and which one applies is the same switch that chooses
 * the backend — see `index.js`.
 *
 * Against the API (`VITE_ADMIN_BACKEND=http`) this is real: the password goes to
 * the service, the service compares it in constant time against a secret that
 * only it holds, and what comes back is a signed token that every write carries.
 * Nothing sensitive is in the bundle.
 *
 * Against the local adapter it is not real, and it is important to be blunt
 * about that. The comparison happens in this file, so the password is inlined
 * into the bundle at build time and anyone who opens the network tab can read
 * it. It keeps `/admin` out of the hands of somebody who guessed the URL and
 * that is the whole of what it does. The local adapter also stores everything in
 * one browser, so there is nothing behind it to protect.
 *
 * The token and the session live in `sessionStorage`, not `localStorage`:
 * closing the tab ends the session. On a shared showroom machine that difference
 * is the whole security story.
 */

const SESSION_KEY = 'revolt:admin-session'
const TOKEN_KEY = 'revolt:admin-token'

const USE_API = (import.meta.env.VITE_ADMIN_BACKEND ?? 'local') === 'http'

const LOCAL_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'revolt-admin'

/* ── Token storage ────────────────────────────────────────────────────────── */

// Mirrored in memory, so a browser that refuses storage still holds a working
// session for the current page load rather than failing every write.
let memoryToken = null

export function getToken() {
  if (memoryToken) return memoryToken

  try {
    return window.sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  memoryToken = token

  try {
    window.sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Held in memory only. Works until the page reloads.
  }
}

export function clearToken() {
  memoryToken = null

  try {
    window.sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // Nothing to clear if it could never be written.
  }
}

/* ── The session ──────────────────────────────────────────────────────────── */

/** The signed-in session, or null. Read synchronously so the guard can paint. */
export function currentSession() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null

    // Against the API a session is only as good as its token. One without the
    // other means storage was partially cleared, or the token expired and was
    // dropped by the adapter — either way the answer is to sign in again.
    if (USE_API && !getToken()) return null

    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Attempt a sign-in. Resolves to the session, throws with a readable message.
 *
 * The API path is imported lazily. A static import would pull the adapter — and
 * its `VITE_API_URL` assertion — into the bundle even when the admin is running
 * on the local backend and has no API to point at.
 */
export async function signIn(password) {
  if (USE_API) {
    const { login } = await import('./httpAdapter')
    await login(password.trim())
  } else {
    // The delay is deliberate. The comparison is local and instant, which would
    // let a wrong password be retried as fast as a keyboard can send them; a
    // beat also stops the failure feeling like the form did not submit.
    await new Promise((resolve) => setTimeout(resolve, 420))

    if (password.trim() !== LOCAL_PASSWORD) {
      throw new Error('That password is not right.')
    }
  }

  const session = { since: new Date().toISOString() }

  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Storage blocked. The session still holds in memory for this page load,
    // which is enough to work — it just will not survive a reload.
  }

  return session
}

export function signOut() {
  clearToken()

  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Nothing to clear if it could never be written.
  }
}
