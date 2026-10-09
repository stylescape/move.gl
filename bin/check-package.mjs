// ============================================================================
// move.gl | Check the built package and demo site
// ============================================================================
// `npm run check:package`, after `npm run build && npm run build:docs`.
// Two checks:
//
// 1. Package: packs dist/ with `npm pack`, installs the tarball into a
//    scratch project (offline; the package has no runtime dependencies) and
//    checks the ESM import, the CommonJS require, the type declarations
//    (`tsc` with `moduleResolution: nodenext`) and `@use "pkg:move.gl"`.
// 2. Demo site: loads every page in dist/html with dist/js/demo.js in
//    happy-dom, clicks every button once and fails on uncaught errors or
//    console.error output.
//
// The scratch project lives in the OS temp directory and is removed at the
// end. Pass --keep to keep it for inspection.
// ============================================================================

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const keep = process.argv.includes('--keep');
const require = createRequire(import.meta.url);

const failures = [];
const fail = (message) => {
    failures.push(message);
    console.error(`  FAIL ${message}`);
};
const pass = (message) => console.log(`  ok   ${message}`);

for (const file of ['package.json', 'js/index.mjs', 'js/index.cjs', 'js/index.d.ts', 'scss/index.scss', 'css/move.gl.css']) {
    if (!existsSync(path.join(dist, file))) {
        console.error(`dist/${file} is missing; run \`npm run build\` first.`);
        process.exit(1);
    }
}

// Public runtime exports every entry point must provide.
const expectedExports = [
    'Draggable',
    'TouchGestureHandler',
    'AdvancedGestureRecognition',
    'VirtualKeyboard',
    'Screensaver',
    'TransparentVideoOverlay',
    'LoaderManager',
];

// ----------------------------------------------------------------------------
// 1. Package
// ----------------------------------------------------------------------------

async function checkPackage() {
    console.log('Package (npm pack dist/ -> scratch project)');
    const scratch = await mkdtemp(path.join(tmpdir(), 'move.gl-check-'));
    try {
        const packOutput = execFileSync('npm', ['pack', '--json', '--pack-destination', scratch], {
            cwd: dist,
            encoding: 'utf8',
        });
        const [{ filename, files }] = JSON.parse(packOutput);
        const packed = files.map(file => file.path);
        pass(`packed ${filename} (${packed.length} files)`);
        for (const unwanted of ['html/', 'js/demo.js', 'css/move.gl.docs.css', 'scss/docs.scss', 'ts/demo.ts']) {
            if (packed.some(file => file.startsWith(unwanted))) fail(`tarball contains ${unwanted}`);
        }

        const project = path.join(scratch, 'project');
        execFileSync('mkdir', ['-p', project]);
        await writeFile(path.join(project, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type: 'module' }));
        execFileSync('npm', ['install', '--offline', '--no-audit', '--no-fund', '--ignore-scripts', path.join(scratch, filename)], {
            cwd: project,
            stdio: 'pipe',
        });
        pass('installed tarball');

        const run = (file, source) => {
            const target = path.join(project, file);
            return writeFile(target, source).then(() =>
                execFileSync(process.execPath, [target], { cwd: project, encoding: 'utf8' }).trim(),
            );
        };
        const checkExports = (label, keys) => {
            const missing = expectedExports.filter(name => !keys.includes(name));
            if (missing.length) fail(`${label} is missing ${missing.join(', ')}`);
            else pass(`${label} exports ${expectedExports.length} components`);
        };

        const esmKeys = JSON.parse(await run('esm.mjs', "import * as m from 'move.gl'; console.log(JSON.stringify(Object.keys(m)));"));
        checkExports('import "move.gl"', esmKeys);
        const cjsKeys = JSON.parse(await run('cjs.cjs', "console.log(JSON.stringify(Object.keys(require('move.gl'))));"));
        checkExports('require("move.gl")', cjsKeys);

        // Types: resolve through the `types` export condition.
        await writeFile(path.join(project, 'consumer.ts'), [
            `import { ${expectedExports.join(', ')} } from 'move.gl';`,
            `const components: unknown[] = [${expectedExports.join(', ')}];`,
            'export default components;',
            '',
        ].join('\n'));
        await writeFile(path.join(project, 'tsconfig.json'), JSON.stringify({
            compilerOptions: {
                module: 'nodenext',
                moduleResolution: 'nodenext',
                target: 'es2022',
                lib: ['es2022', 'dom'],
                strict: true,
                noEmit: true,
                skipLibCheck: false,
                types: [],
            },
            files: ['consumer.ts'],
        }));
        try {
            execFileSync(path.join(root, 'node_modules/.bin/tsc'), ['-p', project], { cwd: project, encoding: 'utf8', stdio: 'pipe' });
            pass('type declarations resolve (tsc, nodenext)');
        } catch (error) {
            fail(`tsc failed:\n${error.stdout || ''}${error.stderr || ''}`);
        }

        // Sass: `@use "pkg:move.gl"` through the `sass` export condition.
        const sass = require('sass');
        const entry = path.join(project, 'style.scss');
        await writeFile(entry, '@use "pkg:move.gl";\n');
        try {
            const { css } = sass.compile(entry, {
                importers: [new sass.NodePackageImporter(project)],
                silenceDeprecations: ['import'],
            });
            const keyframes = (css.match(/@keyframes /g) || []).length;
            if (keyframes === 0) fail('@use "pkg:move.gl" emitted no @keyframes');
            else pass(`@use "pkg:move.gl" compiles (${Math.round(css.length / 1024)} KB, ${keyframes} @keyframes)`);
        } catch (error) {
            fail(`@use "pkg:move.gl" failed: ${error.message}`);
        }
    } finally {
        if (keep) console.log(`  kept ${scratch}`);
        else await rm(scratch, { recursive: true, force: true });
    }
}

// ----------------------------------------------------------------------------
// 2. Demo site
// ----------------------------------------------------------------------------

async function checkDemoPages() {
    console.log('Demo pages (dist/html + dist/js/demo.js in happy-dom)');
    const htmlDir = path.join(dist, 'html');
    const demoFile = path.join(dist, 'js/demo.js');
    if (!existsSync(htmlDir) || !existsSync(demoFile)) {
        fail('dist/html or dist/js/demo.js is missing; run `npm run build:docs` first');
        return;
    }
    const { Window } = await import('happy-dom');
    // demo.js is an ES module whose only module syntax is its trailing export
    // list; strip it so the bundle can run as a classic script in the window.
    const demo = (await readFile(demoFile, 'utf8')).replace(/\nexport \{[^}]*\};?\s*$/, '\n');
    const pages = (await readdir(htmlDir)).filter(file => file.endsWith('.html')).sort();
    if (pages.length === 0) fail('dist/html has no pages');

    for (const page of pages) {
        const errors = [];
        const log = () => {};
        const window = new Window({
            url: `http://localhost:3002/${page}`,
            width: 1280,
            height: 800,
            console: { ...console, log, info: log, debug: log, warn: log, error: (...args) => errors.push(args.map(String).join(' ')) },
            settings: {
                enableJavaScriptEvaluation: true,
                suppressInsecureJavaScriptEnvironmentWarning: true,
                disableJavaScriptFileLoading: true,
                disableCSSFileLoading: true,
                handleDisabledFileLoadingAsSuccess: true,
                navigation: { disableMainFrameNavigation: true, disableChildFrameNavigation: true, disableChildPageNavigation: true },
            },
        });
        window.addEventListener('error', event => errors.push(`uncaught: ${event.error?.message ?? event.message}`));
        window.addEventListener('unhandledrejection', event => errors.push(`unhandled rejection: ${event.reason?.message ?? event.reason}`));
        // Media elements: happy-dom does not implement playback.
        window.HTMLMediaElement.prototype.play = () => Promise.resolve();
        window.HTMLMediaElement.prototype.pause = () => {};

        try {
            // happy-dom runs inline scripts inside a function wrapper, so their
            // top-level functions (used by onclick="...") would not become
            // globals. Park them while parsing, then run them with eval() in
            // document order, as a browser would.
            const html = (await readFile(path.join(htmlDir, page), 'utf8')).replace(/<script>/g, '<script type="text/x-move-check">');
            window.document.write(html);
            for (const script of window.document.querySelectorAll('script[type="text/x-move-check"]')) {
                window.eval(script.textContent);
            }
            window.eval(demo);
            window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
            // Not waitUntilComplete(): demo pages run intervals (screensaver,
            // logs) that never finish.
            await new Promise(resolve => setTimeout(resolve, 50));

            const buttons = [...window.document.querySelectorAll('button')];
            for (const button of buttons) {
                if (!button.isConnected || button.disabled) continue;
                button.click();
            }
            await new Promise(resolve => setTimeout(resolve, 20));

            const title = window.document.title.trim();
            if (!title) errors.push('page has no <title>');
            if (errors.length) fail(`${page}: ${[...new Set(errors)].join(' | ')}`);
            else pass(`${page} (${buttons.length} buttons clicked)`);
        } catch (error) {
            fail(`${page}: ${error.message}`);
        } finally {
            await window.happyDOM.abort();
            window.close();
        }
    }
}

await checkPackage();
await checkDemoPages();

if (failures.length) {
    console.error(`\n${failures.length} check(s) failed.`);
    process.exit(1);
}
console.log('\nAll package and demo checks passed.');
