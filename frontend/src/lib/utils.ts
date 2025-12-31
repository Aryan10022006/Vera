export const PROJECT_STATUS = {
  0: 'Active',
  1: 'Completed',
  2: 'Disputed',
  3: 'Cancelled'
} as const;

export const MILESTONE_STATUS = {
  0: 'Pending',
  1: 'Submitted',
  2: 'Technical Released',
  3: 'Fully Released',
  4: 'Disputed'
} as const;

export function formatAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function validateEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function formatEthAmount(wei: bigint, decimals: number = 4): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(decimals);
}
