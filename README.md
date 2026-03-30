# Vincent OAuth Onboarding Demo

Minimal React app proving a third-party app can integrate Vincent with **zero changes to Vincent**. OAuth login, check balance, place trades — all via existing Vincent endpoints. For complete Vincent API check out: https://heyvincent.ai/docs

## What This Proves

- OAuth PKCE login works for third-party apps
- `vot_` token used directly as Bearer credential
- Browser calls Vincent API directly (no proxy in trading path)
- Balance check + trade placement = full read/write cycle
- **Zero Vincent code changes needed**

## Setup

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## How It Works

### 1. Register App

First visit, click **Register App**. Calls:

```
POST /api/oauth/public/register
Body: { client_name: "Consumer Demo", redirect_uris: ["http://localhost:5173/callback"] }
Response: { client_id: "vcl_..." }
```

`client_id` is stored in localStorage so you only register once.

### 2. OAuth PKCE Login

Click **Connect Vincent**. The app:

1. Generates `code_verifier` + `code_challenge` (SHA-256, base64url)
2. Redirects browser to:
   ```
   https://heyvincent.ai/api/oauth/public/authorize?
     client_id=vcl_...
     &response_type=code
     &redirect_uri=http://localhost:5173/callback
     &scope=all
     &resource=https://heyvincent.ai
     &code_challenge=...
     &code_challenge_method=S256
   ```
3. User logs in via Stytch, wallets auto-created, clicks Allow
4. Redirected back to `/callback?code=...`

### 3. Token Exchange

The callback page exchanges the auth code:

```
POST /api/oauth/public/token
Body: { grant_type: "authorization_code", code, code_verifier, client_id, redirect_uri }
Response: { access_token: "vot_...", refresh_token: "..." }
```

Token stored in React state (memory only — lost on refresh, intentional for demo).

### 4. Dashboard

With the `vot_` token, the app calls Vincent directly:

| Action | Endpoint | Method |
|---|---|---|
| Check balance | `/api/skills/polymarket/balance` | GET |
| Search markets | `/api/skills/polymarket/markets?query=Bitcoin` | GET |
| Get market detail | `/api/skills/polymarket/market/:conditionId` | GET |
| Place bet | `/api/skills/polymarket/bet` | POST |

All requests use `Authorization: Bearer vot_...` header.

## CORS

The Vite dev server proxies `/api/*` to `https://heyvincent.ai` to avoid CORS issues in development. OAuth redirects go directly to Vincent (browser navigation, no CORS). In production, Vincent would need CORS headers or the app would need a thin proxy.

## Vincent OAuth Discovery

Endpoints can be discovered via:
```
GET https://heyvincent.ai/.well-known/oauth-authorization-server
```

## File Structure

```
src/
  main.tsx          — React entry point
  App.tsx           — Router: / (connect), /callback (OAuth), /app (dashboard)
  oauth.ts          — PKCE helpers, register, authorize, token exchange
  api.ts            — Fetch wrapper with Bearer token
  pages/
    Connect.tsx     — Register app + "Connect Vincent" button
    Callback.tsx    — Exchange auth code for vot_ token
    Dashboard.tsx   — Balance display + market search + place bet
```

## What Consumer App Would Build on Top

This demo covers the minimum. A full app would add:

- Secure token storage (keychain/encrypted storage)
- Token refresh before 1hr expiry (`POST /api/oauth/public/token` with `grant_type=refresh_token`)
- Full Polymarket UI (market browsing, order book, positions, trade history)
- HyperLiquid integration (same pattern, `/api/skills/hyperliquid/*`)
- EVM wallet features (swaps, bridges, transfers via `/api/skills/evm-wallet/*`)
- Trading strategies and rules via the trading engine endpoints
