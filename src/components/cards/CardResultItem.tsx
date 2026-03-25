'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { CardScore } from '@/lib/types';
import { ExternalLink, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { CardImage } from './CardImage';

const TIER_COLORS: Record<string, string> = {
  classic: 'bg-gray-100 text-gray-700',
  gold: 'bg-amber-100 text-amber-700',
  titanium: 'bg-slate-100 text-slate-700',
  platinum: 'bg-violet-100 text-violet-700',
  world: 'bg-blue-100 text-blue-700',
  signature: 'bg-indigo-100 text-indigo-700',
  infinite: 'bg-purple-100 text-purple-700',
};

const PREF_LABELS: Record<string, string> = {
  loungeAccess: 'loungeAccess',
  travelInsurance: 'travelInsurance',
  cashbackPreference: 'cashbackPreference',
  rewardsPreference: 'rewardsPreference',
  lowAnnualFee: 'lowAnnualFee',
  zeroInstallments: 'zeroInstallments',
  concierge: 'concierge',
};

export function CardResultItem({
  result,
  rank,
  locale,
  isSelected,
  onToggleSelect,
}: {
  result: CardScore;
  rank: number;
  locale: string;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const t = useTranslations('results');
  const tq = useTranslations('questionnaire');
  const { card } = result;
  const isAr = locale === 'ar';
  const cardName = isAr ? card.nameAr : card.nameEn;
  const bankName = isAr ? card.bank.nameAr : card.bank.nameEn;
  const tierColor = TIER_COLORS[card.tier] || 'bg-gray-100 text-gray-700';

  return (
    <div
      className={`bg-white rounded-xl border-2 p-5 transition-all ${
        isSelected ? 'border-primary shadow-md' : 'border-border hover:border-primary/30'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Rank + Select */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <span className="text-2xl font-bold text-primary">#{rank}</span>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-4 h-4 accent-primary"
            />
          </label>
        </div>

        {/* Card Image */}
        <div className="hidden sm:block shrink-0">
          <CardImage
            imageUrl={card.imageUrl}
            tier={card.tier}
            bankName={bankName}
            cardName={cardName}
            size="sm"
          />
        </div>

        {/* Card info */}
        <div className="flex-1 min-w-0">
          {/* Mobile card image */}
          <div className="sm:hidden mb-3">
            <CardImage
              imageUrl={card.imageUrl}
              tier={card.tier}
              bankName={bankName}
              cardName={cardName}
              size="md"
            />
          </div>
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-bold text-lg">{cardName}</h3>
              <p className="text-sm text-muted-foreground">{bankName}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tierColor}`}>
              {card.tier.charAt(0).toUpperCase() + card.tier.slice(1)}
            </span>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{t('annualSavings')}</p>
              <p className="text-lg font-bold text-green-700">
                {result.totalAnnualBenefitValue.toLocaleString()} EGP
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{t('annualFee')}</p>
              <p className="text-lg font-bold">
                {card.annualFeeEgp === 0 ? 'FREE' : `${card.annualFeeEgp.toLocaleString()} EGP`}
              </p>
            </div>
            <div className={`rounded-lg p-3 ${result.netAnnualValue >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-xs text-muted-foreground">{t('netValue')}</p>
              <div className="flex items-center gap-1">
                {result.netAnnualValue >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-700" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <p className={`text-lg font-bold ${result.netAnnualValue >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {result.netAnnualValue.toLocaleString()} EGP
                </p>
              </div>
            </div>
          </div>

          {/* Matched preferences */}
          {result.preferenceMatchDetails.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1.5">{t('matchedPreferences')}</p>
              <div className="flex flex-wrap gap-1.5">
                {result.preferenceMatchDetails.map((pref) => (
                  <span
                    key={pref}
                    className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium"
                  >
                    {tq(PREF_LABELS[pref] || pref)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <Link
              href={`/card/${card.id}`}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Eye className="w-3.5 h-3.5" />
              {t('viewDetails')}
            </Link>
            {card.applyUrl && (
              <a
                href={card.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t('applyNow')}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
