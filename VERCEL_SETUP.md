# Vercel Deployment Setup Guide

## Quick Deployment

Your Vercel API token: `l8tss64IftLAy6Mda9nojKuc`

### Option 1: Automated Deployment (Recommended)

```bash
# Run the automated deployment script
npm run deploy
```

### Option 2: Manual Vercel CLI Deployment

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel with your token
vercel login

# Deploy to production
vercel --prod
```

### Option 3: Vercel Web Interface

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import this repository or upload the files
4. Configure the project settings:
   - **Framework Preset:** Other
   - **Root Directory:** `.` (root)
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `client/dist`
   - **Install Command:** `npm install`

## Environment Variables Setup

After deployment, you need to set these environment variables in your Vercel dashboard:

### Required Variables:
- `SESSION_SECRET`: A long, random string for session security
- `PAYPAL_ENV`: `sandbox` or `live` (start with sandbox for testing)
- `PAYPAL_NVP_VERSION`: `204.0` (current PayPal NVP API version)
- `LOG_BUFFER_SIZE`: `300` (number of logs to keep in memory)

### Optional Variables:
- `CLIENT_ORIGIN`: Your Vercel app URL (will be auto-detected)
- `NVP_SANDBOX_URL`: Custom PayPal sandbox endpoint (uses default if not set)
- `NVP_LIVE_URL`: Custom PayPal live endpoint (uses default if not set)

## Setting Environment Variables via CLI

```bash
# Set required environment variables
vercel env add SESSION_SECRET production
# Enter: your-super-secret-session-key-change-this-in-production-123456789

vercel env add PAYPAL_ENV production
# Enter: sandbox

vercel env add PAYPAL_NVP_VERSION production
# Enter: 204.0

vercel env add LOG_BUFFER_SIZE production
# Enter: 300
```

## After Deployment

1. **Get your app URL** from the Vercel dashboard
2. **Update CLIENT_ORIGIN** environment variable with your actual domain
3. **Test the application**:
   - Visit your Vercel URL
   - Enter your PayPal API credentials (username, password, signature)
   - Test API calls like GetBalance
   - Monitor real-time logs

## PayPal API Credentials

To use this dashboard, you'll need PayPal NVP API credentials:

### Sandbox Credentials (for testing):
1. Go to [PayPal Developer](https://developer.paypal.com)
2. Create a sandbox application
3. Get your API Username, Password, and Signature

### Live Credentials (for production):
1. Go to [PayPal Developer](https://developer.paypal.com)
2. Create a live application
3. Get your API Username, Password, and Signature

## Features

✅ **Real-time API monitoring** with Server-Sent Events  
✅ **Enhanced error handling** and loading states  
✅ **PayPal NVP API integration** (GetBalance, TransactionSearch, etc.)  
✅ **Session management** with iron-session  
✅ **Rate limiting** and security headers  
✅ **Live event streaming** and logging  

## Troubleshooting

### Common Issues:

1. **"Missing PayPal API credentials"**
   - Make sure you've entered and saved your PayPal credentials in the app

2. **CORS errors**
   - Check that CLIENT_ORIGIN environment variable matches your domain

3. **Session issues**
   - Ensure SESSION_SECRET is set and is a long, random string

4. **API timeouts**
   - Check your PayPal credentials are correct
   - Verify you're using the right environment (sandbox vs live)

### Useful Commands:

```bash
vercel --prod          # Deploy to production
vercel dev            # Run locally with Vercel environment
vercel logs           # View deployment logs
vercel env ls         # List environment variables
vercel domains        # Manage custom domains
```

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test with PayPal sandbox credentials first
4. Check the browser console for detailed error messages