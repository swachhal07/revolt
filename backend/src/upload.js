import multer from 'multer'
import { cloudinary } from './cloudinary.js'
import { config } from './config.js'
import { badRequest } from './errors.js'

/**
 * Image uploads, straight through to Cloudinary.
 *
 * `memoryStorage` on purpose: nothing touches the filesystem. The service runs
 * on an ephemeral instance with no writable disk worth relying on, and a temp
 * file that has to be cleaned up is a temp file that will not be cleaned up on
 * the path where the upload fails.
 *
 * 15MB and one file per request. The cap is not about Cloudinary's limits — it
 * is about a buffer sitting in this process's memory while the upload runs, and
 * a photograph for a model page that is larger than this needs resizing before
 * it needs uploading.
 */

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter(req, file, done) {
    if (!ALLOWED.has(file.mimetype)) {
      // Checked against the declared MIME type, which a caller controls — this
      // is a guard against an accidental PDF, not against a determined one.
      // Cloudinary re-decodes whatever arrives and rejects anything that is not
      // actually an image, which is the check that counts.
      return done(badRequest(`${file.mimetype} is not an image this service accepts.`))
    }

    return done(null, true)
  },
})

/**
 * Push a buffer to Cloudinary and return the delivered URL.
 *
 * `upload_stream` rather than a base64 data URI: a 15MB buffer becomes a 20MB
 * string as base64, and the whole point of holding it in memory is to not do
 * that twice.
 */
export function toCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${config.cloudinary.folder}/media`,
        resource_type: 'image',
        // Let Cloudinary pick the format it serves. The site asks for webp and
        // avif variants through URL transforms, and pinning the stored format
        // would defeat that.
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => (error ? reject(error) : resolve(result.secure_url)),
    )

    stream.end(file.buffer)
  })
}
