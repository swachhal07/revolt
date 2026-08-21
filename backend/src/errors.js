/**
 * An error with a status code on it.
 *
 * Route handlers throw these and the central handler turns them into responses,
 * which keeps every route free of `res.status(...).json(...)` branches and makes
 * "did this path send a response?" a question with one answer.
 */
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const badRequest = (message) => new HttpError(400, message)
export const unauthorized = (message) => new HttpError(401, message)
export const notFound = (message) => new HttpError(404, message)
export const conflict = (message) => new HttpError(409, message)

/**
 * The last middleware in the stack.
 *
 * Two rules. Anything with a status we set is reported verbatim, because we
 * wrote that message for the person reading it. Anything else is a bug, and it
 * is logged in full and reported as a flat 500 — an unhandled error's message
 * routinely contains a file path, a query, or a fragment of a credential, and
 * none of that belongs in a response body.
 *
 * Multer's own errors are the exception worth naming: they are genuinely the
 * caller's fault (file too large, too many files) and their messages are safe
 * and useful, so they pass through as 400s.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies the error handler by arity.
export function errorHandler(error, req, res, next) {
  if (error?.status && error.status < 500) {
    return res.status(error.status).json({ error: error.message })
  }

  if (error?.name === 'MulterError') {
    return res.status(400).json({ error: error.message })
  }

  console.error(`[${req.method} ${req.originalUrl}]`, error)
  return res.status(500).json({ error: 'Something went wrong on the server.' })
}

/** 404 for anything that reached the end of the router stack unmatched. */
export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route at ${req.method} ${req.originalUrl}.` })
}

/**
 * Wrap an async handler so a rejected promise reaches the error handler.
 *
 * Express 4 does not await route handlers, so a throw inside an async one is an
 * unhandled rejection and the request simply hangs until it times out. This is
 * the standard fix and the reason every async route below is wrapped in it.
 */
export const route = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}
