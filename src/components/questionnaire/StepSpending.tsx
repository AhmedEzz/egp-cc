'use client';

import { useTranslations } from 'next-intl';
import type { SpendingProfile } from '@/lib/types';
import { ShoppingCart, Utensils, Fuel, ShoppingBag, Plane, Music } from 'lucide-react';

type SpendingKey = keyof SpendingProfile['spending'];

const CATEGORIES: { key: SpendingKey; icon: typeof ShoppingCart; max: number }[] = [
  { key: 'groceries', icon: ShoppingCart, max: 15000 },
  { key: 'dining', icon: Utensils, max: 10000 },
  { key: 'fuel', icon: Fuel, max: 5000 },
  { key: 'onlineShopping', icon: ShoppingBag, max: 20000 },
  { key: 'travel', icon: Plane, max: 30000 },
  { key: 'entertainment', icon: Music, max: 10000 },
];

export function StepSpending({
  spending,
  onChange,
}: {
  spending: SpendingProfile['spending'];
  onChange: (spending: SpendingProfile['spending']) => void;
}) {
  const t = useTranslations('questionnaire');

  const updateCategory = (key: SpendingKey, value: number) => {
    onChange({ ...spending, [key]: value });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t('spendingTitle')}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t('spendingSubtitle')}</p>

      <div className="space-y-6">
        {CATEGORIES.map(({ key, icon: Icon, max }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{t(key)}</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={max}
                  value={spending[key] || ''}
                  onChange={(e) => updateCategory(key, Math.min(Number(e.target.value) || 0, max))}
                  placeholder="0"
                  className="w-24 text-end text-sm font-semibold bg-muted rounded-md px-2 py-1 border border-border focus:outline-none focus:border-primary"
                />
                <span className="text-xs text-muted-foreground">EGP</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={max}
              step={100}
              value={spending[key]}
              onChange={(e) => updateCategory(key, Number(e.target.value))}
              className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span>{max.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
