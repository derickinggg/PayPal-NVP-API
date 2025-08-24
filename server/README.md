# Server (Vercel)

This folder contains the Express app wrapped for Vercel.

- Function entry: `api/index.js`
- Express app: `src/index.js`

Set these environment variables in Vercel:

- CLIENT_ORIGIN: your frontend URL
- SESSION_SECRET: long random string
- PAYPAL_ENV: sandbox or live
- PAYPAL_NVP_VERSION: usually 204.0
- LOG_BUFFER_SIZE: e.g. 300

No database is used; sessions are cookie-based via iron-session.