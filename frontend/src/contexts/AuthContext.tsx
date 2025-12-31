import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface User {
  email: string;
  name: string;
  picture: string;
  role: 'client' | 'freelancer' | null;
  uid: string;
}

interface AuthContextType {
  // Wallet
  isConnected: boolean;
  address: string | undefined;
  // Firebase Auth
  user: User | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: 'client' | 'freelancer') => void;
  loading: boolean;
  // Role checks
  isClient: boolean;
  isFreelancer: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isConnected: false,
  address: undefined,
  user: null,
  isAuthenticated: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
  setUserRole: () => {},
  loading: true,
  isClient: false,
  isFreelancer: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Check localStorage for role
        const savedRole = localStorage.getItem(`vera_role_${firebaseUser.uid}`);
        
        const userData: User = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '',
          picture: firebaseUser.photoURL || '',
          uid: firebaseUser.uid,
          role: savedRole as 'client' | 'freelancer' | null
        };
        
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Check for saved role
      const savedRole = localStorage.getItem(`vera_role_${firebaseUser.uid}`);
      
      const userData: User = {
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        picture: firebaseUser.photoURL || '',
        uid: firebaseUser.uid,
        role: savedRole as 'client' | 'freelancer' | null
      };
      
      setUser(userData);
    } catch (error) {
      console.error('Failed to login with Google:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  };

  const setUserRole = (role: 'client' | 'freelancer') => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem(`vera_role_${user.uid}`, role);
    }
  };

  const isAuthenticated = user !== null && user.role !== null;
  const isClient = user?.role === 'client';
  const isFreelancer = user?.role === 'freelancer';

  return (
    <AuthContext.Provider
      value={{
        isConnected,
        address,
        user,
        isAuthenticated,
        loginWithGoogle,
        logout: handleLogout,
        setUserRole,
        loading,
        isClient,
        isFreelancer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
