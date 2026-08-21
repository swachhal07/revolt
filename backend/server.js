import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { config } from './src/config.js'
import { errorHandler, HttpError, notFoundHandler } from './src/errors.js'
import authRoutes from './src/routes/auth.js'
import mediaRoutes from './src/routes/media.js'
import recordRoutes from './src/routes/records.js'

/**
 * The API behind the Revolt Nepal site and its back office.
 *
 * Deployed as its own Node service — the frontend is a static Vite build, this
 * is the only thing with a process and a secret. The two are wired together by
 * `VITE_API_URL` on the frontend and `CORS_ORIGINS` here, and neither knows
 * anything else about the other.
 */
const app = express()

// Render terminates TLS at its proxy, so without this every request looks like
// it came from the proxy's address — which would make the login rate limiter
// count the whole internet as one client.
app.set('trust proxy', 1)

app.disable('x-powered-by')

app.use(helmet())

app.use(
  cors({
    // An explicit allow-list, and a function rather than an array so a request
    // with no Origin at all — curl, a health check, a server-to-server call —
    // is not rejected for failing to be a browser.
    origin(origin, done) {
      if (!origin || config.corsOrigins.includes(origin)) return done(null, true)

      // A `new Error` here reaches the error handler with no status and is
      // reported as a 500 — which logs a routine, correctly-rejected request as
      // a server fault and buries real ones. A blocked origin is the caller's
      // problem and says so.
      return done(new HttpError(403, `Origin ${origin} is not allowed.`))
    },
  }),
)

// A megabyte is far more than a record needs and far less than a payload worth
// buffering. Images do not come through here — they go to the multipart route,
// which has its own, larger cap.
app.use(express.json({ limit: '1mb' }))

/**
 * The health check, before anything that can fail.
 *
 * Render polls this to decide whether a deploy came up. It deliberately does not
 * touch Cloudinary: a health check that fails when a third party is slow is a
 * health check that rolls back a perfectly good deploy.
 */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: config.env })
})

app.use('/api/auth', authRoutes)
app.use('/api/media', mediaRoutes)
// Mounted last of the three, because its `/:collection` pattern would otherwise
// swallow `/auth` and `/media` as collection names.
app.use('/api', recordRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`API listening on :${config.port} (${config.env})`)
  console.log(`Allowing origins: ${config.corsOrigins.join(', ')}`)
})
