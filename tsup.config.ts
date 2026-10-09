import { defineConfig } from 'tsup';

export default defineConfig([
    // Main library build (ESM + CJS)
    {
        entry: { 'index': 'src/ts/index.ts' },
        format: ['esm', 'cjs'],
        // Declarations come from `tsc -p tsconfig.build.json`: tsup's dts
        // bundler relies on the TypeScript JS API, which TypeScript 7 dropped.
        dts: false,
        outDir: 'dist/js',
        outExtension({ format }) {
            return {
                js: format === 'esm' ? '.mjs' : '.cjs',
            };
        },
        target: 'es2020',
        splitting: false,
        sourcemap: true,
        clean: false,
        minify: false,
    },
]);
