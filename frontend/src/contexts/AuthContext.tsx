import { createContext, useContext, ReactNode } from 'react';
import { useAccount } from 'wagmi';

interface AuthContextType {
  address: string | undefined;
  isConnected: boolean;
  isClient: boolean;
  isFreelancer: boolean;
}

const AuthContext = createContext<AuthContextType>({
  address: undefined,
  isConnected: false,
  isClient: false,
  isFreelancer: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();

  // User can be both client and freelancer
  // Determined by their projects (created vs working on)
  const isClient = isConnected;
  const isFreelancer = isConnected;

  return (
    <AuthContext.Provider value={{ address, isConnected, isClient, isFreelancer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
