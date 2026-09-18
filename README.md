# Nathan Tran — Portfolio

Personal portfolio site. React 19 + TypeScript + Vite, with hand-built canvas and
scroll-driven interactions (isometric hero grid, physics ball, pinned Experience
wave timeline, spinnable Projects dial, branching Skills tree, ambient particles).

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Type-checks (`tsc -b`) then emits static files to `dist/`. Preview the built
output locally with `npm run preview`.

## Editing content

**All copy lives in [`src/content.ts`](src/content.ts)** — hero, about, experience,
projects, skills, contact. No markup or styling in that file; edit a string or add
a list item and the site updates itself. TypeScript flags missing fields.

Two icon maps live in [`src/components/Skills.tsx`](src/components/Skills.tsx)
(`SKILL_ICONS`, `SECTION_ICONS`) — add an entry there when adding a skill.

## Assets

- `public/assets/` — files served as-is at `/assets/…`: the resume PDF, the
  three square About photos, Experience company logos, and the Tutortle logo
  / VIP screenshot used as project media. Keep this lean; everything here
  ships to `dist/`.
- `assets-src/` — original, uncropped/uncompressed source files, kept for
  future re-crops or re-exports. **Not** served or deployed — images here are
  still committed to git (they're small), but the raw project-demo screen
  recordings are `.gitignore`d (`assets-src/*.mp4`, `*.mov`, `*.webm`): a raw
  recording runs 10-100x the size of an image, and committing one would bloat
  the repo's history with no way to shrink it back short of rewriting
  published history. Those stay local-only; back them up yourself (e.g. a
  cloud drive) if you want the originals to survive a lost laptop.
- Project demo **videos** are hosted on Cloudinary, not this repo — `media` in
  `content.ts` points at `https://res.cloudinary.com/evfukudw/video/upload/…`
  URLs for RatFinder, FletchFlow, and BuzzedIn. To replace one: export a new
  clip, compress it (see the git log around when these were added for the
  ffmpeg settings used — 960px wide, muted, letterboxing cropped out first if
  the recording has any), upload it to the same Cloudinary account, and swap
  the URL in `content.ts`. Everything else (`media` as a local `/assets/…`
  path) still works too — Cloudinary is only used because these three demos
  are large enough that keeping them in git stopped making sense.

The About photos are pre-cropped squares (600×600) because the diamond tiles
rotate 45°, which crops to roughly the central 70% of each image.

## Deploy

Static site, no server or environment variables. Build command `npm run build`,
publish directory `dist`. There is no client-side router (navigation is hash
anchors), so **no SPA rewrite rules are needed**.

Works as-is on Vercel, Netlify, Cloudflare Pages, or any static host — each
auto-detects Vite. For **GitHub Pages** served from a subpath, set
`base: '/<repo-name>/'` in [`vite.config.ts`](vite.config.ts) and switch the
absolute `/assets/…` paths in `src/content.ts` and `index.html` accordingly; a
custom domain at the root needs neither change.

### Domain

Live at **https://nathanantran.com**. The canonical, `og:url`, and the
`og:image` / `twitter:image` URLs in [`index.html`](index.html) are hard-coded to
that origin — link-preview scrapers require absolute image URLs, so keep them
absolute if the domain ever changes.
