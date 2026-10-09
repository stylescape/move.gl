# move.gl TODO

## From the bug-fix pass (2026-10-08)

Left open after the pass that fixed the build, the TypeScript components, the library SCSS, the demo site and the MkDocs site (uncommitted on `dev` at the time of writing; see `CHANGELOG.md` → Unreleased).

### Release

- [ ] Commit the bug-fix pass, then bump the version and publish. 0.0.2 is already on npm and is broken (its `exports` point at `./dist/js/...` from inside `dist/`, and it ships no `.mjs`/`.cjs`/`.d.ts`). The next release is breaking; the Breaking section of `CHANGELOG.md` lists why. `npm run build` copies the new version into the CSS banner (`script/sync-banner-version.mjs`), `VERSION` and `CITATION.cff`.

### Verification

- [ ] `Draggable`, `TouchGestureHandler` and the virtual keyboard on a real touch device. Checked on 2026-10-09 in headless Chromium with touch emulation (CDP `Input.dispatchTouchEvent`): one-finger drag stays inside its parent, tap, swipe, pinch (scale 1.5 → 3.5) and a 90° rotate are reported, and keyboard taps type, shift and switch to `?123`. Emulation cannot show real-device latency, palm rejection or browser gesture conflicts.
- [ ] The demo pages use the vendored stylescape 0.4.1, so axe (2026-10-09, headless Chromium, light and dark) reports `color-contrast` on `.ss-c-button--primary`, `.ss-c-footer__copyright`, section titles and links. stylescape 0.5.1 (on npm) darkens those tokens; update the demo's stylescape and re-run. Otherwise all 27 pages load without console errors or failed requests, the theme toggle works and persists, and nothing overflows at 375px.
- [ ] Add a `lint` script. `eslint.config.js` only covers plain JS and ESLint isn't installed; linting the TypeScript needs `eslint`, `@eslint/js`, `eslint-config-prettier` and `typescript-eslint`.

### Library SCSS

- [ ] Mixin names defined in more than one module: `keyframes_fade_in` / `keyframes_fade_out` (effects and keyframes), `keyframes_heartbeat` (loaders and keyframes), `keyframes_flip` (bubble loader and keyframes). They don't clash today but will if those modules are ever forwarded together. (2026-10-09: the keyframes module is not forwarded by `index.scss`, so package users can't hit this; deduplicating means renaming public `effects` / `loaders` mixins, which needs a naming decision.)

### Docs and demo site

- [ ] `.btn-primary` is styled twice in `src/scss/docs.scss`: a flat style shared with `.btn--primary`, then a purple gradient that only `.btn-primary` gets. Demo pages use `btn-primary` and the index uses `btn--primary`, so "primary" looks different across pages. Pick one.
- [ ] The demo site (`npm run build:docs` → `dist/html`) is only used by `npm run dev`; `deploy_docs.yml` deploys the MkDocs site in `doc/`. Decide whether the demo pages should be published too (e.g. linked from the MkDocs site).
- [ ] The MkDocs Sass and TypeScript references (`doc/guides/`) were generated from the README's API sections; keep the two in sync, or have the README link to the site instead of repeating it.
