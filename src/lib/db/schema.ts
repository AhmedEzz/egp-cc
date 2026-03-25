import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const banks = sqliteTable('banks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url').notNull(),
});

export const cards = sqliteTable('cards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bankId: integer('bank_id')
    .notNull()
    .references(() => banks.id),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
  tier: text('tier').notNull(), // classic, gold, titanium, platinum, world, signature, infinite
  annualFeeEgp: real('annual_fee_egp').notNull(),
  interestRateMonthly: real('interest_rate_monthly'),
  foreignTransactionFeePct: real('foreign_transaction_fee_pct'),
  minSalaryEgp: integer('min_salary_egp').notNull(),
  creditLimitMin: integer('credit_limit_min'),
  creditLimitMax: integer('credit_limit_max'),
  gracePeriodDays: integer('grace_period_days').default(55),
  minPaymentPct: real('min_payment_pct').default(0.05),
  imageUrl: text('image_url'),
  applyUrl: text('apply_url'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const cardBenefits = sqliteTable('card_benefits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardId: integer('card_id')
    .notNull()
    .references(() => cards.id),
  benefitType: text('benefit_type').notNull(),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
});

export const cardCashback = sqliteTable('card_cashback', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardId: integer('card_id')
    .notNull()
    .references(() => cards.id),
  category: text('category').notNull(),
  cashbackPct: real('cashback_pct').notNull(),
  maxCashbackEgpMonthly: real('max_cashback_egp_monthly'),
});

export const cardRewards = sqliteTable('card_rewards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardId: integer('card_id')
    .notNull()
    .references(() => cards.id),
  category: text('category').notNull(),
  pointsPerEgp: real('points_per_egp').notNull(),
  pointValueEgp: real('point_value_egp').notNull(),
});

// Relations
export const banksRelations = relations(banks, ({ many }) => ({
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  bank: one(banks, {
    fields: [cards.bankId],
    references: [banks.id],
  }),
  benefits: many(cardBenefits),
  cashback: many(cardCashback),
  rewards: many(cardRewards),
}));

export const cardBenefitsRelations = relations(cardBenefits, ({ one }) => ({
  card: one(cards, {
    fields: [cardBenefits.cardId],
    references: [cards.id],
  }),
}));

export const cardCashbackRelations = relations(cardCashback, ({ one }) => ({
  card: one(cards, {
    fields: [cardCashback.cardId],
    references: [cards.id],
  }),
}));

export const cardRewardsRelations = relations(cardRewards, ({ one }) => ({
  card: one(cards, {
    fields: [cardRewards.cardId],
    references: [cards.id],
  }),
}));

// Types
export type Bank = typeof banks.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type CardBenefit = typeof cardBenefits.$inferSelect;
export type CardCashbackEntry = typeof cardCashback.$inferSelect;
export type CardRewardEntry = typeof cardRewards.$inferSelect;
