# Shadow Garden Bot — Web Dashboard

A full-featured web dashboard for the Shadow Garden WhatsApp RPG Bot. Connects to the same MongoDB as the bot and provides pages for home, shop, leaderboard, pokemon (PokeAPI), login/signup (WhatsApp OTP), profile, and cards.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/konosuba-bot run dev` — run the frontend (Vite dev server)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `MONGO_URI`, `JWT_SECRET`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + Mongoose (MongoDB)
- Frontend: React 18 + Vite + Tailwind CSS v4 + shadcn/ui
- Auth: JWT (30-day) stored in localStorage; WhatsApp OTP flow
- DB: MongoDB Atlas (same cluster as the WhatsApp bot)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/` — generated React Query hooks
- `lib/api-zod/src/` — generated Zod schemas
- `artifacts/api-server/src/lib/mongodb.ts` — MongoDB connection + all Mongoose models
- `artifacts/api-server/src/routes/` — all route handlers (auth, profile, leaderboard, pokemon, cards, shop, stats)
- `artifacts/api-server/src/middlewares/auth.ts` — JWT middleware
- `artifacts/konosuba-bot/src/contexts/AuthContext.tsx` — frontend auth context
- `artifacts/konosuba-bot/src/pages/` — all 8 pages

## Architecture decisions

- MongoDB directly (not Drizzle/PostgreSQL) — shares the bot's existing Atlas cluster
- JWT in localStorage (not cookies) — simpler for Vite SPA; bot auth token flow
- OTP sent via bot if `BOT_API_URL` is set; otherwise `devOtp` returned in API response for dev
- All API routes under `/api/` prefix; served via Replit's shared proxy at localhost:80
- Orval codegen post-processes `lib/api-zod/src/index.ts` to strip duplicate type export (see MEMORY.md)

## Product

- Home: dark hero page with live bot stats (users, cards, groups, pokemon)
- Login/Signup: 2-step WhatsApp OTP authentication
- Profile: circular avatar with frame, wallet/bank/level/xp stats, tabs (Overview/Deck/Inventory/Pokemon)
- Leaderboard: XP and Rich List with podium top-3 display using real MongoDB data
- Pokemon: user party + global Pokedex browser via PokeAPI
- Cards: full card collection browser with tier/series filtering (real anime cards from DB)
- Shop: 26 RPG items (weapons/armor/consumables/tools/accessories/banking notes)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT use `console.log` in api-server — use `req.log` in route handlers, `logger` elsewhere
- MongoDB phone numbers: strip @s.whatsapp.net and :N suffix before querying
- Run codegen after any OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`
- The orval codegen post-process step in `lib/api-spec/package.json` must not be removed

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `.agents/memory/shadow-garden-stack.md` for key architecture decisions
