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
 * ── Wiring Cloudinary ────────────────────────────────────────────────────────
 * Use an **unsigned** upload preset. A signed upload needs the API secret to
 * build the signature, and a secret in a static frontend is public — anything in
 * `VITE_*` is inlined into the bundle at build time. An unsigned preset is
 * designed for this: it is scoped to one folder, can be rate-limited, and
 * carries no secret. Set both of these in `.env`:
 *
 *   VITE_CLOUDINARY_CLOUD_NAME=your-cloud
 *   VITE_CLOUDINARY_UPLOAD_PRESET=revolt-admin
 *
 * Then in the Cloudinary console: Settings → Upload → add an unsigned preset with
 * that name, point it at a folder, and cap the file size there rather than only
 * here. A limit enforced in the browser is a courtesy; a limit enforced on the
 * preset is the actual limit.
 *
 * Nothing else in the admin changes. `uploadImage` is the only function that
 * knows Cloudinary exists.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/** Is uploading available, or should the editor ask for a URL instead? */
export const canUpload = Boolean(CLOUD_NAME && UPLOAD_PRESET)

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

  if (!ACCEPTED.includes(file.type)) {
    throw new Error(`${file.type || 'That file'} is not an image the site can use. JPEG, PNG, WebP or AVIF.`)
  }

  if (file.size > MAX_BYTES) {
    throw new Error(
      `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is ${MAX_BYTES / 1024 / 1024}MB — export it smaller first.`,
    )
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
