import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { cards } from '@/lib/db/schema';
import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { CardImage } from '@/components/cards/CardImage';

const CATEGORY_LABELS_EN: Record<string, string> = {
  groceries: 'Groceries',
  dining: 'Dining',
  fuel: 'Fuel',
  online_shopping: 'Online Shopping',
  travel: 'Travel',
  entertainment: 'Entertainment',
  general: 'General',
};

const CATEGORY_LABELS_AR: Record<string, string> = {
  groceries: 'البقالة',
  dining: 'المطاعم',
  fuel: 'الوقود',
  online_shopping: 'التسوق الإلكتروني',
  travel: 'السفر',
  entertainment: 'الترفيه',
  general: 'عام',
};

const TIER_COLORS: Record<string, string> = {
  classic: 'bg-gray-100 text-gray-700',
  gold: 'bg-amber-100 text-amber-700',
  titanium: 'bg-slate-100 text-slate-700',
  platinum: 'bg-violet-100 text-violet-700',
  world: 'bg-blue-100 text-blue-700',
  signature: 'bg-indigo-100 text-indigo-700',
  infinite: 'bg-purple-100 text-purple-700',
};

export default async function CardDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations('card');
  const isAr = locale === 'ar';
  const categoryLabels = isAr ? CATEGORY_LABELS_AR : CATEGORY_LABELS_EN;

  const card = await db.query.cards.findFirst({
    where: eq(cards.id, parseInt(id)),
    with: {
      bank: true,
      benefits: true,
      cashback: true,
      rewards: true,
    },
  });

  if (!card) notFound();

  const cardName = isAr ? card.nameAr : card.nameEn;
  const bankName = isAr ? card.bank.nameAr : card.bank.nameEn;
  const tierColor = TIER_COLORS[card.tier] || 'bg-gray-100 text-gray-700';

  return (
    <div className="min-h-[80vh] bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/results"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t('backToResults')}
        </Link>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-6">
            <div className="flex items-start gap-5">
              <CardImage
                imageUrl={card.imageUrl}
                tier={card.tier}
                bankName={bankName}
                cardName={cardName}
                size="lg"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold">{cardName}</h1>
                    <p className="text-muted-foreground mt-1">{bankName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium shrink-0 ${tierColor}`}>
                    {card.tier.charAt(0).toUpperCase() + card.tier.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Overview */}
            <section>
              <h2 className="text-lg font-bold mb-4">{t('overview')}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoRow label={t('annualFee')} value={card.annualFeeEgp === 0 ? 'FREE' : `${card.annualFeeEgp.toLocaleString()} EGP`} />
                {card.interestRateMonthly && (
                  <InfoRow label={t('interestRate')} value={`${(card.interestRateMonthly * 100).toFixed(1)}%`} />
                )}
                {card.foreignTransactionFeePct !== null && (
                  <InfoRow label={t('foreignFee')} value={`${(card.foreignTransactionFeePct! * 100).toFixed(1)}%`} />
                )}
                <InfoRow label={t('minSalary')} value={`${card.minSalaryEgp.toLocaleString()} EGP`} />
                {card.creditLimitMin && card.creditLimitMax && (
                  <InfoRow
                    label={t('creditLimit')}
                    value={`${card.creditLimitMin.toLocaleString()} - ${card.creditLimitMax.toLocaleString()} EGP`}
                  />
                )}
                <InfoRow label={t('gracePeriod')} value={`${card.gracePeriodDays} ${t('days')}`} />
                {card.minPaymentPct && (
                  <InfoRow label={t('minPayment')} value={`${(card.minPaymentPct * 100).toFixed(0)}%`} />
                )}
              </div>
            </section>

            {/* Cashback */}
            {card.cashback.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4">{t('cashbackTitle')}</h2>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-start text-sm font-medium p-3">{t('category')}</th>
                        <th className="text-start text-sm font-medium p-3">{t('rate')}</th>
                        <th className="text-start text-sm font-medium p-3">{t('monthlyLimit')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {card.cashback.map((cb) => (
                        <tr key={cb.id} className="border-t border-border">
                          <td className="p-3 text-sm">{categoryLabels[cb.category] || cb.category}</td>
                          <td className="p-3 text-sm font-semibold text-green-700">
                            {(cb.cashbackPct * 100).toFixed(1)}%
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {cb.maxCashbackEgpMonthly
                              ? `${cb.maxCashbackEgpMonthly.toLocaleString()} EGP`
                              : t('noLimit')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Rewards */}
            {card.rewards.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4">{t('rewardsTitle')}</h2>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-start text-sm font-medium p-3">{t('category')}</th>
                        <th className="text-start text-sm font-medium p-3">{t('pointsPerEgp')}</th>
                        <th className="text-start text-sm font-medium p-3">{t('pointValue')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {card.rewards.map((r) => (
                        <tr key={r.id} className="border-t border-border">
                          <td className="p-3 text-sm">{categoryLabels[r.category] || r.category}</td>
                          <td className="p-3 text-sm font-semibold">{r.pointsPerEgp}</td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {r.pointValueEgp} EGP
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Benefits */}
            {card.benefits.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4">{t('benefitsTitle')}</h2>
                <div className="space-y-2">
                  {card.benefits.map((b) => (
                    <div key={b.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span className="text-sm">
                        {isAr ? b.descriptionAr : b.descriptionEn}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Apply Button */}
            {card.applyUrl && (
              <a
                href={card.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t('applyNow')}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
