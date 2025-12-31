# Firebase Setup Guide

## Creating Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "Vera Protocol")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Enabling Google Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Click on "Google" provider
5. Toggle "Enable"
6. Select a support email
7. Click "Save"

## Getting Firebase Configuration

1. Go to **Project Settings** (gear icon in sidebar)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register app with a nickname (e.g., "Vera Frontend")
5. Copy the firebaseConfig object values

## Environment Variables

Add these to your `.env` file in the `frontend` directory:

```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Security Rules (Optional but Recommended)

### Firestore Rules (if using database in future)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Testing

1. Start the frontend: `npm run dev`
2. Click "Sign In" button
3. Select your role (Client or Freelancer)
4. Click "Sign in with Google"
5. Authorize with your Google account
6. You should be logged in and see your profile

## Troubleshooting

### Error: "Firebase: Error (auth/unauthorized-domain)"
- Go to Firebase Console > Authentication > Settings > Authorized domains
- Add your domain (e.g., `localhost` for development)

### User role not persisting
- Check browser localStorage for `vera_role_{uid}` key
- Make sure you select a role during login

### Missing environment variables
- Check that all 6 Firebase variables are in your `.env` file
- Restart the dev server after adding env variables

## WalletConnect Note

The missing `VITE_WALLETCONNECT_PROJECT_ID` won't cause issues - the app has a fallback value (`'vera-protocol-default'`). However, for production:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy the Project ID
4. Add to `.env`: `VITE_WALLETCONNECT_PROJECT_ID=your_project_id`
