/**
 * Who is allowed into the admin.
 *
 * READ THIS BEFORE TRUSTING IT. The check below runs in the browser, so the
 * password is inlined into the bundle at build time and anyone who opens the
 * network tab can read it. Nothing here authenticates anybody; it keeps `/admin`
 * out of the hands of someone who guessed the URL, and that is the whole of what
 * it does. Treat every record the admin can reach as publicly readable until
 * there is a real backend, and do not put anything behind it that would matter if
 * it leaked.
 *
 * It is built to be replaced. `signIn` is already async and already returns a
 * session object, which is the shape a real call returns, so swapping in
 * Supabase's `signInWithPassword` (or any API that answers with a token) means
 * editing this file and nothing else — `AdminApp` reads the session and never
 * knows how it was obtained.
 *
 * The session lives in `sessionStorage`, not `localStorage`: closing the tab ends
 * it. On a shared showroom machine that difference is the whole security story.
 */

const SESSION_KEY = 'revolt:admin-session'

const PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'revolt-admin'

/** The signed-in session, or null. Read synchronously so the guard can paint. */
export function currentSession() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Attempt a sign-in. Resolves to the session, throws with a readable message.
 *
 * The delay is deliberate. The comparison is local and instant, which would let
 * a wrong password be retried as fast as a keyboard can send them; a beat also
 * stops the failure feeling like the form did not submit.
 */
export async function signIn(password) {
  await new Promise((resolve) => setTimeout(resolve, 420))

  if (password.trim() !== PASSWORD) {
    throw new Error('That password is not right.')
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
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Nothing to clear if it could never be written.
  }
}
