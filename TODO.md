# move.gl TODO

## From the bug-fix pass (2026-10-08)

Left open after the pass that fixed the build, the TypeScript components, the library SCSS, the demo site and the MkDocs site (uncommitted on `dev` at the time of writing; see `CHANGELOG.md` → Unreleased).

### Release

- [ ] Commit the bug-fix pass, then bump the version and publish. 0.0.2 is already on npm and is broken (its `exports` point at `./dist/js/...` from inside `dist/`, and it ships no `.mjs`/`.cjs`/`.d.ts`). The next release is breaking; the Breaking section of `CHANGELOG.md` lists why. `npm run build` copies the new version into the CSS banner (`script/sync-banner-version.mjs`), `VERSION` and `CITATION.cff`.

### Verification

- [ ] Check the demo pages in a real browser (`npm run dev`): layout, animations, theme toggle. So far they were only served and smoke-tested in happy-dom (no runtime errors on all 27 pages, every button clicked once).
- [ ] Try `Draggable`, `TouchGestureHandler` (pinch/rotate) and the virtual keyboard on a real touch device.
- [ ] Add a `lint` script. `eslint.config.js` only covers plain JS and ESLint isn't installed; linting the TypeScript needs `eslint`, `@eslint/js`, `eslint-config-prettier` and `typescript-eslint`.
- [ ] Automate the two checks that were run by hand during the bug-fix pass: install the packed `dist/` tarball into a scratch project (ESM import, CommonJS require, types, `@use "pkg:move.gl"`), and load every built demo page with `demo.js` in happy-dom.

### Library SCSS

- [ ] Most `animate_*` mixins write a fixed `@keyframes` name, so including one twice with different settings makes the last one win for both. `animate_flip` / `keyframes_flip` got an optional `$name` parameter for this; apply the same pattern to the others.
- [ ] Mixin names defined in more than one module: `keyframes_fade_in` / `keyframes_fade_out` (effects and keyframes), `keyframes_heartbeat` (loaders and keyframes), `keyframes_flip` (bubble loader and keyframes). They don't clash today but will if those modules are ever forwarded together.
- [ ] `filter_hover($default-filter: none, $hover-filter, …)` has a required parameter after an optional one; reorder at the next breaking release.

### Docs and demo site

- [ ] `.btn-primary` is styled twice in `src/scss/docs.scss`: a flat style shared with `.btn--primary`, then a purple gradient that only `.btn-primary` gets. Demo pages use `btn-primary` and the index uses `btn--primary`, so "primary" looks different across pages. Pick one.
- [ ] The demo site (`npm run build:docs` → `dist/html`) is only used by `npm run dev`; `deploy_docs.yml` deploys the MkDocs site in `doc/`. Decide whether the demo pages should be published too (e.g. linked from the MkDocs site).
- [ ] The MkDocs Sass and TypeScript references (`doc/guides/`) were generated from the README's API sections; keep the two in sync, or have the README link to the site instead of repeating it.
