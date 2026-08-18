# Revolt Nepal

Marketing site for Revolt Nepal — React 19 + Vite + Tailwind CSS v4 + React Router.

## Getting started

```bash
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

## Folder structure

```
public/
  images/motorcycles/     product photography (referenced as /images/...)
src/
  assets/                 images/icons imported by JS (hashed at build time)
  components/
    layout/               Navbar, Footer, RootLayout, ScrollToTop
    ui/                   Button, Card, Container, Section — reusable primitives
    home/                 sections used only on the home page
    motorcycles/          MotorcycleCard, MotorcycleGrid
  constants/site.js       nav links, contact details, site metadata
  data/                   placeholder content (motorcycles, dealers)
  hooks/                  reusable React hooks
  pages/                  one file per route
  routes/AppRoutes.jsx    route table
  styles/index.css        Tailwind entry + design tokens
  utils/                  cn(), formatNpr()
  App.jsx                 router provider
  main.jsx                React entry point
```

### Conventions

- `@/` is an alias for `src/` — `import Button from '@/components/ui/Button'`.
- Colors, fonts and spacing live in the `@theme` block of `src/styles/index.css`.
  Use `bg-brand-600`, `text-ink-500` etc. rather than raw hex values.
- One component per file, default export, PascalCase filename.
- A component used by exactly one page goes in `components/<page>/`; anything
  reused across pages goes in `components/ui/`.

## To do

- Replace placeholder copy in `src/pages/About.jsx`.
- Replace placeholder data in `src/data/` with real specs, prices and dealers.
- Add product images to `public/images/motorcycles/`.
- Wire the contact form in `src/pages/Contact.jsx` to a real backend.
- Configure SPA fallback rewrites on the host so deep links resolve.
