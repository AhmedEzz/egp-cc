'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/navigation';
import type { CardScore, SpendingProfile } from '@/lib/types';
import { CardResultItem } from '@/components/cards/CardResultItem';
import { ComparisonTable } from '@/components/cards/ComparisonTable';
import { ArrowLeft, RotateCcw, X, GitCompareArrows } from 'lucide-react';

export default function ResultsPage() {
  const t = useTranslations('results');
  const locale = useLocale();
  const router = useRouter();
  const [results, setResults] = useState<CardScore[] | null>(null);
  const [profile, setProfile] = useState<SpendingProfile | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('compareResults');
    const storedProfile = sessionStorage.getItem('compareProfile');
    if (!stored || !storedProfile) {
      router.push('/compare');
      return;
    }
    setResults(JSON.parse(stored));
    setProfile(JSON.parse(storedProfile));
  }, [router]);

  if (!results || !profile) return null;

  const totalSpending = Object.values(profile.spending).reduce((a, b) => a + b, 0);

  const toggleSelect = (cardId: number) => {
    if (selectedIds.includes(cardId)) {
      setSelectedIds(selectedIds.filter((id) => id !== cardId));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, cardId]);
    }
  };

  const selectedCards = results.filter((r) => selectedIds.includes(r.cardId));

  return (
    <div className="min-h-[80vh] bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle', {
              totalSpending: totalSpending.toLocaleString(),
              count: results.length,
            })}
          </p>
          <div className="flex gap-3 mt-4">
            <Link
              href="/compare"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
            >
              <RotateCcw className="w-4 h-4" />
              {t('startOver')}
            </Link>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground">{t('noResults')}</p>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {t('startOver')}
            </Link>
          </div>
        ) : (
          <>
            {/* Selection hint */}
            <p className="text-sm text-muted-foreground mb-4">
              {t('selectToCompare')}
            </p>

            {/* Card list */}
            <div className="space-y-4">
              {results.map((result, index) => (
                <CardResultItem
                  key={result.cardId}
                  result={result}
                  rank={index + 1}
                  locale={locale}
                  isSelected={selectedIds.includes(result.cardId)}
                  onToggleSelect={() => toggleSelect(result.cardId)}
                />
              ))}
            </div>

            {/* Compare bar */}
            {selectedIds.length > 0 && (
              <div className="fixed bottom-0 inset-x-0 bg-white border-t border-border shadow-lg py-4 px-4 z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {selectedIds.length}/3 selected
                    </span>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowComparison(true)}
                    disabled={selectedIds.length < 2}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <GitCompareArrows className="w-4 h-4" />
                    {t('compareSelected')}
                  </button>
                </div>
              </div>
            )}

            {/* Comparison Modal */}
            {showComparison && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto">
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-lg font-bold">{t('comparison')}</h2>
                    <button
                      onClick={() => setShowComparison(false)}
                      className="p-2 hover:bg-muted rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 overflow-x-auto">
                    <ComparisonTable cards={selectedCards} locale={locale} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
