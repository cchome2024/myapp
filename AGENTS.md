# Repository Guidelines

## Project Structure & Module Organization
- `src/app` hosts the Next.js App Router entry points plus global styles; `src/components` holds feature and UI primitives shared across the workspace, sidebar, and results panels.
- Data helpers live in `src/lib` and `src/hooks`; mock payloads and seed files are under `data/` and `scripts/` (run with `pnpm tsx scripts/create-sample-data.ts`).
- Static assets, including cover art and icons, are stored in `public/`; Tailwind configuration now lives in `tailwind.config.cjs` for compatibility with Vercel builds.

## Build, Test, and Development Commands
- `pnpm dev` launches the Turbopack dev server at `http://localhost:3000`.
- `pnpm build` runs `next build` (webpack) and produces the `.next/` output consumed by Vercel.
- `pnpm start` serves the production bundle locally for smoke checks.
- `pnpm lint` executes the flat ESLint config (`next/core-web-vitals` + TypeScript). Install `@eslint/eslintrc` if the command complains about missing adapters.

## Coding Style & Naming Conventions
- Follow TypeScript with strict mode; keep modules focused and export named components/utilities.
- JSX uses two-space indentation; prefer functional components and hooks over classes.
- Tailwind classes follow the mobile-first pattern (`flex`, then `lg:flex`) and rely on the CSS variables defined in `globals.css`.
- File names are kebab-case for components (`publish-tab.tsx`) and camelCase for helpers (`fileStore.ts`).

## Testing Guidelines
- There is no formal test runner yet; run targeted smoke tests via `pnpm start` and exercise critical flows (uploading documents, step progression, publish dialogs).
- Use the Node script `node test-crud.js` to sanity-check the local file-store implementation when adjusting persistence logic.
- When adding automated tests, prefer `vitest` or `jest` with React Testing Library, and mirror files under a co-located `__tests__` directory.

## Commit & Pull Request Guidelines
- Match the existing history: short, imperative summaries (~50 characters) such as `tailwind fix` or `remove turbopack`.
- PRs should include: a concise problem statement, testing notes (commands + results), and screenshots/gifs for UI-facing changes.
- Link related Linear/Jira/GitHub issues in the description and flag breaking changes early for coordinated releases.

## Deployment Notes
- Production runs on Vercel; confirm `pnpm build` locally before pushing to trigger a clean deployment.
- If Tailwind styles disappear in preview builds, ensure `tailwind.config.cjs` remains in sync and re-run the deployment to refresh `/_next/static/css` assets.
