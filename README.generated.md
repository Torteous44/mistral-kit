# mistral-kit
Production-minded monorepo for building Mistral-powered chat experiences. The root houses the published UI kit (`packages/ui`) plus a Next.js 16 showcase (`apps/site`) that demonstrates the components, hooks, API proxies, and tools working together on the Edge runtime.

## Quick Start
```bash
pnpm install
pnpm -w build
pnpm -w dev
pnpm -w test
```

## Workspace

* `apps/site` — Next.js 16 + React 19 demo/docs app (App Router, MDX, Tailwind 4) wired to the local UI kit through pnpm workspaces.
* `packages/ui` — `@matthewporteous/mistral-kit` source (components, headless hooks, Edge-ready API routes, CLI scaffolder, utilities).

## Scripts

```bash
pnpm -w lint            # runs eslint across all packages
pnpm -w test            # executes vitest suites (currently used by packages/ui)
pnpm -w build           # builds every workspace (tsup for ui, next build for apps)
pnpm -w dev             # starts dev servers (e.g., next dev for apps/site)
```

## Local Development

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` (if present) or create `apps/site/.env` with `MISTRAL_API_KEY=...` for the server proxies.
3. Run `pnpm -w dev` to start the Next.js app alongside any watch builds.
4. Use `pnpm -C packages/ui dev` for tsup watch mode while iterating on the library.

## Testing & Linting

* `pnpm -C packages/ui lint`
* `pnpm -C packages/ui test`
* `pnpm -C packages/ui typecheck`

## Publishing `packages/ui`

```bash
cd packages/ui
pnpm install
pnpm build
npm publish --access public
```

(Ensure `package.json` version is bumped and `dist/` contains the latest build before publishing.)

## Contributing

1. Fork or branch from `main`.
2. Keep changes focused (docs vs. features vs. fixes).
3. Run lint + tests (`pnpm -w lint && pnpm -w test`).
4. Update generated docs if you touch public APIs.
5. Open a pull request describing the change, test coverage, and any follow-up TODOs.
