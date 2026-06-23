# SYNC · Mini Program (Taro + React)

WeChat mini program (primary target) and optional H5 build for **SYNC** — discover electronic music festivals, select activities, plan with AI tools (travel guides, itineraries, buddy posts), and track per-event prep on the home screen.

The UI was migrated from a Vite mobile app to **Taro 4 + React**. Styles use **Sass**: global tokens in `src/styles/`, component-level `.scss` beside pages and components.

## Product overview

Full feature map (Chinese): [docs/PRODUCT.md](docs/PRODUCT.md). User stories: [docs/Q1-USER-STORIES.md](docs/Q1-USER-STORIES.md).

| Area | Behavior |
|------|----------|
| **Positioning** | Free EDM festival info + public buddy-post feed; recruit search via AI on event detail (no ticketing, no in-app contact) |
| **Activity selection** | Entering activity detail or binding an activity silently records interest via `POST /activities/:legacyId/register` — no separate “sign up” button |
| **Home** | Featured events, countdown, “my next event” with Festival Plan progress, post-reply deep links, dual CTA (search festivals / find crew), new-user onboarding |
| **Events tab** | List, calendar, and catalog artists sub-tabs; **list tab search filter** for festival lookup |
| **Event detail** | Lineup, buddy-post feed with filters/search, AI travel guide card, Festival Plan checklist, lineup-unpublished subscribe |
| **Subpackages** | Exclusive itinerary, my itinerary, personality test (Soul DJ), travel guide detail, profile activities/posts, settings, notifications |
| **Profile** | Account summary, selected activities, posts, settings, legal docs, account-deletion guidance |
| **Festival Plan** | Three-task prep loop: travel guide → itinerary → buddy post; progress on home and event detail (`domains/festival-plan/`) |

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Taro 4, React 18 |
| Language | TypeScript |
| Styling | Sass (BEM with `s-` prefix) |
| Data | React Query–style hooks (`hooks/sync/`), Zustand where needed |
| API | REST to [sync-app-backend](../sync-app-backend); legacy AI chat WebSocket disabled by default |
| Contracts | `@sync/*-contracts` aliases → backend `src/shared/` |

## Prerequisites

- Node.js **≥ 18.18**
- [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) for mini program builds
- Running backend: see [sync-app-backend/README.md](../sync-app-backend/README.md)

## Quick start

```bash
cd sync-app
npm install

# Terminal 1 — backend
cd ../sync-app-backend && npm run dev:all

# Terminal 2 — mini program (development mode → local .env)
npm run dev:weapp
```

Open **WeChat DevTools** and import the **`sync-app` repo root** (folder with `project.config.json`).  
`miniprogramRoot` points to `dist-weapp/` — run `dev:weapp` first so `dist-weapp/app.json` exists.

Enable **“Do not verify valid domain names”** for local API / WebSocket.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:weapp` | Watch build for WeChat (`--mode development`, `.env`) |
| `npm run prd:weapp` | Watch build with production env (`.env.production`) |
| `npm run build:weapp` | Production mini program build |
| `npm run build:weapp:size` | Build + bundle size check |
| `npm run check` | verify:bundle + typecheck + lint + format + tests |
| `npm run dev:h5` | H5 dev server (debug only, not a release target) |
| `npm run build:h5` | H5 production build → `dist-h5/` |

**Release target is the WeChat mini program.** H5 is for local debugging; performance and feature parity are not guaranteed.

## Environment

| Mode | Config file | Backend |
|------|-------------|---------|
| `dev:weapp` | `.env` | Local Nest `http://127.0.0.1:3000/api` |
| `build:weapp` / `prd:weapp` | `.env.production` | CloudBase Cloud Run (`callContainer` / `connectContainer`) |

### Local development (`.env`)

```env
TARO_APP_API_BASE_URL=http://127.0.0.1:3000/api
TARO_APP_AI_CHAT_WS_URL=ws://127.0.0.1:3000/api/ai/chat/ws
```

Do **not** set `TARO_APP_CLOUD_RUN_SERVICE` when pointing at local Nest. For device debugging, replace `127.0.0.1` with your LAN IP.

### Production (`.env.production`)

```env
TARO_APP_CLOUDBASE_ENV_ID=sync-prd-xxxx
TARO_APP_CLOUD_RUN_SERVICE=sync-backend-prd-xxxx
TARO_APP_API_BASE_URL=https://sync-backend-prd-xxxx.sh.run.tcloudbase.com/api
TARO_APP_AI_CHAT_WS_URL=wss://sync-backend-prd-xxxx.sh.run.tcloudbase.com/api/ai/chat/ws
```

REST uses `wx.cloud.callContainer`; AI WebSocket uses `wx.cloud.connectContainer` ([`src/utils/cloudRunTransport.ts`](src/utils/cloudRunTransport.ts)). Requires base library ≥ 2.23.0. No need to whitelist `sh.run.tcloudbase.com` as request/socket domain.

If `TARO_APP_API_BASE_URL` is unset, the app uses mocks and does not call the backend.

## WeChat DevTools workflow

1. Run `npm run dev:weapp` (watch mode).
2. Import project directory: **`sync-app/`** (not an empty `dist-weapp/` folder).
3. Confirm `dist-weapp/app.json` exists, then compile in DevTools.
4. For backend login: ensure `WECHAT_MINI_APP_ID` / `SECRET` are configured on the backend.

## Project structure

```
sync-app/
├── config/                 # Taro config (weapp, h5)
├── project.config.json     # WeChat project → miniprogramRoot: dist-weapp/
├── src/
│   ├── app.tsx / app.config.ts
│   ├── pages/              # Tab pages (home, events, ai, profile)
│   ├── packageEvent/       # Event detail subpackage
│   ├── packageAi/          # AI assistant subpackage
│   ├── packageProfile/     # Profile / settings subpackages
│   ├── components/         # Shared UI
│   ├── domains/            # Feature domains (festival-plan, travel-guide, …)
│   ├── hooks/sync/         # REST data hooks
│   ├── api/sync/           # REST clients
│   ├── utils/              # route, auth, caches
│   └── styles/               # Global SCSS tokens & utilities
├── test/unit/              # Vitest unit tests
└── docs/                   # API contract, architecture notes
```

Key utilities:

- [`src/utils/route.ts`](src/utils/route.ts) — navigation helpers (`goEventDetail`, tab switches)
- [`src/domains/activity-scope/`](src/domains/activity-scope/) — bind activity + silent selection
- [`src/utils/registerActivityOnSelect.ts`](src/utils/registerActivityOnSelect.ts) — auto `POST /register` on bind

## Styling conventions

- **Prefix** `s-` for UI classes; BEM: `block__element--modifier`
- **Globals**: `src/styles/_variables.scss`, `src/styles/globals.scss`, `src/app.scss`
- **PostCSS**: autoprefixer only (`postcss.config.js`)
- WeChat: `@tarojs/plugin-html` enabled for weapp only (`config/index.ts`)

### Config files — do not import `@tarojs/taro`

In `app.config.ts` and `pages/**/index.config.ts`, export plain objects — do not use `defineAppConfig` from `@tarojs/taro` (causes `window is not defined` during config compile).

### Fonts

Optional Barlow font: place `Barlow-Regular_2.ttf` in `src/static/fonts/` and add `@font-face` in global SCSS. See `src/static/fonts/README.md`.

## Shared contracts with backend

TypeScript aliases resolve to backend shared types (do not duplicate in `types/backend.ts`):

| Alias | Backend source |
|-------|----------------|
| `@sync/chat-contracts` | `sync-app-backend/src/shared/chat/` |
| `@sync/festival-plan-contracts` | `sync-app-backend/src/shared/festival-plan/` |
| `@sync/itinerary-contracts` | `sync-app-backend/src/shared/itinerary/` |
| `@sync/travel-plan-contracts` | `sync-app-backend/src/shared/travel-plan/` |
| `@sync/travel-guide-contracts` | `sync-app-backend/src/shared/travel-guide/` |
| `@sync/partner-contracts` | `sync-app-backend/src/shared/partner/` |

After changing contracts: run `npm run check` in both repos.

## Quality assurance

```bash
npm run check
```

CI (`.github/workflows/ci.yml`) runs `check` + `build:weapp:size` on PRs and `main` (checks out sibling `sync-app-backend` for contract paths).

Husky + lint-staged on commit.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/PRODUCT.md](docs/PRODUCT.md) | Product strategy, IA, compliance & code index |
| [docs/Q2-USER-STORIES.md](docs/Q2-USER-STORIES.md) | **Q2 roadmap**：AI 查节 / 找队、招募改版、准备 Tab 瘦身 |
| [docs/Q1-USER-STORIES.md](docs/Q1-USER-STORIES.md) | Q1 user stories (completed baseline) |
| [docs/API.md](docs/API.md) | REST / WebSocket contract |
| [docs/DATA-LAYER.md](docs/DATA-LAYER.md) | Hooks, caches, auth |
| [docs/COMPONENT-ARCHITECTURE.md](docs/COMPONENT-ARCHITECTURE.md) | UI layering |
| [docs/FRONTEND-REFACTOR-CHECKLIST.md](docs/FRONTEND-REFACTOR-CHECKLIST.md) | Implementation checklist |
| [docs/WECHAT-E2E.md](docs/WECHAT-E2E.md) | Mini program E2E notes |
| [docs/BUNDLE-SIZE.md](docs/BUNDLE-SIZE.md) | WeChat package size limits |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Branch / PR workflow |
| [../sync-app-backend/docs/ARCHITECTURE.md](../sync-app-backend/docs/ARCHITECTURE.md) | Backend architecture |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Monorepo workspace guide |

## H5 (optional)

Config: `config/h5.config.ts`. Dev server proxies `/api` to `localhost:3000`. Output: `dist-h5/`. Not a production target.

## References

- [Taro documentation](https://docs.taro.zone/)
- [WeChat mini program docs](https://developers.weixin.qq.com/miniprogram/dev/framework/)

## License

Private project.
