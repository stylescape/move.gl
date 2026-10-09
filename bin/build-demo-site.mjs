// ============================================================================
// move.gl | Assemble the demo site for publishing
// ============================================================================
// Copies the demo pages (`npm run build && npm run build:docs`) and the
// stylescape CSS they use into one self-contained folder, by default
// doc/demo/, so `mkdocs build` publishes them at /demo/ next to the docs.
// The vite dev server serves the same files from dist/ and node_modules/.
//
// Usage: node bin/build-demo-site.mjs [outDir]
// ============================================================================

import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = resolve(root, process.argv[2] ?? 'doc/demo');

const files = [
    ['dist/css/move.gl.css', 'css/move.gl.css'],
    ['dist/css/move.gl.docs.css', 'css/move.gl.docs.css'],
    ['dist/js/demo.js', 'js/demo.js'],
    ['node_modules/stylescape/css/stylescape.css', 'vendor/stylescape/stylescape.css'],
];

const htmlDir = resolve(root, 'dist/html');
if (!existsSync(htmlDir)) {
    throw new Error('dist/html not found; run `npm run build && npm run build:docs` first');
}
const pages = (await readdir(htmlDir)).filter((name) => name.endsWith('.html'));
for (const name of pages) {
    files.push([`dist/html/${name}`, name]);
}

for (const [from] of files) {
    if (!existsSync(resolve(root, from))) {
        throw new Error(`${from} not found; run \`npm run build && npm run build:docs\` first`);
    }
}

await rm(outDir, { recursive: true, force: true });
for (const [from, to] of files) {
    const target = resolve(outDir, to);
    await mkdir(resolve(target, '..'), { recursive: true });
    await cp(resolve(root, from), target);
}

console.log(`Demo site: ${pages.length} pages written to ${outDir}`);
