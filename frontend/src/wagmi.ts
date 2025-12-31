import { sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const config = getDefaultConfig({
  appName: 'Vera Protocol',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'vera-protocol-default',
  chains: [sepolia],
  ssr: false,
});
