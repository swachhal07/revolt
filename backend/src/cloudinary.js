import { v2 as cloudinary } from 'cloudinary'
import { config } from './config.js'

/**
 * The configured SDK, as a single shared instance.
 *
 * `secure: true` is not a default worth trusting to habit — an http URL for an
 * asset embedded in an https page is a mixed-content block, so every URL this
 * service hands out has to be https whether anyone remembered to ask for it.
 */
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
})

export { cloudinary }
