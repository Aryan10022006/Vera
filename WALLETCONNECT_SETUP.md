# 🔗 WalletConnect Setup Guide

## Quick Setup (5 minutes)

### Step 1: Go to WalletConnect Cloud
Open your browser and go to: **https://cloud.walletconnect.com**

### Step 2: Sign In
- Click **"Sign In"** or **"Get Started"**
- Choose to sign in with:
  - **GitHub** (recommended - fastest)
  - **Email**
  - **Google**

### Step 3: Create a New Project
1. After signing in, you'll see the dashboard
2. Click the **"+ New Project"** or **"Create Project"** button
3. Fill in the project details:
   - **Project Name**: `Vera Protocol`
   - **Homepage URL** (optional): You can leave blank or add `http://localhost:5173`

### Step 4: Get Your Project ID
1. After creating the project, you'll see the **Project Details** page
2. Look for **"Project ID"** - it will look something like:
   ```
   abc123def456ghi789jkl012mno345pq
   ```
3. Click the **copy icon** next to the Project ID

### Step 5: Add to Your .env File
1. Open `frontend/.env` file
2. Find the line:
   ```
   VITE_WALLETCONNECT_PROJECT_ID=
   ```
3. Paste your Project ID after the `=`:
   ```
   VITE_WALLETCONNECT_PROJECT_ID=abc123def456ghi789jkl012mno345pq
   ```
4. **Save the file**

### Step 6: Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

---

## ✅ Verification

Once you've added the Project ID:
1. The app should start without errors
2. You can connect crypto wallets (MetaMask, Rainbow, etc.)
3. Check the browser console - no WalletConnect errors

---

## 🎯 What You'll See in WalletConnect Dashboard

After users start connecting wallets, you'll see:
- Number of wallet connections
- Types of wallets being used
- Connection analytics
- Network traffic

---

## 🔒 Security Notes

- ✅ Project ID is **safe to expose** in frontend code
- ✅ No sensitive keys needed
- ✅ Free tier is enough for development
- ✅ Rate limits: 1M requests/month (very generous)

---

## 💡 Quick Video Guide

If you prefer video, WalletConnect has a 2-minute setup guide at:
https://docs.walletconnect.com/cloud/relay

---

## ❓ Troubleshooting

**Issue**: "Project ID is invalid"
- Make sure you copied the entire ID
- No spaces before/after the ID
- Restart dev server after adding it

**Issue**: "Rate limit exceeded"
- You're on free tier (1M req/month)
- Upgrade to paid plan if needed

**Issue**: Can't sign in to WalletConnect Cloud
- Try a different sign-in method
- Clear browser cache
- Use incognito/private window
