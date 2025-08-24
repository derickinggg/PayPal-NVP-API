# PayPal NVP Dashboard

A simple full-stack app to test PayPal Classic NVP API with temporary in-session credentials, real-time request/response logs, and IPN verification.

- Backend: Node.js + Express
- Frontend: React (Vite)
- Sessions: `iron-session` (cookies)
- Logging: In-memory + Server-Sent Events (SSE)
- Webhook: PayPal IPN verification (sandbox/live)
- Security: Helmet, rate limits, CORS, HTTPS option

## Prerequisites

- Node.js 18+ (22+ recommended)
- npm

## Quick start (local)

1. Copy env example and adjust as needed:

```bash
cp .env.example server/.env
# Edit server/.env to set SESSION_SECRET, CLIENT_ORIGIN, PAYPAL_ENV
```

2. Run dev servers (API on 4000, UI on 5173):

```bash
npm run dev
```

3. Open the UI:

- http://localhost:5173

4. Enter your NVP API credentials (from PayPal sandbox or live):

- username, password, signature
- choose environment: sandbox or live

5. Use the dashboard to call:

- GetBalance
- TransactionSearch (set filters)
- GetTransactionDetails (by TRANSACTIONID)
- RefundTransaction (Full or Partial)

Logs stream in real time in the Logs panel.

### HTTPS locally (optional)

1. Generate self-signed certs:

```bash
mkdir -p server/certs
openssl req -x509 -newkey rsa:2048 -sha256 -days 365 -nodes -keyout server/certs/localhost-key.pem -out server/certs/localhost-cert.pem -subj "/CN=localhost"
```

2. In `server/.env` set:

```
HTTPS=true
SSL_KEY_PATH=certs/localhost-key.pem
SSL_CERT_PATH=certs/localhost-cert.pem
```

3. Restart `npm run dev` and open https://localhost:4000 (API) and http://localhost:5173 (UI). The UI proxies `/api` to 4000.

Note: The frontend includes a CSP "upgrade-insecure-requests" to help mixed content when you enable HTTPS for the API.

## PayPal IPN

- Configure your PayPal sandbox account IPN listener URL to: `http://localhost:4000/api/webhooks/ipn` (or your deployed URL).
- The server verifies IPN messages against `ipnpb.sandbox.paypal.com` or `ipnpb.paypal.com` depending on env (stored in session or `PAYPAL_ENV`).
- Verification results are logged in the stream.

## Environment variables (`server/.env`)

Key settings:

- PORT=4000
- NODE_ENV=development
- HTTPS=false
- SESSION_SECRET=change-me
- CLIENT_ORIGIN=http://localhost:5173
- PAYPAL_ENV=sandbox
- PAYPAL_NVP_VERSION=204.0

Advanced overrides available for NVP and IPN endpoints.

## Deploy to Vercel

This project includes a serverless wrapper for the Express app.

1. Project structure on Vercel

- API entry: `server/api/index.js` (Vercel function)
- Static frontend: build and deploy `/client` separately or via another project

2. Steps:

- Create a new Vercel project, root set to `server` directory
- Add environment variables in Vercel (same as `server/.env`), specify `CLIENT_ORIGIN` pointing to your frontend URL
- Deploy

3. Frontend deployment:

- Deploy `/client` to Vercel/Netlify/Static hosting
- Configure `VITE` proxy or point client to your deployed API base URL

Alternatively, you can deploy both under a single Vercel monorepo using two projects: one for `server` and one for `client`.

## API summary

- POST `/api/session/credentials` { username,password,signature, env? }
- DELETE `/api/session/credentials`
- GET `/api/logs` returns recent logs
- GET `/api/logs/stream` SSE live logs
- POST `/api/nvp/get-balance`
- POST `/api/nvp/transaction-search` pass NVP filters
- POST `/api/nvp/get-transaction-details` { TRANSACTIONID }
- POST `/api/nvp/refund-transaction` { TRANSACTIONID, REFUNDTYPE, AMT?, CURRENCYCODE? }
- POST `/api/webhooks/ipn` PayPal IPN endpoint

## Notes

- Credentials are never persisted; they live only in the encrypted session cookie.
- Logs are in-memory only. For production durability, wire to a data store.
- Use PayPal Sandbox for testing. Some calls require appropriate account setup and balances.