// ============================================================================
// move.gl | Write dist/package.json
// ============================================================================
// The package is published from dist/, so its manifest needs paths relative
// to dist/ (not the repo root) and must carry the runtime dependencies that
// the SCSS resolves via `pkg:` imports.
// ============================================================================

import { readFile, writeFile } from 'node:fs/promises';

const root = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

const copiedFields = [
    'name', 'version', 'description', 'keywords', 'homepage', 'bugs',
    'license', 'author', 'contributors', 'funding', 'repository', 'type',
    'engines', 'dependencies',
];

const manifest = Object.fromEntries(
    copiedFields.filter(field => field in root).map(field => [field, root[field]]),
);

Object.assign(manifest, {
    main: './js/index.cjs',
    module: './js/index.mjs',
    types: './js/index.d.ts',
    sass: './scss/index.scss',
    style: './css/move.gl.css',
    exports: {
        '.': {
            types: './js/index.d.ts',
            sass: './scss/index.scss',
            import: './js/index.mjs',
            require: './js/index.cjs',
        },
        './scss': './scss/index.scss',
        './css/move.gl.css': './css/move.gl.css',
        './css/move.gl.min.css': './css/move.gl.min.css',
        './package.json': './package.json',
    },
    sideEffects: ['*.css', '*.scss'],
    // dist/ also holds the dev-only docs site (`npm run build:docs`).
    files: ['js/index.*', 'js/*.d.ts', 'css/move.gl.css', 'css/move.gl.min.css', 'scss/', '!scss/docs.scss*', 'ts/', '!ts/demo.ts'],
});

await writeFile(new URL('../dist/package.json', import.meta.url), `${JSON.stringify(manifest, null, 4)}\n`);
