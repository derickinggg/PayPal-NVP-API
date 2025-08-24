# PayPal NVP Dashboard - Vercel Deployment Guide

## Quick Deploy Options

### Option 1: Vercel CLI (Fastest)
```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

### Option 2: Vercel Web Interface
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository or upload files
4. Configure:
   - **Framework:** Other
   - **Root Directory:** `.` (root)
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `client/dist`
   - **Install Command:** `npm install`

### Option 3: Git Integration
1. Push code to GitHub/GitLab/Bitbucket
2. Connect repository to Vercel
3. Auto-deploy on every push

## Environment Variables (Optional)
Add these in Vercel dashboard if needed:
- `SESSION_SECRET`: Long random string for session security
- `NODE_ENV`: `production`
- `PAYPAL_ENV`: `sandbox` or `live`

## Project Structure
```
/
├── api/index.js          # Vercel serverless function
├── client/               # React frontend
├── server/               # Express backend
├── vercel.json          # Vercel configuration
└── package.json         # Root package.json
```

## Features Included
✅ Real-time API monitoring with Server-Sent Events  
✅ Enhanced error handling and loading states  
✅ PayPal NVP API integration  
✅ Session management with iron-session  
✅ Rate limiting and security headers  
✅ Live event streaming and logging  

## After Deployment
1. Visit your Vercel URL
2. Enter PayPal API credentials (sandbox/live)
3. Test API calls and monitor in real-time
4. Check browser console for detailed API logs

## Local Development
```bash
npm run dev    # Start both client and server
npm run client # Start only client (port 5173)
npm run server # Start only server (port 4000)
```