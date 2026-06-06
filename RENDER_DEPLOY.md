# Render Deployment Guide — Konosuba Bot Web Dashboard

## What you get

A single Render **Web Service** that:
- Serves the React frontend (built by Vite, statically embedded in Express)
- Handles all `/api/…` routes (auth, profile, leaderboard, Pokémon, cards, shop, stats)
- Connects to your existing MongoDB Atlas cluster

---

## Prerequisites

| Requirement | Detail |
|---|---|
| MongoDB URI | Your Atlas connection string (same as the bot uses) |
| JWT secret | Any strong random string (e.g. `openssl rand -hex 32`) |
| Render account | [render.com](https://render.com) — Free tier is fine |

---

## Step 1 — Create a new Web Service on Render

1. Go to **dashboard.render.com → New → Web Service**
2. Push the ZIP contents to a **private GitHub repo**, then connect that repo
3. Alternatively use Render's **Manual Deploy** with a public Git URL

### Repo settings
- **Branch**: `main`
- **Root Directory**: *(leave blank — `render.yaml` is at the repo root)*

---

## Step 2 — Environment Variables

In the Render dashboard → **Environment** tab, add these:

| Key | Value | Notes |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://…` | Your Atlas connection string |
| `JWT_SECRET` | `your-secret-here` | Use `openssl rand -hex 32` to generate |
| `NODE_ENV` | `production` | Already in render.yaml |
| `PORT` | `10000` | Already in render.yaml |
| `BOT_API_URL` | *(your bot's URL, or blank)* | If blank, OTP not sent via WhatsApp |

> **Never put your MongoDB URI or JWT secret in render.yaml or commit them to Git.**

---

## Step 3 — Deploy

Render runs the build command from `render.yaml`:

```bash
npm install -g pnpm@9
pnpm install --frozen-lockfile
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/konosuba-bot exec vite build --config vite.config.prod.ts
pnpm --filter @workspace/api-server run build
```

Then starts with:
```bash
node artifacts/api-server/dist/index.mjs
```

Build time: ~3–5 minutes on first deploy.

---

## Step 4 — Verify

Visit your Render URL (e.g. `https://konosuba-bot.onrender.com`):

| Test | Expected |
|---|---|
| `GET /api/healthz` | `{"status":"ok"}` |
| `GET /api/stats` | `{"userCount":83,"cardCount":39,…}` |
| `GET /api/leaderboard` | Array of ranked users |
| Frontend `/` | Blue KONOSUBA hero page |
| Frontend `/login` | WhatsApp OTP input |

---

## WhatsApp OTP

Without `BOT_API_URL` the OTP is returned in the JSON response as `devOtp` (dev only — `null` in production).  
Set `BOT_API_URL` to your bot's endpoint to enable real WhatsApp delivery.  
The server posts `{ phone, otp }` to `{BOT_API_URL}/send-otp`.

---

## MongoDB Atlas IP Whitelist

Render free tier uses dynamic outbound IPs.  
In Atlas → **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).  
For production security upgrade to Render Starter and use static IPs.

---

## Free tier note

Render free web services sleep after 15 min of inactivity.  
Use [UptimeRobot](https://uptimerobot.com) to ping `/api/healthz` every 14 min to keep it awake, or upgrade to Starter ($7/mo).

---

## Updating

Push commits to your GitHub repo — Render auto-deploys on every push to `main`.
