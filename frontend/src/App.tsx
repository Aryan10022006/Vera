import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from './wagmi';
import { AuthProvider } from './contexts/AuthContext';
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#0ea5e9',
          accentColorForeground: 'white',
          borderRadius: 'large',
        })}>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
              </Routes>
            </Router>
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
