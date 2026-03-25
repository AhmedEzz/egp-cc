'use client';

import { useTranslations } from 'next-intl';
import type { SpendingProfile } from '@/lib/types';
import { Layers, CreditCard, Award, Crown, Gem } from 'lucide-react';

type TierPref = SpendingProfile['tierPreference'];

const TIERS: { value: TierPref; icon: typeof Layers; labelKey: string; descKey: string }[] = [
  { value: 'any', icon: Layers, labelKey: 'tierAny', descKey: 'tierAnyDesc' },
  { value: 'classic', icon: CreditCard, labelKey: 'tierClassic', descKey: 'tierClassicDesc' },
  { value: 'gold', icon: Award, labelKey: 'tierGold', descKey: 'tierGoldDesc' },
  { value: 'platinum', icon: Crown, labelKey: 'tierPlatinum', descKey: 'tierPlatinumDesc' },
  { value: 'premium', icon: Gem, labelKey: 'tierPremium', descKey: 'tierPremiumDesc' },
];

export function StepTier({
  value,
  onChange,
}: {
  value: TierPref;
  onChange: (value: TierPref) => void;
}) {
  const t = useTranslations('questionnaire');

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t('tierTitle')}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t('tierSubtitle')}</p>

      <div className="space-y-3">
        {TIERS.map(({ value: tierValue, icon: Icon, labelKey, descKey }) => (
          <label
            key={tierValue}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              value === tierValue
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              type="radio"
              name="tier"
              checked={value === tierValue}
              onChange={() => onChange(tierValue)}
              className="mt-0.5 w-4 h-4 accent-primary"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{t(labelKey)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t(descKey)}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
