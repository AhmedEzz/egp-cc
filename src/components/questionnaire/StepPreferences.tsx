'use client';

import { useTranslations } from 'next-intl';
import type { SpendingProfile } from '@/lib/types';
import { Plane, Shield, Wallet, Star, Tag, CreditCard, Bell } from 'lucide-react';

type PrefKey = keyof SpendingProfile['preferences'];

const PREFERENCES: { key: PrefKey; icon: typeof Plane }[] = [
  { key: 'loungeAccess', icon: Plane },
  { key: 'travelInsurance', icon: Shield },
  { key: 'cashbackPreference', icon: Wallet },
  { key: 'rewardsPreference', icon: Star },
  { key: 'lowAnnualFee', icon: Tag },
  { key: 'zeroInstallments', icon: CreditCard },
  { key: 'concierge', icon: Bell },
];

export function StepPreferences({
  preferences,
  onChange,
}: {
  preferences: SpendingProfile['preferences'];
  onChange: (prefs: SpendingProfile['preferences']) => void;
}) {
  const t = useTranslations('questionnaire');

  const toggle = (key: PrefKey) => {
    onChange({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t('preferencesTitle')}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t('preferencesSubtitle')}</p>

      <div className="space-y-3">
        {PREFERENCES.map(({ key, icon: Icon }) => (
          <label
            key={key}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              preferences[key]
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              type="checkbox"
              checked={preferences[key]}
              onChange={() => toggle(key)}
              className="mt-0.5 w-4 h-4 accent-primary"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{t(key)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t(`${key}Desc`)}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
