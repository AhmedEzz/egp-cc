'use client';

import { useTranslations } from 'next-intl';
import type { CardScore } from '@/lib/types';

const CATEGORY_LABELS: Record<string, string> = {
  groceries: 'Groceries',
  dining: 'Dining',
  fuel: 'Fuel',
  online_shopping: 'Online Shopping',
  travel: 'Travel',
  entertainment: 'Entertainment',
  general: 'General',
};

export function ComparisonTable({
  cards,
  locale,
}: {
  cards: CardScore[];
  locale: string;
}) {
  const t = useTranslations('results');
  const tc = useTranslations('card');
  const isAr = locale === 'ar';

  if (cards.length === 0) return null;

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <tr className="border-b border-border">
      <td className="py-3 pe-4 text-sm font-medium text-muted-foreground whitespace-nowrap align-top">
        {label}
      </td>
      {children}
    </tr>
  );

  return (
    <table className="w-full min-w-[600px]">
      <thead>
        <tr className="border-b-2 border-border">
          <th className="py-3 pe-4 text-start" />
          {cards.map((c) => (
            <th key={c.cardId} className="py-3 px-4 text-start">
              <div className="font-bold">{isAr ? c.card.nameAr : c.card.nameEn}</div>
              <div className="text-xs text-muted-foreground font-normal">
                {isAr ? c.card.bank.nameAr : c.card.bank.nameEn}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <Row label={t('tier')}>
          {cards.map((c) => (
            <td key={c.cardId} className="py-3 px-4 text-sm capitalize">
              {c.card.tier}
            </td>
          ))}
        </Row>

        <Row label={t('annualFee')}>
          {cards.map((c) => (
            <td key={c.cardId} className="py-3 px-4 text-sm font-semibold">
              {c.card.annualFeeEgp === 0 ? 'FREE' : `${c.card.annualFeeEgp.toLocaleString()} EGP`}
            </td>
          ))}
        </Row>

        <Row label={t('annualSavings')}>
          {cards.map((c) => (
            <td key={c.cardId} className="py-3 px-4 text-sm font-semibold text-green-700">
              {c.totalAnnualBenefitValue.toLocaleString()} EGP
            </td>
          ))}
        </Row>

        <Row label={t('netValue')}>
          {cards.map((c) => (
            <td
              key={c.cardId}
              className={`py-3 px-4 text-sm font-bold ${c.netAnnualValue >= 0 ? 'text-green-700' : 'text-red-600'}`}
            >
              {c.netAnnualValue.toLocaleString()} EGP
            </td>
          ))}
        </Row>

        <Row label={tc('minSalary')}>
          {cards.map((c) => (
            <td key={c.cardId} className="py-3 px-4 text-sm">
              {c.card.minSalaryEgp.toLocaleString()} EGP
            </td>
          ))}
        </Row>

        <Row label={t('gracePeriod')}>
          {cards.map((c) => (
            <td key={c.cardId} className="py-3 px-4 text-sm">
              {c.card.gracePeriodDays} {t('days')}
            </td>
          ))}
        </Row>

        <Row label={t('cashbackRates')}>
          {cards.map((c) => (
            <td key={c.cardId} className="py-3 px-4 text-sm">
              {c.card.cashback.length > 0 ? (
                <ul className="space-y-1">
                  {c.card.cashback.map((cb) => (
                    <li key={cb.id} className="text-xs">
                      {CATEGORY_LABELS[cb.category] || cb.category}:{' '}
                      <span className="font-medium">{(cb.cashbackPct * 100).toFixed(1)}%</span>
                      {cb.maxCashbackEgpMonthly && (
                        <span className="text-muted-foreground">
                          {' '}(max {cb.maxCashbackEgpMonthly} EGP)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </td>
          ))}
        </Row>

        <Row label={t('benefits')}>
          {cards.map((c) => (
            <td key={c.cardId} className="py-3 px-4 text-sm">
              {c.card.benefits.length > 0 ? (
                <ul className="space-y-1">
                  {c.card.benefits.map((b) => (
                    <li key={b.id} className="text-xs">
                      {isAr ? b.descriptionAr : b.descriptionEn}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </td>
          ))}
        </Row>
      </tbody>
    </table>
  );
}
