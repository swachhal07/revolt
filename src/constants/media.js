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
//   2. Set VITE_HERO_FILM_URL in the Vercel project to the URL the upload
//      returns, in full.
//   3. Redeploy — Vite inlines the value at build time, so the variable has to
//      be set before the build, not at runtime.
//
// This is the whole URL rather than a base to join a filename onto, because
// Blob appends a random suffix to uploads by default: the stored object is
// something like `rvx-3d-a8Kd93.mp4`, not the name it went up under. Taking the
// URL whole means the suffix is not something anyone has to think about.
//
// With the variable unset it falls back to `public/videos/`, which is where the
// file sits locally (gitignored). That keeps `npm run dev` working off the local
// copy with no Blob round-trip and no configuration.
export const HERO_FILM_SRC =
  import.meta.env.VITE_HERO_FILM_URL || '/videos/rvx-3d.mp4'
