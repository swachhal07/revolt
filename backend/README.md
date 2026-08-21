# Revolt Nepal — API

The service behind the site and its back office. Node + Express, no build step,
no database.

The frontend at the repository root is a static Vite build; this is the only part
of the system with a process and a secret. The two are wired together by
`VITE_API_URL` on the frontend and `CORS_ORIGINS` here, and neither knows
anything else about the other.

## Running it

```bash
cd backend
npm install
cp .env.example .env   # then fill it in
npm run dev            # node --watch server.js, on :4000
```

Point the frontend at it from the **repository root** `.env.local`:

```
VITE_ADMIN_BACKEND=http
VITE_API_URL=http://localhost:4000
```

Without those two the admin runs on its local adapter — records in the browser's
own storage — and shows a standing notice saying so.

### Running without Cloudinary

`STORE_DRIVER=memory` keeps records in the process instead, so the API runs with
only `ADMIN_PASSWORD` and `JWT_SECRET` set. Everything is lost on restart, and it
refuses to start with `NODE_ENV=production`, because a service that looks healthy
and silently discards every edit is worse than one that will not boot.

## Where the data lives

There is no database. Each collection is a single private JSON asset in
Cloudinary, overwritten whole on every save, cached in memory, and read back
through a short-lived signed URL. `load()` and `save()` in `src/store.js` are the
only touchpoints, so fitting a real database later is that one file.

This suits three short lists that change a few times a week and are read far more
often than written. What it costs is worth knowing:

- **Writes are whole-collection**, serialised per collection by a promise chain.
  Fine for a handful of editors on one instance. Not fine for a hundred, and not
  fine across multiple instances — scale this service horizontally and two
  writers on different instances can lose an edit.
- **Reads are cached per process.** A cold instance pays one signed fetch per
  collection and nothing after that. An asset changed out of band is not noticed
  until the process restarts.

Uploaded images go to `<folder>/media`; the data assets go to `<folder>/data`.

## Routes

Reads are public — the site renders from them, so a token would have to ship in
the public bundle. Writes need the admin token.

| Method | Path | Auth | |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | Liveness. Does not touch Cloudinary, so a slow third party cannot fail a deploy. |
| `POST` | `/api/auth/login` | — | `{ password }` → `{ token, role }`. Rate limited. |
| `GET` | `/api/auth/me` | admin | Whether the token is still good. |
| `GET` | `/api/:collection` | — | Every record. |
| `GET` | `/api/:collection/:id` | — | One record, or 404. |
| `POST` | `/api/:collection` | admin | Create. 409 if the id is taken. |
| `PATCH`/`PUT` | `/api/:collection/:id` | admin | Merge into the existing record. |
| `DELETE` | `/api/:collection/:id` | admin | Remove. 404 if not there. |
| `POST` | `/api/media/image` | admin | Multipart `file` → `{ url }`. |

`:collection` is an allow-list baked into the route pattern — `motorcycles`,
`leadership`, `posts`, from `src/collections.js`. Anything else does not match the
route at all, so an unregistered name cannot create a document in the store on
demand.

The record semantics deliberately mirror the frontend's `localAdapter` exactly:
ids derived from the name and slugified server-side, 409 on a clash, update as a
merge. That is what lets the two be swapped behind the frontend's adapter port
without any screen noticing.

### Why update merges rather than replaces

The editor posts the whole record it loaded. A field added to the schema after
that record was written would be erased by the first save from a tab that has not
been refreshed. Merging costs nothing and makes a stale tab harmless.

## Auth

One shared password in `ADMIN_PASSWORD`, compared with `timingSafeEqual` against
its SHA-256 digest — hashing first so both sides are a fixed 32 bytes and the
length of the secret is not itself the thing that leaks. A correct password gets
a 12h `{ role: 'admin' }` JWT; `requireAdmin` checks the `Bearer` header.

No user table. If you need to know who changed what, that is the point at which
this needs replacing rather than extending.

Login is rate limited to 8 **failed** attempts per 15 minutes per address.
Successful logins are skipped deliberately: without that, an editor saving all
afternoon in a shared office eventually locks out everyone beside them.

## Hardening

- `helmet` for headers, `x-powered-by` off.
- `cors` against an explicit `CORS_ORIGINS` list. A request with no `Origin` at
  all — curl, a health check — is allowed; a disallowed origin gets a 403 rather
  than falling through as a 500 and logging a routine rejection as a fault.
- 1MB JSON body cap. Images go through the multipart route, which caps at 15MB
  and one file, holds nothing on disk, and streams straight to Cloudinary.
- `trust proxy: 1`, so the rate limiter sees real client addresses rather than
  counting the whole internet as Render's proxy.
- The error handler reports statuses we set verbatim and flattens everything else
  to a 500 after logging it — an unhandled error's message routinely contains a
  path, a query, or a fragment of a credential.

## Deploying to Render

`render.yaml` is a blueprint; or create a Web Service by hand with:

- **Root directory** `backend`
- **Build** `npm ci` · **Start** `npm start`
- **Health check path** `/api/health`

Set `CORS_ORIGINS` to the deployed frontend's origin, `ADMIN_PASSWORD`, and the
three Cloudinary values. Let Render generate `JWT_SECRET`.

Two things to expect on the free instance type: it sleeps when idle, so the first
request after a quiet spell takes several seconds and the admin will look slow
until the process is up; and it can be restarted at any time, which is harmless
here only because nothing is kept on local disk.

## Seeding

`scripts/seed.js` loads the site's existing records — every motorcycle, post and
person — into the store, uploading their photographs to Cloudinary on the way.

```bash
npm run seed -- --dry-run      # report what it would do, write nothing
npm run seed                   # seed empty collections
npm run seed -- --force        # overwrite collections that already have records
npm run seed -- --skip-images  # keep local paths instead of uploading
```

It reads `src/data/*.js` directly rather than a JSON copy checked in beside it.
A copy would be a second source of truth that goes stale the first time somebody
edits the real thing, and the public site still renders from those files today.

The difficulty it exists to solve is the images. Those files reference their
photographs two ways — as bundled imports (`import hero from '@/assets/…'`,
which resolves to a hashed URL only when Vite builds the frontend, and to nothing
in Node) and as `public/` paths like `/images/hero/rvx.webp`. The script rewrites
the imports into file paths, resolves both kinds against disk, uploads each
distinct file once, and stores the URL that comes back. Records that come out of
the API are then self-contained — they do not depend on which host is serving the
bundle.

Uploads use a deterministic `public_id` derived from the file's path under
`src/assets` or `public`, so a second run overwrites the same assets instead of
filling the account with duplicates.

Two safeguards worth knowing about. It checks every collection before writing
any, so a run that fails partway does not leave a half-seeded store. And it
refuses outright if any collection already holds records — `--force` replaces
their contents entirely, which is not something to do to a store the admin has
been used against.

**A running instance will not see the new records.** Reads are cached per
process, so an API that was already up when the seed ran keeps serving the empty
lists it cached. Restart it.
