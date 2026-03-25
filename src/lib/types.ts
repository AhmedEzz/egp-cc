import type { Bank, Card, CardBenefit, CardCashbackEntry, CardRewardEntry } from './db/schema';

export interface SpendingProfile {
  monthlyIncome: number;
  spending: {
    groceries: number;
    dining: number;
    fuel: number;
    onlineShopping: number;
    travel: number;
    entertainment: number;
  };
  preferences: {
    loungeAccess: boolean;
    travelInsurance: boolean;
    cashbackPreference: boolean;
    rewardsPreference: boolean;
    lowAnnualFee: boolean;
    zeroInstallments: boolean;
    concierge: boolean;
  };
  tierPreference: 'any' | 'classic' | 'gold' | 'platinum' | 'premium';
}

export interface CardWithRelations {
  id: number;
  bankId: number;
  nameEn: string;
  nameAr: string;
  tier: string;
  annualFeeEgp: number;
  interestRateMonthly: number | null;
  foreignTransactionFeePct: number | null;
  minSalaryEgp: number;
  creditLimitMin: number | null;
  creditLimitMax: number | null;
  gracePeriodDays: number | null;
  minPaymentPct: number | null;
  imageUrl: string | null;
  applyUrl: string | null;
  isActive: boolean | null;
  bank: Bank;
  benefits: CardBenefit[];
  cashback: CardCashbackEntry[];
  rewards: CardRewardEntry[];
}

export interface CardScore {
  cardId: number;
  card: CardWithRelations;
  eligibility: boolean;
  annualCashbackValue: number;
  annualRewardsValue: number;
  totalAnnualBenefitValue: number;
  netAnnualValue: number;
  preferenceMatchCount: number;
  preferenceMatchDetails: string[];
  overallScore: number;
}

export type SpendingCategory = 'groceries' | 'dining' | 'fuel' | 'online_shopping' | 'travel' | 'entertainment' | 'general';

export type BenefitType =
  | 'lounge_access'
  | 'travel_insurance'
  | 'concierge'
  | 'purchase_protection'
  | 'zero_installments'
  | 'airport_transfer'
  | 'valet_parking'
  | 'dining_discount'
  | 'fuel_discount'
  | 'free_supplementary';
