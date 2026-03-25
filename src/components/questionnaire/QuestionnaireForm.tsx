'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import type { SpendingProfile } from '@/lib/types';
import { StepIncome } from './StepIncome';
import { StepSpending } from './StepSpending';
import { StepPreferences } from './StepPreferences';
import { StepTier } from './StepTier';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

const TOTAL_STEPS = 4;

const defaultProfile: SpendingProfile = {
  monthlyIncome: 0,
  spending: {
    groceries: 0,
    dining: 0,
    fuel: 0,
    onlineShopping: 0,
    travel: 0,
    entertainment: 0,
  },
  preferences: {
    loungeAccess: false,
    travelInsurance: false,
    cashbackPreference: false,
    rewardsPreference: false,
    lowAnnualFee: false,
    zeroInstallments: false,
    concierge: false,
  },
  tierPreference: 'any',
};

export function QuestionnaireForm() {
  const t = useTranslations('questionnaire');
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<SpendingProfile>(defaultProfile);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const canProceed = () => {
    if (step === 1) return profile.monthlyIncome > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const results = await res.json();
      sessionStorage.setItem('compareResults', JSON.stringify(results));
      sessionStorage.setItem('compareProfile', JSON.stringify(profile));
      router.push('/results');
    } catch (err) {
      console.error('Comparison failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Progress bar */}
      <div className="bg-muted px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">{t('title')}</h1>
          <span className="text-sm text-muted-foreground">
            {t('step', { current: step, total: TOTAL_STEPS })}
          </span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="p-6">
        {step === 1 && (
          <StepIncome
            value={profile.monthlyIncome}
            onChange={(v) => setProfile({ ...profile, monthlyIncome: v })}
          />
        )}
        {step === 2 && (
          <StepSpending
            spending={profile.spending}
            onChange={(s) => setProfile({ ...profile, spending: s })}
          />
        )}
        {step === 3 && (
          <StepPreferences
            preferences={profile.preferences}
            onChange={(p) => setProfile({ ...profile, preferences: p })}
          />
        )}
        {step === 4 && (
          <StepTier
            value={profile.tierPreference}
            onChange={(v) => setProfile({ ...profile, tierPreference: v })}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="px-6 py-4 border-t border-border flex justify-between">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t('back')}
          </button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('next')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('seeResults')}
          </button>
        )}
      </div>
    </div>
  );
}
