# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project

Frontend-only React + TypeScript + Vite SPA. No backend, no HTTP layer. All computation happens client-side. Deployed to GitHub Pages at base path `/Comparador-Renda-Fixa/` (see [vite.config.ts](vite.config.ts)).

React Compiler is enabled via `@rolldown/plugin-babel` + `babel-plugin-react-compiler` — do not manually memoize (`useMemo`/`useCallback`/`React.memo`) unless profiling shows a need; the compiler handles it.

## Commands

- `pnpm dev` — Vite dev server with HMR
- `pnpm check` — ESLint and Typescript check over the repo

Package manager is **pnpm**. Do not introduce `npm` or `yarn` lockfiles.

## Architecture

The codebase is split between **feature code** and **shared code**:

- **`src/features/<feature-name>/`** — Code that belongs to one feature only. Nothing inside a feature folder may be imported by another feature.
- **`src/<components|hooks|lib|...>/`** — Shared root. Anything here is reusable across features. There is no `src/shared/` subfolder — living at the top level of `src/` already means "shared".

### Folder layout

```
src/
├── App.tsx                       # Top-level <Routes> wiring feature pages into layouts
├── main.tsx                      # Vite entry; renders <App/>
├── index.css                     # Global styles
├── assets/                       # Static assets imported by code
├── components/                   # Shared reusable components (incl. ui/ for primitives)
├── hooks/                        # Shared custom hooks (use-*.ts)
├── lib/                          # Shared utilities, formatters, helpers (no React)
├── context/                      # Shared React contexts (when needed)
├── layouts/                      # App shells
├── pages/                        # Generic non-feature pages (404, etc.)
├── types/                        # Shared TS type declarations
└── features/
    └── <feature>/
        ├── components/           # Feature-private components
        ├── hooks/                # Feature-private hooks
        ├── lib/                  # Feature-private business logic
        ├── models/               # Domain models / classes
        ├── schemas/              # Zod schemas (if needed)
        └── pages/                # Feature page components (mounted in App.tsx)
```

Routing: each feature page lives at `features/<feature>/pages/<name>-page.tsx` and is wired into the router in `src/App.tsx`. Layouts wrap routes via `<Route element={<MainLayout/>}>`.

### Promotion rule

When code in a feature starts being needed by a second feature, move it up to the shared root (`src/components`, `src/hooks`, `src/lib`, etc.). Cross-feature imports (`features/a` → `features/b`) are forbidden.

## Naming conventions

| Target | Convention | Example |
|---|---|---|
| Component files | `kebab-case.tsx` | `asset-combobox.tsx` |
| Class / model files | `PascalCase.ts` | `FixedIncomeAsset.ts` |
| Utility files | `kebab-case.ts` | `format-currency.ts` |
| Hook files | `use-*.ts` | `use-simulation.ts` |
| Component exports | `PascalCase` | `AssetCombobox` |
| Hook exports | `useThing` | `useSimulation` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_ASSETS` |

## Path alias

`@/*` resolves to `src/*`, configured in both `vite.config.ts` (`resolve.alias`) and `tsconfig.json` (`compilerOptions.paths`). Always use it for imports — e.g. `import { MainLayout } from "@/layouts/main-layout"`.