import { localAdapter } from './localAdapter'
import { assertPort } from './port'

/**
 * The one thing the admin screens import.
 *
 * Which adapter answers is decided here and nowhere else, so fitting a real
 * backend is an entry in this map plus a `.env` line — no screen imports an
 * adapter directly, and none of them can tell which one they are talking to.
 *
 *   VITE_ADMIN_BACKEND=local   (default)
 *
 * When the real one arrives, add it to `ADAPTERS` and set the variable. The
 * assertion below then fails at startup rather than mid-save if the new adapter
 * is missing a method.
 */
const ADAPTERS = {
  local: localAdapter,
}

const NAME = import.meta.env.VITE_ADMIN_BACKEND ?? 'local'

const chosen = ADAPTERS[NAME]

if (!chosen) {
  throw new Error(
    `Unknown admin backend "${NAME}". Available: ${Object.keys(ADAPTERS).join(', ')}.`,
  )
}

export const backend = assertPort(chosen, NAME)

/**
 * Which backend is answering, for the one place it is honest to say so: a banner
 * in the admin telling whoever is using it that their edits are local to this
 * browser. A tool that looks like it is saving to a server when it is not is a
 * tool that loses somebody's afternoon.
 */
export const BACKEND_NAME = NAME
export const IS_LOCAL_BACKEND = NAME === 'local'
