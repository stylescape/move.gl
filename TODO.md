# move.gl TODO

## Open

### Release

- [ ] Publish 0.1.0. The version is bumped and committed on `dev` (`CHANGELOG.md` → 0.1.0); `npm run build`, `npm run check:package`, `lint`, `typecheck` and `test` pass. Push `dev`, then push the tag `v0.1.0`: `publish_package.yml` builds, creates the GitHub release and publishes `dist/` to npm (since 2026-10-18 via npm trusted publishing: configure it once on npmjs.com, move.gl > Settings > Trusted publishing > GitHub Actions, organization `stylescape`, repository `move.gl`, workflow `publish_package.yml`, no environment). Push the `docs` tag to deploy the MkDocs site with the demo at `/demo/`. 0.0.2 stays on npm and is broken; consider `npm deprecate move.gl@0.0.2` once 0.1.0 is out. Re-verified 2026-10-10 from a clean `npm ci`: `build`, `build:docs`, `check:package` (including the demo pages), `lint`, `typecheck` and `test` (34 tests) pass; working tree clean. Only the pushes, the npm publish credentials (now trusted publishing, see above) and the optional `npm deprecate` remain. **2026-10-10:** `dev` is pushed; the `v0.1.0` tag push (which triggers the npm publish) and the optional `npm deprecate move.gl@0.0.2` are left to the user.

### Verification

- [ ] `Draggable`, `TouchGestureHandler` and the virtual keyboard on a real touch device. Checked on 2026-10-09 in headless Chromium with touch emulation (CDP `Input.dispatchTouchEvent`): one-finger drag stays inside its parent, tap, swipe, pinch (scale 1.5 → 3.5) and a 90° rotate are reported, and keyboard taps type, shift and switch to `?123`. Emulation cannot show real-device latency, palm rejection or browser gesture conflicts. Still open on 2026-10-10: nothing further can be checked from inside the repo; needs a physical phone or tablet (run `npm run dev` and open the demo over the LAN).
