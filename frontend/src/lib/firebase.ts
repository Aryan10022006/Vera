import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBrDjiKUxv9nEmJdTGAy8Mt5wY035RHinc",
  authDomain: "vera-e20ea.firebaseapp.com",
  projectId: "vera-e20ea",
  storageBucket: "vera-e20ea.firebasestorage.app",
  messagingSenderId: "457242407514",
  appId: "1:457242407514:web:3c492b2deb5fc37fe71e63",
  measurementId: "G-RFSSD4X9BQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();
