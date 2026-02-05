import { exec } from 'child_process';
import micromatch from 'micromatch';
import path from 'path';
import { promisify } from 'util';
import { defineConfig } from 'vite';

import { createRequire } from 'module';
import serveStatic from 'serve-static';
const require = createRequire(import.meta.url);
const pathToDist = path.resolve('dist');

const execAsync = promisify(exec);
const rootDir = process.cwd();

const watchGlobs = [
    'src/ts/**/*',
    'src/scss/**/*',
    'src/jinja/**/*',
    'kist.yml'
];

let lastBuild = 0;

async function runKist(server) {
    const now = Date.now();
    if (now - lastBuild < 500) return;
    lastBuild = now;

    console.log('[Kist] 🛠️ Running build...');
    try {
        const { stdout, stderr } = await execAsync('npx kist --config ./kist.yml');
        if (stdout) console.log('[Kist] stdout:', stdout);
        if (stderr) console.error('[Kist] stderr:', stderr);
        console.log('[Kist] Build complete');

        setTimeout(() => {
            server?.ws.send({
                type: 'full-reload',
                path: '*'
            });
        }, 200);

    } catch (err) {
        console.error('[Kist] Build failed:', err.stderr || err.message);
    }
}

export default defineConfig({
    root: '.',
    publicDir: false,
    server: {
        port: 3002,
        open: true,
        fs: { strict: false },
    },
    plugins: [
        {
            name: 'serve-kist-html',
            configureServer(server) {
                runKist(server);

                server.middlewares.use('/css', serveStatic(path.join(pathToDist, 'css')));
                // Serve JS from dist root (TypeScript compiles to dist/, not dist/js/)
                server.middlewares.use('/js', serveStatic(pathToDist));

                // Serve / as index.html
                server.middlewares.use((req, res, next) => {
                    if (req.url === '/') req.url = '/index.html';
                    next();
                });

                // Serve all static HTML/CSS/JS from dist/html
                server.middlewares.use(serveStatic(path.resolve('dist/html')));

                server.watcher.on('change', (file) => {
                    const relativePath = path.relative(process.cwd(), file);
                    if (micromatch.isMatch(relativePath, watchGlobs)) {
                        console.log(`[Kist] File changed: ${relativePath}`);
                        runKist(server);
                    }
                });
            },
        },
    ],
});
