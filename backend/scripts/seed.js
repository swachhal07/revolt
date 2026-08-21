import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import url from 'node:url'
import { cloudinary } from '../src/cloudinary.js'
import { COLLECTION_KEYS } from '../src/collections.js'
import { config } from '../src/config.js'
import { load, save } from '../src/store.js'

/**
 * Load the site's existing records into the API.
 *
 * Run once, when the service is first stood up. After that the admin is the
 * source of truth and this script has no business running again — which is why
 * it refuses to touch a collection that already has records in it unless you
 * pass `--force`.
 *
 *   npm run seed -- --dry-run     # report what it would do, write nothing
 *   npm run seed                  # seed empty collections
 *   npm run seed -- --force       # overwrite collections that already have data
 *   npm run seed -- --skip-images # keep local asset paths instead of uploading
 *
 * ── Why this is not just a JSON file ────────────────────────────────────────
 * The obvious build is a `seed/*.json` checked in beside this script, and it is
 * wrong twice over.
 *
 * First, it would go stale. `src/data/*.js` is still what the public site
 * renders from today, so a copy of it is a second source of truth that nobody
 * remembers to update. Reading the real files means the seed is whatever the
 * site currently ships, on the day it is run.
 *
 * Second, and the actual difficulty: those files reference their photographs as
 * bundled imports. `import hero from '@/assets/images/2.png'` resolves to a
 * hashed URL when Vite builds the frontend, and to nothing at all in Node. A
 * hand-written JSON copy would either carry paths that 404 from the API's origin
 * or carry no images. So the script does the one thing that actually works: it
 * resolves each import to a file on disk, uploads it to Cloudinary, and stores
 * the URL that comes back.
 *
 * The uploads use a deterministic `public_id` derived from the file's path, so
 * running this twice overwrites the same assets rather than filling the account
 * with duplicates.
 */

const HERE = path.dirname(url.fileURLToPath(import.meta.url))
const FRONTEND = path.resolve(HERE, '../..')

const args = new Set(process.argv.slice(2))
const DRY_RUN = args.has('--dry-run')
const FORCE = args.has('--force')
const SKIP_IMAGES = args.has('--skip-images')

/* ── Reading the site's data files ────────────────────────────────────────── */

// `import <name> from '@/assets/...'` — the only import shape these files use.
//
// Horizontal whitespace only, never `\s`. `\s` matches newlines, so `\s*$` under
// the `m` flag happily eats the line break after the match and welds the
// replacement onto whatever follows — which produces a file that looks right in a
// diff and fails to parse.
const ASSET_IMPORT =
  /^[ \t]*import[ \t]+(\w+)[ \t]+from[ \t]*['"]@\/assets\/([^'"]+)['"][ \t]*;?[ \t]*$/gm

// Anything else that looks like an import. Matched so the script can refuse
// rather than silently produce a module with a missing binding: a data file that
// grows a real dependency should stop this script, not be half-loaded by it.
const ANY_IMPORT = /^[ \t]*import[ \t].+$/gm

/**
 * Load one of the site's data modules in Node.
 *
 * The asset imports are rewritten into plain string constants holding the file's
 * absolute path, which makes the module loadable — and leaves every image field
 * holding a path this script can then upload.
 *
 * Written to a temp file rather than imported as a `data:` URL so that a syntax
 * error names a file you can open and read. The file is left behind when the
 * import fails, for exactly that reason.
 */
async function loadDataModule(file) {
  const source = await fs.readFile(path.join(FRONTEND, 'src/data', file), 'utf8')

  const assets = []
  const rewritten = source.replace(ASSET_IMPORT, (_match, binding, relative) => {
    const absolute = path.join(FRONTEND, 'src/assets', relative)
    assets.push({ binding, relative, absolute })
    return `const ${binding} = ${JSON.stringify(absolute)};`
  })

  const remaining = rewritten.match(ANY_IMPORT)
  if (remaining) {
    throw new Error(
      `${file} has imports this script cannot resolve:\n  ${remaining.join('\n  ')}\n` +
        'Teach scripts/seed.js how to handle them, or the seed will be incomplete.',
    )
  }

  const temp = path.join(os.tmpdir(), `revolt-seed-${file.replace(/\W/g, '-')}.mjs`)
  await fs.writeFile(temp, rewritten, 'utf8')

  try {
    const loaded = await import(url.pathToFileURL(temp).href)
    await fs.rm(temp, { force: true })
    return { module: loaded, assets }
  } catch (error) {
    throw new Error(`Could not load ${file} (rewritten copy left at ${temp}): ${error.message}`)
  }
}

/* ── Images ───────────────────────────────────────────────────────────────── */

// One upload per distinct file, however many records point at it. The studio
// cutouts are shared between a model and its colourways, so without this the
// same photograph would upload four or five times.
const uploaded = new Map()
let uploadCount = 0

const IMAGE_EXT = /\.(avif|jpe?g|png|webp)$/i

/**
 * Resolve an image reference in a record to a file on disk, or null.
 *
 * The data files reference photographs two ways, and both have to be handled:
 *
 *   - A bundled import, which this script has already rewritten into an absolute
 *     OS path under `src/assets`.
 *   - A `public/` reference like `/images/hero/rvx.webp`, which the site serves
 *     verbatim from its own origin and which never was an import.
 *
 * The second kind would work untouched — the browser resolves it against the
 * frontend's origin, where the file is. It is uploaded anyway so that a record
 * coming out of the API is self-contained: the point of moving the catalogue into
 * a service is that it stops depending on which host is serving the bundle.
 *
 * Note that `path.isAbsolute('/images/…')` is true on Windows too, so the two
 * cases have to be told apart by prefix rather than by absoluteness.
 */
function assetPathFor(value) {
  if (typeof value !== 'string' || !IMAGE_EXT.test(value)) return null

  if (value.startsWith('/')) return path.join(FRONTEND, 'public', value)

  if (path.isAbsolute(value) && value.startsWith(path.join(FRONTEND, 'src', 'assets'))) {
    return value
  }

  // Anything else is already a URL — an https link somebody pasted into the
  // admin, or an asset this script uploaded on a previous run. Left alone.
  return null
}

/**
 * Upload one local file and return its delivered URL.
 *
 * The `public_id` is the asset's path under `src/assets`, slugified — so
 * `images/leadership/moti-lal-dugar.webp` becomes a stable id and a second run
 * overwrites it rather than adding a copy. Legible in the Cloudinary console
 * too, which matters the first time somebody has to work out what a URL is.
 */
async function uploadAsset(absolute) {
  if (uploaded.has(absolute)) return uploaded.get(absolute)

  // Relative to whichever root it came from, so a `src/assets` import and a
  // `public/` reference both produce a short, legible id rather than one
  // carrying half a Windows path.
  const roots = [path.join(FRONTEND, 'src/assets'), path.join(FRONTEND, 'public')]
  const root = roots.find((candidate) => absolute.startsWith(candidate)) ?? FRONTEND
  const relative = path.relative(root, absolute)

  const id = relative
    .replace(/\.[^.]+$/, '')
    .replace(/[\\/]+/g, '/')
    .replace(/[^a-zA-Z0-9/]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  if (DRY_RUN) {
    const pretend = `<upload> ${config.cloudinary.folder}/media/${id}`
    uploaded.set(absolute, pretend)
    uploadCount += 1
    return pretend
  }

  const result = await cloudinary.uploader.upload(absolute, {
    public_id: `${config.cloudinary.folder}/media/${id}`,
    resource_type: 'image',
    overwrite: true,
    invalidate: true,
  })

  uploadCount += 1
  uploaded.set(absolute, result.secure_url)
  return result.secure_url
}

/**
 * Walk a record and replace every local asset path with an uploaded URL.
 *
 * Deep, because images are not only top-level fields — a model's colourways each
 * carry their own cutout, and a record whose nested images were skipped is worse
 * than one that failed outright.
 *
 * Serial rather than `Promise.all`: this is thirty-odd uploads of full-resolution
 * photographs, and firing them all at once is how a free-tier account starts
 * returning rate-limit errors halfway through.
 */
async function resolveAssets(value) {
  const asset = assetPathFor(value)

  if (asset) {
    // A reference with no file behind it is a broken link in the data file, and
    // worth reporting rather than uploading nothing and carrying on.
    try {
      await fs.access(asset)
    } catch {
      throw new Error(`"${value}" is referenced by a data file but ${asset} is not on disk.`)
    }

    return uploadAsset(asset)
  }

  if (Array.isArray(value)) {
    const out = []
    for (const item of value) out.push(await resolveAssets(item))
    return out
  }

  if (value && typeof value === 'object') {
    const out = {}
    for (const [key, item] of Object.entries(value)) out[key] = await resolveAssets(item)
    return out
  }

  return value
}

/* ── Building the collections ─────────────────────────────────────────────── */

async function build() {
  const [motorcycles, posts, leadership] = await Promise.all([
    loadDataModule('motorcycles.js'),
    loadDataModule('posts.js'),
    loadDataModule('leadership.js'),
  ])

  return {
    motorcycles: motorcycles.module.MOTORCYCLES,

    // The site's own posts predate the draft/published split and carry no
    // status. They are live, so they seed as published — the alternative would
    // quietly empty the journal the moment the API became the source of truth.
    posts: posts.module.POSTS.map((post) => ({ status: 'published', ...post })),

    // The page's two rosters flattened into the one register that edits them.
    // The arrays are already in the order the page prints them, so their index
    // is the ranking.
    leadership: [
      ...leadership.module.BOARD.map((person, index) => ({
        ...person,
        tier: 'board',
        order: index + 1,
      })),
      ...leadership.module.MANAGEMENT.map((person, index) => ({
        ...person,
        tier: 'management',
        order: index + 1,
      })),
    ],
  }
}

/* ── The run ──────────────────────────────────────────────────────────────── */

async function main() {
  console.log(
    `Seeding ${config.storeDriver} store` +
      `${DRY_RUN ? ' (dry run — nothing will be written)' : ''}\n`,
  )

  const built = await build()

  // Every collection is checked before anything is written. A half-seeded store
  // from a run that stopped at the second of three collections is a worse
  // starting point than an empty one.
  const blocked = []

  for (const key of COLLECTION_KEYS) {
    const existing = await load(key)
    if (existing.length > 0 && !FORCE) blocked.push(`${key} (${existing.length} records)`)
  }

  if (blocked.length > 0) {
    console.error(
      `Refusing to seed — these collections already hold records:\n` +
        blocked.map((line) => `  ${line}`).join('\n') +
        `\n\nPass --force to overwrite them. This replaces their contents entirely.\n`,
    )
    process.exitCode = 1
    return
  }

  for (const key of COLLECTION_KEYS) {
    const records = built[key] ?? []

    if (records.length === 0) {
      console.log(`${key}: nothing to seed`)
      continue
    }

    const resolved = SKIP_IMAGES ? records : await resolveAssets(records)

    if (DRY_RUN) {
      console.log(`${key}: would write ${resolved.length} records`)
    } else {
      await save(key, resolved)
      console.log(`${key}: wrote ${resolved.length} records`)
    }
  }

  const verb = DRY_RUN ? 'would upload' : 'uploaded'
  console.log(
    `\n${SKIP_IMAGES ? 'Skipped images.' : `${verb} ${uploadCount} images.`}` +
      `${DRY_RUN ? '\nDry run — the store was not touched.' : ''}`,
  )
}

main().catch((error) => {
  console.error(`\nSeed failed: ${error.message}`)
  process.exitCode = 1
})
