import type { SpendingProfile, CardWithRelations, CardScore, SpendingCategory } from './types';

const SPENDING_TO_CATEGORY: Record<keyof SpendingProfile['spending'], SpendingCategory> = {
  groceries: 'groceries',
  dining: 'dining',
  fuel: 'fuel',
  onlineShopping: 'online_shopping',
  travel: 'travel',
  entertainment: 'entertainment',
};

const PREFERENCE_TO_BENEFIT: Record<string, string> = {
  loungeAccess: 'lounge_access',
  travelInsurance: 'travel_insurance',
  concierge: 'concierge',
  zeroInstallments: 'zero_installments',
};

const PREMIUM_TIERS = ['world', 'signature', 'infinite'];

function isEligible(profile: SpendingProfile, card: CardWithRelations): boolean {
  if (profile.monthlyIncome < card.minSalaryEgp) return false;

  if (profile.tierPreference !== 'any') {
    const tier = card.tier.toLowerCase();
    if (profile.tierPreference === 'classic' && tier !== 'classic' && tier !== 'standard') return false;
    if (profile.tierPreference === 'gold' && tier !== 'gold' && tier !== 'titanium') return false;
    if (profile.tierPreference === 'platinum' && tier !== 'platinum') return false;
    if (profile.tierPreference === 'premium' && !PREMIUM_TIERS.includes(tier)) return false;
  }

  return true;
}

function calcAnnualCashback(profile: SpendingProfile, card: CardWithRelations): number {
  let totalAnnual = 0;
  const generalRate = card.cashback.find((c) => c.category === 'general');

  for (const [key, category] of Object.entries(SPENDING_TO_CATEGORY)) {
    const monthlySpend = profile.spending[key as keyof SpendingProfile['spending']];
    if (monthlySpend <= 0) continue;

    const categoryRate = card.cashback.find((c) => c.category === category);
    const rate = categoryRate || generalRate;
    if (!rate) continue;

    let monthlyCashback = monthlySpend * rate.cashbackPct;
    if (rate.maxCashbackEgpMonthly && rate.maxCashbackEgpMonthly > 0) {
      monthlyCashback = Math.min(monthlyCashback, rate.maxCashbackEgpMonthly);
    }
    totalAnnual += monthlyCashback * 12;
  }

  return totalAnnual;
}

function calcAnnualRewards(profile: SpendingProfile, card: CardWithRelations): number {
  let totalAnnual = 0;
  const generalRate = card.rewards.find((r) => r.category === 'general');

  for (const [key, category] of Object.entries(SPENDING_TO_CATEGORY)) {
    const monthlySpend = profile.spending[key as keyof SpendingProfile['spending']];
    if (monthlySpend <= 0) continue;

    const categoryRate = card.rewards.find((r) => r.category === category);
    const rate = categoryRate || generalRate;
    if (!rate) continue;

    const monthlyPoints = monthlySpend * rate.pointsPerEgp;
    const monthlyValue = monthlyPoints * rate.pointValueEgp;
    totalAnnual += monthlyValue * 12;
  }

  return totalAnnual;
}

function calcPreferenceMatch(
  profile: SpendingProfile,
  card: CardWithRelations
): { count: number; details: string[] } {
  const details: string[] = [];
  const benefitTypes = card.benefits.map((b) => b.benefitType);

  for (const [prefKey, benefitType] of Object.entries(PREFERENCE_TO_BENEFIT)) {
    if (profile.preferences[prefKey as keyof SpendingProfile['preferences']] && benefitTypes.includes(benefitType)) {
      details.push(prefKey);
    }
  }

  if (profile.preferences.lowAnnualFee && card.annualFeeEgp <= 500) {
    details.push('lowAnnualFee');
  }

  if (profile.preferences.cashbackPreference && card.cashback.length > 0) {
    details.push('cashbackPreference');
  }

  if (profile.preferences.rewardsPreference && card.rewards.length > 0) {
    details.push('rewardsPreference');
  }

  return { count: details.length, details };
}

export function rankCards(profile: SpendingProfile, cards: CardWithRelations[]): CardScore[] {
  const selectedPreferenceCount = Object.values(profile.preferences).filter(Boolean).length;

  const scores: CardScore[] = cards.map((card) => {
    const eligibility = isEligible(profile, card);
    const annualCashbackValue = calcAnnualCashback(profile, card);
    const annualRewardsValue = calcAnnualRewards(profile, card);
    const totalAnnualBenefitValue = Math.max(annualCashbackValue, annualRewardsValue);
    const netAnnualValue = totalAnnualBenefitValue - card.annualFeeEgp;
    const { count: preferenceMatchCount, details: preferenceMatchDetails } = calcPreferenceMatch(profile, card);

    const preferenceScore =
      selectedPreferenceCount > 0 ? (preferenceMatchCount / selectedPreferenceCount) * 100 : 0;

    const overallScore = eligibility ? netAnnualValue * 0.6 + preferenceScore * 0.4 : -Infinity;

    return {
      cardId: card.id,
      card,
      eligibility,
      annualCashbackValue: Math.round(annualCashbackValue),
      annualRewardsValue: Math.round(annualRewardsValue),
      totalAnnualBenefitValue: Math.round(totalAnnualBenefitValue),
      netAnnualValue: Math.round(netAnnualValue),
      preferenceMatchCount,
      preferenceMatchDetails,
      overallScore,
    };
  });

  return scores
    .filter((s) => s.eligibility)
    .sort((a, b) => b.overallScore - a.overallScore);
}
