'use client';

import { Marketplace } from '@/components/Marketplace';

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Marketplace />
      </div>
    </div>
  );
}
