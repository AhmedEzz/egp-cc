'use client';

import { CreditCard } from 'lucide-react';

const TIER_GRADIENTS: Record<string, string> = {
  classic: 'from-gray-400 to-gray-600',
  gold: 'from-amber-400 to-amber-600',
  titanium: 'from-slate-400 to-slate-600',
  platinum: 'from-violet-400 to-violet-600',
  world: 'from-blue-500 to-indigo-700',
  signature: 'from-indigo-500 to-purple-700',
  infinite: 'from-purple-600 to-fuchsia-800',
};

export function DefaultCardImage({
  tier,
  bankName,
  cardName,
  className = '',
}: {
  tier: string;
  bankName: string;
  cardName: string;
  className?: string;
}) {
  const gradient = TIER_GRADIENTS[tier.toLowerCase()] || 'from-gray-500 to-gray-700';

  return (
    <div
      className={`relative bg-gradient-to-br ${gradient} rounded-xl aspect-[1.586/1] flex flex-col justify-between p-4 text-white shadow-lg ${className}`}
    >
      <div className="flex items-start justify-between">
        <CreditCard className="w-8 h-8 opacity-80" />
        <span className="text-[10px] uppercase tracking-widest opacity-70 font-medium">
          {tier}
        </span>
      </div>
      <div className="space-y-0.5">
        <div className="text-xs font-bold tracking-wide truncate">{cardName}</div>
        <div className="text-[10px] opacity-80 truncate">{bankName}</div>
      </div>
      {/* Decorative circles */}
      <div className="absolute top-1/2 end-4 -translate-y-1/2 opacity-10">
        <div className="w-16 h-16 rounded-full border-2 border-white" />
        <div className="w-16 h-16 rounded-full border-2 border-white -mt-10 ms-8" />
      </div>
    </div>
  );
}
