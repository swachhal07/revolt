import 'dotenv/config'

/**
 * Every environment variable the service reads, resolved once and validated at
 * startup.
 *
 * Read here and nowhere else, so `process.env` appears in exactly one file and
 * the full set of things this service needs to run is a list you can read rather
 * than a grep. A missing secret fails the process on boot with the name of the
 * variable in the message — the alternative is a service that starts happily and
 * then throws on the first login, which is the same bug discovered an hour later
 * by somebody who cannot see the logs.
 */

function required(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See backend/.env.example for the full set.`,
    )
  }

  return value
}

/**
 * Where records are stored.
 *
 * `cloudinary` is the real one and the default — nothing has to opt in to
 * production behaviour. `memory` keeps everything in the process and loses it on
 * restart, which is exactly what you want to run the API on a laptop without a
 * Cloudinary account, and exactly what you must never deploy.
 *
 * It refuses to be selected in production rather than warning about it, because
 * a warning in a log is not a control: the failure mode is a service that looks
 * completely healthy and silently discards every edit at the next restart.
 */
const storeDriver = process.env.STORE_DRIVER ?? 'cloudinary'

if (storeDriver === 'memory' && process.env.NODE_ENV === 'production') {
  throw new Error('STORE_DRIVER=memory discards data on restart and cannot be used in production.')
}

if (!['cloudinary', 'memory'].includes(storeDriver)) {
  throw new Error(`Unknown STORE_DRIVER "${storeDriver}". Use "cloudinary" or "memory".`)
}

// The media routes and the Cloudinary store both need real credentials; with the
// memory driver and no uploads there is nothing to authenticate, so they stop
// being required and running locally needs two variables instead of five.
const needsCloudinary = storeDriver === 'cloudinary'
const cloudinaryVar = (name) => (needsCloudinary ? required(name) : (process.env[name] ?? ''))

export const config = {
  port: Number(process.env.PORT ?? 4000),
  env: process.env.NODE_ENV ?? 'development',
  storeDriver,

  // Who is allowed to call this. An explicit list rather than `*`, because the
  // admin sends a bearer token and a wildcard origin on a credentialed API is
  // how a token ends up being replayed from somebody else's page.
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  // The one credential. Compared in constant time — see `auth.js`.
  adminPassword: required('ADMIN_PASSWORD'),
  jwtSecret: required('JWT_SECRET'),
  // Long enough to write a model page without being signed out mid-form, short
  // enough that a token left on a shared machine expires the same day.
  tokenTtl: process.env.TOKEN_TTL ?? '12h',

  cloudinary: {
    cloudName: cloudinaryVar('CLOUDINARY_CLOUD_NAME'),
    apiKey: cloudinaryVar('CLOUDINARY_API_KEY'),
    apiSecret: cloudinaryVar('CLOUDINARY_API_SECRET'),
    // Everything this service owns lives under one prefix, so the data assets
    // and the uploaded media are separable from anything else in the account.
    folder: process.env.CLOUDINARY_FOLDER ?? 'revolt',
  },
}
