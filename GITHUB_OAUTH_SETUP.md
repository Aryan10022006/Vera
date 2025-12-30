# GitHub OAuth Setup Guide for Vera Protocol

## Step 1: Create GitHub OAuth App

1. Go to **GitHub Settings**: https://github.com/settings/developers
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"** button

## Step 2: Fill in Application Details

```
Application name: Vera Protocol Local
Homepage URL: http://localhost:3000
Application description: AI-powered freelance escrow with automatic verification
Authorization callback URL: http://localhost:3000/auth/github/callback
```

4. Click **"Register application"**

## Step 3: Get Your Credentials

After creating the app, you'll see:

1. **Client ID**: A string like `Iv1.a1b2c3d4e5f6g7h8`
   - Copy this immediately

2. **Client Secret**: Click "Generate a new client secret"
   - Copy the secret immediately (you won't see it again!)
   - Looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

## Step 4: Add to Backend .env

Open `backend-agents/.env` and update:

```env
GITHUB_OAUTH_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_OAUTH_CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
GITHUB_OAUTH_REDIRECT_URI=http://localhost:3000/auth/github/callback
```

## Step 5: For Production Deployment

When deploying to production (e.g., Vercel):

1. Create a **second OAuth App** for production
2. Use your production URLs:
   ```
   Homepage URL: https://your-app.vercel.app
   Authorization callback URL: https://your-app.vercel.app/auth/github/callback
   ```

3. Add production credentials to your deployment environment variables

## Testing

1. Start backend: `cd backend-agents && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:3000
4. Connect wallet
5. Click "Connect GitHub" button
6. Authorize the app
7. You should see your GitHub profile connected!

## Features Enabled

Once connected, users can:
- ✅ Select repositories for project verification
- ✅ Automatic code quality scanning
- ✅ Real-time GitHub webhook integration  
- ✅ Faster milestone approvals
- ✅ Repository integrity checks

## Security Notes

- Never commit `.env` files to git
- Client secrets should be kept secure
- Each user gets their own OAuth token
- Tokens are stored server-side only
- Users can disconnect anytime

## Troubleshooting

**Error: "redirect_uri_mismatch"**
- Make sure the callback URL in GitHub OAuth App settings exactly matches your configuration

**Error: "Bad verification code"**
- The OAuth flow timed out, try again

**Can't connect GitHub**
- Check that backend server is running on port 3001
- Verify GITHUB_OAUTH_* variables are set in backend .env
