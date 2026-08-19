// Where the large media lives.
//
// Everything under `public/` ships with the deployment and is referenced by a
// plain absolute path. The hero film is the one exception: `rvx-3d.mp4` is the
// RVX 3D product video at 2560x1440 / 10 Mbps / 2:12, which is 173MB. That is
// past GitHub's 100MB blob limit, so it cannot be committed, and Git LFS is not
// an option either — Vercel clones without resolving LFS and would deploy the
// pointer file in its place, serving 130 bytes of text as an MP4.
//
// So it is hosted on Vercel Blob and pulled in at runtime:
//
//   1. Upload public/videos/rvx-3d.mp4 to the Blob store.
//   2. Set VITE_MEDIA_BASE_URL in the Vercel project to the store's base URL,
//      no trailing slash, e.g. https://<store-id>.public.blob.vercel-storage.com
//   3. Redeploy — Vite inlines the value at build time, so the variable has to
//      be set before the build, not at runtime.
//
// With the variable unset the path falls back to `public/videos/`, which is
// where the file sits locally (gitignored). That keeps `npm run dev` working
// off the local copy with no Blob round-trip and no configuration.
const MEDIA_BASE_URL = (import.meta.env.VITE_MEDIA_BASE_URL ?? '').replace(/\/+$/, '')

export const HERO_FILM_SRC = `${MEDIA_BASE_URL || '/videos'}/rvx-3d.mp4`
