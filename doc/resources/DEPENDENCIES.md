# Dependencies

This guide describes the dependencies of this repository and their purpose.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Package Dependencies](#package-dependencies)
- [Peer Dependencies](#peer-dependencies)
- [Development Dependencies](#development-dependencies)

## Package Dependencies

Package dependencies, or just regular dependencies are those packages that are needed for the
library code to run properly and so are are included as part of the library's final production bundle.

move.gl has none: the TypeScript components use only browser APIs, and the Sass compiles on its own.

## Peer Dependencies

Peer dependencies are package dependencies that the library depends on
but are not included as part of the library's final production bundle.

Usually peer dependencies are packages that would-be users would already have or need
as part of their own applications, and hence, no need to include them as part of
the library code.

move.gl has none.

## Development Dependencies

Development dependencies are package dependencies used while developing library code
but are not part of the library's final production bundle.

| Package | Purpose |
| --- | --- |
| `kist`, `@getkist/action-sass`, `@getkist/action-nunjucks` | Build pipeline (`kist.yml`, `kist.docs.yml`): compiles Sass, renders the demo pages, copies sources into `dist/` |
| `sass` | Sass compiler |
| `typescript` | Type-checking and `.d.ts` generation |
| `tsup` | Bundles the TypeScript into ESM and CommonJS |
| `vitest`, `happy-dom` | Unit tests for the TypeScript components |
| `vite`, `serve-static`, `micromatch` | Dev server for the demo pages (`npm run dev`) |
| `nunjucks` | Template engine behind the demo pages |
| `@types/node`, `ts-node` | Node typings and TypeScript execution for tooling |
