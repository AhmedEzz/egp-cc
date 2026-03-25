'use client';

import { useTranslations } from 'next-intl';

const INCOME_RANGES = [
  { key: 'income_below5k', value: 4000 },
  { key: 'income_5to10k', value: 7500 },
  { key: 'income_10to20k', value: 15000 },
  { key: 'income_20to40k', value: 30000 },
  { key: 'income_40to70k', value: 55000 },
  { key: 'income_above70k', value: 80000 },
];

export function StepIncome({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const t = useTranslations('questionnaire');

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t('incomeTitle')}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t('incomeSubtitle')}</p>

      <div className="space-y-3">
        {INCOME_RANGES.map((range) => (
          <label
            key={range.key}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              value === range.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              type="radio"
              name="income"
              checked={value === range.value}
              onChange={() => onChange(range.value)}
              className="w-4 h-4 text-primary accent-primary"
            />
            <span className="text-sm font-medium">{t(range.key)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
