// ============================================================================
// move.gl | Sync CSS banner version
// ============================================================================
// Copies the package.json version into the banner in src/scss/_header.scss
// and into src/jinja/index.json (the demo site's template context).
// kist's VersionWriteAction can't do this: it only matches lines that end in
// a bare version number, and the Sass argument is a quoted string.
// ============================================================================

import { readFile, writeFile } from 'node:fs/promises';

const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const headerUrl = new URL('../src/scss/_header.scss', import.meta.url);
const header = await readFile(headerUrl, 'utf8');
const pattern = /(\$version:\s*")[^"]*(")/;

if (!pattern.test(header)) {
    throw new Error('No `$version: "…"` argument found in src/scss/_header.scss');
}

const synced = header.replace(pattern, `$1${version}$2`);
if (synced !== header) {
    await writeFile(headerUrl, synced);
}

const contextUrl = new URL('../src/jinja/index.json', import.meta.url);
const context = JSON.parse(await readFile(contextUrl, 'utf8'));
if (context.version !== version) {
    await writeFile(contextUrl, `${JSON.stringify({ ...context, version }, null, 4)}\n`);
}
