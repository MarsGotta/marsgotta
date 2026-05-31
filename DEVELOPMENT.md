# marsgotta — development guide

Portfolio site of Marcela Gotta. Production-grade Next.js 16 project.

> ℹ️ The root `README.md` is the **GitHub profile README** (appears on Marcela's GitHub profile). Don't replace it — edit this file instead for dev docs.

## Stack

- **Framework**: Next.js 16 (App Router + Server Components by default)
- **Language**: TypeScript strict
- **Styling**: CSS Modules + CSS variables (no Tailwind, preserves the original design)
- **i18n**: `next-intl` with `[locale]` routes (`/es`, `/en`)
- **Theme**: `next-themes` (dark/light)
- **Lint + format**: Biome 2
- **Tests**: Vitest (unit) + Playwright (e2e)
- **Pre-commit**: Husky + lint-staged + commitlint (conventional commits)
- **CI**: GitHub Actions
- **Deploy**: Vercel

## Requirements

- Node `>=22` (see `.nvmrc`)
- pnpm `10`

## Setup

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Scripts

| Command | What |
|---|---|
| `pnpm dev` | Dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Biome check (no fix) |
| `pnpm lint:fix` | Biome check + auto-fix |
| `pnpm format` | Biome format |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit (run once) |
| `pnpm test:watch` | Vitest watch mode |
| `pnpm test:e2e` | Playwright e2e |
| `pnpm test:e2e:ui` | Playwright UI mode |

## Project structure

```
src/
├── app/
│   ├── [locale]/         # i18n routes (/es, /en)
│   │   ├── layout.tsx
│   │   ├── page.tsx      # Home
│   │   ├── about/
│   │   ├── projects/
│   │   ├── talks/
│   │   ├── lab/
│   │   └── contact/
│   └── globals.css
├── components/           # Reusable UI components
├── data/                 # Content (was data.js in original design)
├── i18n/                 # next-intl config
└── styles/               # Shared CSS (theme, type, etc.)
public/                   # Static assets (icons, fonts, screenshots)
tests/
├── unit/                 # Vitest
└── e2e/                  # Playwright
```

## Commit conventions

Use conventional commits (enforced via commitlint):

- `feat:` new feature
- `fix:` bug fix
- `chore:` tooling / config
- `docs:` documentation
- `style:` formatting (no logic change)
- `refactor:` code change without feature/fix
- `test:` tests only
- `ci:` CI-related

## Deploy

Connected to Vercel, deploys on push to `main`.
Domain: `marcelagotta.com`.
