# AGENTS.md

## Stack
Monorepo (npm workspaces) of Vite micro-frontends + `shell` host using
`@originjs/vite-plugin-federation`. Each game is a remote workspace exposing `./App`.
Federation remotes are built and copied into `shell/dist/_remotes/*` by
`npm run build` (root script) via `scripts/copy-remotes.js`.

- Ports: blackblast 4173, build_cat 4174, tictactoe 4175, connect_four 4176, memory 4177, battleship 4178.
- A new game needs: workspace with `package.json`/`vite.config.ts` (federation `name`,
  exposes `./App`, preview strictPort+cors) wired into `shell/vite.config.ts` (REMOTE_PORTS),
  `shell/src/remote-declarations.d.ts`, `shell/src/shared/config/games.ts`, `scripts/copy-remotes.js`,
  root `package.json` (workspaces + build/dev/preview scripts).
- Run `npm run build` (root) to verify everything, then `git push origin main`.

## Vercel deploy warning (IMPORTANT)
The Vercel project "shell" has Root Directory = `shell`. Vercel **cancels** (Canceled, 0ms, no logs)
any git push whose commit touches NO files under `shell/` (e.g. a commit changing only
`battleship/*` or another game workspace). This happens before `ignoreCommand` is consulted.
Workaround: when a commit only changes game workspace files, also include a small real change
under `shell/` (or pull the shell change into the same commit) so Vercel builds the full tree —
the full checkout at that commit still contains the remote's changes.

`shell/vercel.json` (project root config): `buildCommand: npm run build`,
`installCommand: npm install --include=dev`, `outputDirectory: dist`,
`ignoreCommand: node -e "process.exit(1)"` (always build), rewrites `/(.*)` → `/index.html`.
Deep links depend on these rewrites.

## Verification
- `npm run build` must be green and copy all remotes into `shell/dist/_remotes/`.
- After deploy, check `https://shell-git-main-wswfws-projects.vercel.app/_remotes/<name>/assets/remoteEntry.js`
  (deployment is SSO-protected; plain curl gets blocked).