import { Router } from 'express'
import { requireAdmin } from '../auth.js'
import { badRequest, route } from '../errors.js'
import { toCloudinary, uploadImage } from '../upload.js'

const router = Router()

/**
 * Upload one image, get back the URL to store in a record.
 *
 * Admin-only, and it has to be: an open image endpoint on a Cloudinary account
 * is somebody else's free CDN within a day of being found.
 *
 * This replaces the browser's unsigned-preset upload. Unsigned presets are the
 * only way to upload straight from a static frontend — a signed upload needs the
 * API secret, and a secret in a bundle is public — but they are also open to
 * anyone who reads the bundle and finds the preset name. Now that there is a
 * server holding the secret, the upload goes through it and the preset can be
 * turned off.
 */
router.post(
  '/image',
  requireAdmin,
  uploadImage.single('file'),
  route(async (req, res) => {
    if (!req.file) throw badRequest('No file was attached. Send it as `file`.')

    res.status(201).json({ url: await toCloudinary(req.file) })
  }),
)

export default router
