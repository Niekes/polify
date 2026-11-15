# Contributing to Polify

Thanks for your interest in contributing! This document describes the
development workflow and the quality gates every change has to pass.

## Prerequisites

- Node.js `^22.18.0 || ^24.11.0 || >=26.0.0`
- pnpm (the version is pinned in `package.json`; `corepack enable` picks it up)

## Getting started

```bash
pnpm install
pnpm dev           # start the dev server at http://localhost:5173/
```

## Everyday commands

| Command           | What it does                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `pnpm dev`        | Start the Vite dev server                                                                   |
| `pnpm test`       | Run the unit tests once                                                                     |
| `pnpm test:watch` | Run the tests in watch mode                                                                 |
| `pnpm coverage`   | Run the tests with coverage thresholds (statements 95, branches 85, functions 95, lines 95) |
| `pnpm type-check` | Type-check the whole project with vue-tsc                                                   |
| `pnpm lint`       | ESLint plus the fallow gates (dead code, architecture, health, duplication)                 |
| `pnpm format`     | Format `src/` with Prettier                                                                 |
| `pnpm build`      | Build the production bundle                                                                 |
| `pnpm verify`     | Type-check, lint and coverage in one go, the whole gate before a push                       |

## The quality gate

`pnpm verify` is the whole gate, and it runs in CI. It fails on:

- type errors
- ESLint errors (Vue 3 strongly-recommended + TypeScript rules, browser calls outside `@vueuse/core`)
- unused files, exports, types or class members
- private types leaking through public signatures
- unresolved or unlisted dependencies
- import cycles and architecture boundary violations (zones live in `.fallowrc.jsonc`)
- untested public exports of `src/lib` and `src/composables`
- code duplication
- coverage below the thresholds

Install the Git pre-commit hook with `pnpm hooks:install`. It runs `fallow
audit` on your changeset: findings your changes introduce block the commit,
inherited findings on touched files do not.

## Architecture in short

Dependencies point inwards: `types` → `config` → `lib` → `composables` →
`components` → `views`. The engine (`src/lib`) makes the polygons, colors them
and renders the SVG without knowing Vue or the DOM. Every analysed file belongs
to a zone, so a new module cannot be dropped into `src/` without being placed
consciously. Details live in `AGENTS.md`, the vocabulary in `GLOSSARY.md` and
the decisions in `docs/adr/`.

## Writing tests

- Engine and composables are unit-tested in the `__tests__` folder next to
  the module; the renderer is verified by parsing its SVG output and checking
  the elements and attributes.
- New public exports in `src/lib` or `src/composables` need a test — the
  `coverage-gaps` gate reports them otherwise.
- Component wiring is covered by the HomeView component test.

## Committing

Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, ...). The CI
workflow runs `pnpm verify` on Node 22 and 24 for every push and pull
request; `main` additionally updates the health and coverage badges and
deploys to GitHub Pages.
