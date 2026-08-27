/**
 * Where images come from, and where new ones go.
 *
 * The site's own data files import their photographs so Vite hashes them, which
 * is right for images that ship with the code and impossible for images added
 * after it is built — nothing in a browser can create a new bundled import. So
 * every image an admin sets is a URL string instead.
 *
 * That costs nothing, because a bundled import *also* resolves to a URL string at
 * runtime. A seeded record and an admin-authored one hold the same kind of value
 * in an image field, and no component can tell them apart. Cloudinary slots into
 * exactly that gap: upload returns a URL, the URL goes in the record, the site
 * renders it like any other.
 *
 * ── Two routes to Cloudinary ─────────────────────────────────────────────────
 * With the API fitted (`VITE_ADMIN_BACKEND=http`) the file goes to the service,
 * which holds the API secret and signs the upload itself. That is the better
 * path and the one to use: the upload is authenticated, so it is available to
 * whoever is signed in and to nobody else.
 *
 * Without it, the browser uploads directly using an **unsigned** preset. A
 * signed upload needs the API secret to build the signature, and a secret in a
 * static frontend is public — anything in `VITE_*` is inlined into the bundle at
 * build time. An unsigned preset is designed for this case: scoped to one
 * folder, rate-limitable, and carrying no secret. It is also open to anyone who
 * reads the bundle and finds the preset name, which is exactly why the service
 * takes over the moment there is one.
 *
 *   VITE_CLOUDINARY_CLOUD_NAME=your-cloud
 *   VITE_CLOUDINARY_UPLOAD_PRESET=revolt-admin
 *
 * Then in the Cloudinary console: Settings → Upload → add an unsigned preset with
 * that name, point it at a folder, and cap the file size there rather than only
 * here. A limit enforced in the browser is a courtesy; a limit enforced on the
 * preset is the actual limit.
 *
 * Nothing else in the admin changes either way. `uploadImage` is the only
 * function that knows how an image gets uploaded.
 */

// Defaulted, not required. `.env` is gitignored, so a deploy host that has not
// been given these builds with uploading silently disabled — which is what
// happened. Neither value is a secret: both are inlined into the bundle on every
// build anyway, so a default here changes nothing about exposure and stops the
// admin losing its upload button on any host that has not been configured by
// hand. The variables still override, per-machine.
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dczefv79t'
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'revolt-admin'

const USE_API = (import.meta.env.VITE_ADMIN_BACKEND ?? 'local') === 'http'

/**
 * Is uploading available, or should the editor ask for a URL instead?
 *
 * The service does not need the preset variables at all — it has the real
 * credentials — so with the API fitted this is simply true.
 */
export const canUpload = USE_API || Boolean(CLOUD_NAME && UPLOAD_PRESET)

// Refused before the request rather than after. An 11MB phone photograph is a
// slow upload that fails at the far end, and finding that out locally is faster
// and cheaper for everyone.
const MAX_BYTES = 10 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/**
 * Upload one file and resolve to its URL.
 *
 * Throws with something a person can act on when it cannot: an unconfigured
 * environment, a rejected file, or Cloudinary's own error message, which is
 * usually specific and worth passing through verbatim rather than replacing with
 * "Upload failed".
 */
export async function uploadImage(file) {
  if (!canUpload) {
    throw new Error(
      'Image uploading is not configured yet. Paste an image URL instead, or set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.',
    )
  }

  // Checked before either route. The type and size rules are the same wherever
  // the file is going, and finding out locally is faster and cheaper than
  // finding out at the far end of a slow upload.
  if (!ACCEPTED.includes(file.type)) {
    throw new Error(`${file.type || 'That file'} is not an image the site can use. JPEG, PNG, WebP or AVIF.`)
  }

  if (file.size > MAX_BYTES) {
    throw new Error(
      `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is ${MAX_BYTES / 1024 / 1024}MB — export it smaller first.`,
    )
  }

  if (USE_API) {
    // Lazy, for the same reason `session.js` does it: a static import would pull
    // the adapter's `VITE_API_URL` assertion into a bundle that has no API.
    const { uploadImage: viaApi } = await import('./httpAdapter')
    return viaApi(file)
  }

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error?.message || `Cloudinary refused the upload (${response.status}).`)
  }

  // `secure_url` rather than `url`: the plain one is http, and an http image on
  // an https page is blocked as mixed content.
  return payload.secure_url
}

/**
 * A display URL for an image field, sized for where it is being shown.
 *
 * Cloudinary resizes from the URL, so a 2400px master can be requested at the
 * 120px the admin's thumbnails actually paint — which is the difference between a
 * list of forty models costing a few hundred kilobytes and costing forty
 * megabytes. `f_auto,q_auto` lets it pick the format and quality per browser.
 *
 * A URL from anywhere else is returned untouched, which covers every seeded
 * record. Detection is by the delivery path, not by the hostname, because a
 * Cloudinary account on a custom domain still serves `/image/upload/`.
 */
export function thumbUrl(url, width = 160) {
  if (typeof url !== 'string' || !url.includes('/image/upload/')) return url

  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_fill/`)
}
