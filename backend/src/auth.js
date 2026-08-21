import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { config } from './config.js'
import { unauthorized } from './errors.js'

/**
 * One shared password, checked here rather than in the browser.
 *
 * The admin used to compare a password client-side, which is theatre: the value
 * it compares against is in the bundle. Moving the check here is the entire
 * point of the service having a login at all — the secret lives in the server's
 * environment, and the browser gets back a token that proves it asked nicely.
 */

/**
 * Constant-time comparison.
 *
 * `===` on a secret leaks its length and its matching prefix through how long it
 * takes to fail. That is a real attack on a password compared over a network,
 * and the fix costs nothing.
 *
 * The digests are what get compared, not the raw strings: `timingSafeEqual`
 * throws on a length mismatch, so hashing first makes both sides a fixed 32
 * bytes and keeps the length itself from being the thing that leaks.
 */
function matches(candidate) {
  const a = crypto.createHash('sha256').update(String(candidate)).digest()
  const b = crypto.createHash('sha256').update(config.adminPassword).digest()

  return crypto.timingSafeEqual(a, b)
}

/** Check a password and mint a token, or throw. */
export function signIn(password) {
  if (!password || !matches(password)) {
    // Deliberately the same message whatever was wrong with it.
    throw unauthorized('That password is not right.')
  }

  const token = jwt.sign({ role: 'admin' }, config.jwtSecret, { expiresIn: config.tokenTtl })

  return { token, role: 'admin' }
}

/** Verify a token, returning its payload or throwing. */
export function verify(token) {
  try {
    return jwt.verify(token, config.jwtSecret)
  } catch {
    // Expired and forged are the same answer to the caller: sign in again.
    throw unauthorized('Your session has expired. Sign in again.')
  }
}

/**
 * The guard on every write route.
 *
 * Reads are deliberately not guarded — the public site fetches the same
 * collections this admin edits, and a catalogue that needs a token to be read is
 * a catalogue nobody can see.
 */
export function requireAdmin(req, res, next) {
  const header = req.get('authorization') ?? ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized('Sign in to make changes.'))
  }

  try {
    req.auth = verify(token)
    return next()
  } catch (error) {
    return next(error)
  }
}
