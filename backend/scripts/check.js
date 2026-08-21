import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

/**
 * Parse every source file in the service, and fail if any of them does not.
 *
 * This is the `build` script, and the service has nothing to build — it runs
 * straight off these files. It exists because the host's default build command
 * is `npm install && npm run build`, and a missing script there fails the deploy
 * outright.
 *
 * Given that something has to run, it may as well be worth running. A syntax
 * error in this service does not surface at deploy time — the process starts,
 * serves the health check, and throws the first time a request reaches the
 * broken module. That is a green deploy and a dead endpoint, which is the worst
 * shape a failure can take. Parsing every file catches it while the deploy can
 * still be rolled back.
 *
 * `--check` rather than importing: importing runs the module, which for
 * `config.js` means asserting on secrets and for `server.js` means binding a
 * port. Neither belongs in a build step.
 */

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')

function sources(dir) {
  const found = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue

    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...sources(full))
    else if (entry.name.endsWith('.js')) found.push(full)
  }

  return found
}

const files = sources(ROOT)
const failed = []

for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' })
  } catch (error) {
    failed.push({ file: path.relative(ROOT, file), detail: String(error.stderr ?? error.message) })
  }
}

if (failed.length > 0) {
  for (const { file, detail } of failed) console.error(`\n${file}\n${detail}`)
  console.error(`${failed.length} of ${files.length} files failed to parse.`)
  process.exit(1)
}

console.log(`${files.length} files parsed.`)
