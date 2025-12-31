# Quick Start: Google Authentication

## Get Your Google Client ID (5 minutes)

### Step 1: Create Google Cloud Project
1. Visit: https://console.cloud.google.com/
2. Click "Select a project" → "NEW PROJECT"
3. Name: "Vera Protocol"
4. Click "CREATE"

### Step 2: Enable Google OAuth
1. In left sidebar: **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**
3. If prompted, configure consent screen first:
   - User Type: **External**
   - App name: **Vera Protocol**
   - User support email: **your@email.com**
   - Developer contact: **your@email.com**
   - Click **SAVE AND CONTINUE** (skip scopes and test users)

### Step 3: Create OAuth Client ID
1. Application type: **Web application**
2. Name: **Vera Protocol Web Client**
3. Authorized JavaScript origins:
   - Click **+ ADD URI**
   - Add: `http://localhost:5173`
4. Authorized redirect URIs:
   - Click **+ ADD URI**  
   - Add: `http://localhost:5173`
5. Click **CREATE**
6. **COPY the Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)

### Step 4: Add to Environment Variables
1. Open `frontend/.env` file (create if doesn't exist)
2. Add this line:
```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

### Step 5: Test It!
```bash
cd frontend
npm run dev
```

Visit http://localhost:5173 and click **"Sign In"**

## That's It!

You should see:
1. Google login button
2. After login → Role selection (Client/Freelancer)
3. User menu with your profile picture
4. Sign out functionality

## Need Help?

**Common Issues:**

❌ **"popup_closed_by_user"**
- User closed the Google login popup
- Just try again

❌ **"redirect_uri_mismatch"**  
- Check your authorized URIs in Google Console
- Must be exactly `http://localhost:5173`

❌ **Login button not working**
- Check VITE_GOOGLE_CLIENT_ID in .env
- Restart dev server after changing .env
- Clear browser cache

**Still stuck?** Check `GOOGLE_AUTH_SETUP.md` for detailed troubleshooting.

## Features

✅ Login with Google  
✅ Select role (Client/Freelancer)  
✅ User profile menu  
✅ Secure logout  
✅ Persistent sessions  
✅ Works alongside wallet connection  

Enjoy Vera Protocol! 🚀
