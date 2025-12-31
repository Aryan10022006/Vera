import { sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
if (!walletConnectProjectId) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is required. Get one at https://cloud.walletconnect.com');
}

export const config = getDefaultConfig({
  appName: 'Vera Protocol',
  projectId: walletConnectProjectId,
  chains: [sepolia],
  ssr: false,
});
