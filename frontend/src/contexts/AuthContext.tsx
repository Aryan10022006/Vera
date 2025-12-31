import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface User {
  email: string;
  name: string;
  picture: string;
  role: 'client' | 'freelancer' | null;
}

interface AuthContextType {
  // Wallet
  isConnected: boolean;
  address: string | undefined;
  // Google Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (credential: string) => void;
  logout: () => void;
  setUserRole: (role: 'client' | 'freelancer') => void;
  // Role checks
  isClient: boolean;
  isFreelancer: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isConnected: false,
  address: undefined,
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  setUserRole: () => {},
  isClient: false,
  isFreelancer: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('vera_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem('vera_user');
      }
    }
  }, []);

  const login = (credential: string) => {
    try {
      // Decode Google JWT token
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const newUser: User = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        role: null // Will be set after role selection
      };

      setUser(newUser);
      localStorage.setItem('vera_user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Failed to login:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vera_user');
  };

  const setUserRole = (role: 'client' | 'freelancer') => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('vera_user', JSON.stringify(updatedUser));
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
        login,
        logout,
        setUserRole,
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
