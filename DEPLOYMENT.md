# Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel with the following setup:

### Build Configuration

- **Frontend**: React app built with Vite
- **Backend**: Node.js API with Express
- **Build Output**: `client/dist` directory

### Key Fixes Applied

1. **Vite Configuration**: Added explicit build output directory configuration
2. **Vercel Configuration**: Updated `vercel.json` with proper build settings
3. **Environment Variables**: Created `.env` file with production settings
4. **Build Scripts**: Enhanced build process with proper dependency installation
5. **Error Handling**: Added robust error handling in API layer

### Deployment Steps

1. **Ensure all dependencies are installed:**
   ```bash
   npm install
   ```

2. **Test the build locally:**
   ```bash
   npm run vercel-build
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

### Environment Variables

The following environment variables are configured for production:

- `NODE_ENV=production`
- `CLIENT_ORIGIN=https://your-domain.vercel.app`
- `PAYPAL_ENV=sandbox` (change to 'live' for production)

### Build Process

The build process:
1. Installs client dependencies
2. Builds the React app with Vite
3. Outputs to `client/dist` directory
4. Vercel serves static files from this directory

### Troubleshooting

If you encounter build failures:

1. **Check the build output directory**: Ensure `client/dist` is created
2. **Verify dependencies**: Run `npm install` in both root and client directories
3. **Check environment variables**: Ensure `.env` file exists with proper values
4. **Test locally**: Run `npm run vercel-build` to test the build process

### File Structure

```
├── client/           # React frontend
│   ├── dist/        # Build output (created during build)
│   ├── src/         # Source code
│   └── package.json # Frontend dependencies
├── server/           # Node.js backend
│   └── src/         # Server source code
├── api/              # Vercel API functions
├── vercel.json       # Vercel configuration
├── .env              # Environment variables
└── package.json      # Root dependencies
```

### Notes

- The `client/dist` directory is automatically created during the build process
- Source files are excluded from deployment via `.vercelignore`
- The API routes are properly configured to handle both frontend and backend requests