# Changelog

All notable changes to move.gl are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Breaking

- `move.gl.css` and the Sass entry no longer include unit.gl and hue.gl. The CSS drops their global reset and ~1,200 utility classes (751 KB → 156 KB), the Sass entry no longer re-exports their variables, functions and mixins, and both packages are gone from `dependencies`. The glow colour defaults are now hex literals.
- Animation classes settle at their end state under `prefers-reduced-motion: reduce`. Opt out with `$animate_respect_reduced_motion: false`.
- `VirtualKeyboard` renders `<button class="key">` elements instead of `<div>`s, its default layout adds `Shift`, `Space`, `?123` and `ABC` keys, and it throws when the input or keyboard element is missing.
- The `focus_*` mixins (and new `focus--*` classes) style `:focus-visible` instead of `:focus`.
- Removed the unused, non-compiling `mixins/_shape.scss`, `_boot.scss` and `_accessibility.scss`, and the `-webkit-` copy of every `@keyframes` block.

### Fixed

- Package: the published `package.json` pointed at `./dist/js/...` from inside `dist/`, listed no `.mjs`/`.cjs` files, lacked the Sass dependencies, and no type declarations were built (tsup's declaration step does not run on TypeScript 7; `tsc` now emits them).
- `Draggable`: mixed viewport and offset coordinates when constraining, measured the parent only once, and ignored its options. It now uses pointer events and supports `constrainToParent`, `dragCursor` and the drag callbacks.
- `TouchGestureHandler`: a pinch ended with a spurious tap, and `onRotate` was never called. `touchcancel` is handled.
- `AdvancedGestureRecognition`: a pointer released outside the element stayed "down"; it now uses pointer capture.
- `VirtualKeyboard`: physical keys such as ArrowLeft were typed as text, typing in the input doubled each character, Shift/special modes were unreachable by touch, and text was always appended. It now inserts at the caret and fires `input` events.
- `Screensaver`: media only loaded when both video and audio URLs were given, blocked autoplay caused unhandled rejections, and every mouse move paused the media.
- `TransparentVideoOverlay`: a pending hide could cancel a later show; `destroy()` triggered an error event.
- `LoaderManager`: without Shadow DOM the colour/size options were ignored and keyframe names could clash; `html` overrides were ignored; `showIn` lost the original content's event listeners and broke when called twice; overlays leaked entries.
- Sass: skeleton loaders and several hover/scroll effects referenced keyframes that were never emitted; six flip classes overwrote each other's keyframes; about 40 mixins failed to compile with their default arguments; deprecated global Sass functions were replaced with module functions.
- Duplicate `.cursor--*` and `.hover--scale` rules removed; the license banner now heads the CSS and names move.gl.
- Demo site: restored its build (`npm run build:docs`), page titles, broken demo controls and code samples that documented non-existent APIs.

### Added

- `Draggable` options and `isDragging`; `Screensaver#start()` / `stop()`; `VirtualKeyboard` options (`layout`, `onKeyPress`) and `mode`.
- `touch--target`, `touch--feedback`, `touch--scroll` and `focus--default/ring/glow/outline` classes.
- `npm test` (vitest + happy-dom), `npm run typecheck`, and a MkDocs site with Quick Start, Sass and TypeScript references.

## [0.0.2]

Initial npm releases (0.0.1, 0.0.2).
