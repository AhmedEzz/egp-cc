import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'cards.db');
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite, { schema });

// Drop existing tables
sqlite.exec(`
  DROP TABLE IF EXISTS card_rewards;
  DROP TABLE IF EXISTS card_cashback;
  DROP TABLE IF EXISTS card_benefits;
  DROP TABLE IF EXISTS cards;
  DROP TABLE IF EXISTS banks;
`);

// Create tables
sqlite.exec(`
  CREATE TABLE banks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT NOT NULL
  );

  CREATE TABLE cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_id INTEGER NOT NULL REFERENCES banks(id),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    tier TEXT NOT NULL,
    annual_fee_egp REAL NOT NULL,
    interest_rate_monthly REAL,
    foreign_transaction_fee_pct REAL,
    min_salary_egp INTEGER NOT NULL,
    credit_limit_min INTEGER,
    credit_limit_max INTEGER,
    grace_period_days INTEGER DEFAULT 55,
    min_payment_pct REAL DEFAULT 0.05,
    image_url TEXT,
    apply_url TEXT,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE card_benefits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL REFERENCES cards(id),
    benefit_type TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT
  );

  CREATE TABLE card_cashback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL REFERENCES cards(id),
    category TEXT NOT NULL,
    cashback_pct REAL NOT NULL,
    max_cashback_egp_monthly REAL
  );

  CREATE TABLE card_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL REFERENCES cards(id),
    category TEXT NOT NULL,
    points_per_egp REAL NOT NULL,
    point_value_egp REAL NOT NULL
  );
`);

// ===================== BANKS =====================
const bankData = [
  { nameEn: 'CIB', nameAr: 'البنك التجاري الدولي', websiteUrl: 'https://www.cibeg.com' },
  { nameEn: 'National Bank of Egypt', nameAr: 'البنك الأهلي المصري', websiteUrl: 'https://www.nbe.com.eg' },
  { nameEn: 'HSBC Egypt', nameAr: 'اتش اس بي سي مصر', websiteUrl: 'https://www.hsbc.com.eg' },
  { nameEn: 'QNB Alahli', nameAr: 'بنك قطر الوطني الأهلي', websiteUrl: 'https://www.qnb.com.eg' },
  { nameEn: 'Banque Misr', nameAr: 'بنك مصر', websiteUrl: 'https://www.banquemisr.com' },
  { nameEn: 'AAIB', nameAr: 'المصرف العربي الدولي', websiteUrl: 'https://aaib.com' },
  { nameEn: 'Banque du Caire', nameAr: 'بنك القاهرة', websiteUrl: 'https://www.bdc.com.eg' },
  { nameEn: 'Mashreq Bank', nameAr: 'بنك المشرق', websiteUrl: 'https://www.mashreq.com/en/egypt' },
  { nameEn: 'Credit Agricole Egypt', nameAr: 'كريدي أجريكول مصر', websiteUrl: 'https://www.ca-egypt.com' },
  { nameEn: 'ALEXBANK', nameAr: 'بنك الإسكندرية', websiteUrl: 'https://www.alexbank.com' },
];

const bankIds: Record<string, number> = {};
for (const b of bankData) {
  const result = db.insert(schema.banks).values(b).returning({ id: schema.banks.id }).get();
  bankIds[b.nameEn] = result.id;
}

// ===================== HELPER =====================
function insertCard(
  bankName: string,
  card: Omit<typeof schema.cards.$inferInsert, 'bankId'>,
  benefits: Array<{ benefitType: string; descriptionEn: string; descriptionAr: string }>,
  cashback: Array<{ category: string; cashbackPct: number; maxCashbackEgpMonthly?: number }>,
  rewards: Array<{ category: string; pointsPerEgp: number; pointValueEgp: number }>,
): number {
  const result = db.insert(schema.cards).values({ ...card, bankId: bankIds[bankName] }).returning({ id: schema.cards.id }).get();
  const cardId = result.id;

  for (const b of benefits) {
    db.insert(schema.cardBenefits).values({ cardId, ...b }).run();
  }
  for (const c of cashback) {
    db.insert(schema.cardCashback).values({ cardId, ...c }).run();
  }
  for (const r of rewards) {
    db.insert(schema.cardRewards).values({ cardId, ...r }).run();
  }
  return cardId;
}

// ===================== CIB CARDS =====================

insertCard('CIB', {
  nameEn: 'CIB World Elite Metal Card',
  nameAr: 'بطاقة CIB وورلد إيليت المعدنية',
  tier: 'world',
  annualFeeEgp: 5000,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 50000,
  creditLimitMin: 100000,
  creditLimitMax: 1000000,
  gracePeriodDays: 55,
  imageUrl: 'https://www.cibeg.com/-/media/project/cib/product-cards/personal/cards/world/world-credit-cardthumbnail-en.jpg',
  applyUrl: 'https://www.cibeg.com/en/personal/cards/credit',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Unlimited airport lounge access worldwide', descriptionAr: 'دخول غير محدود لصالات المطارات حول العالم' },
  { benefitType: 'travel_insurance', descriptionEn: 'Comprehensive travel insurance coverage', descriptionAr: 'تغطية تأمين سفر شاملة' },
  { benefitType: 'concierge', descriptionEn: '24/7 concierge service', descriptionAr: 'خدمة كونسيرج على مدار الساعة' },
  { benefitType: 'purchase_protection', descriptionEn: 'Purchase protection and extended warranty', descriptionAr: 'حماية المشتريات وضمان ممتد' },
  { benefitType: 'valet_parking', descriptionEn: 'Complimentary valet parking', descriptionAr: 'خدمة صف السيارات مجاناً' },
], [], [
  { category: 'general', pointsPerEgp: 1.5, pointValueEgp: 0.015 },
  { category: 'travel', pointsPerEgp: 3, pointValueEgp: 0.015 },
  { category: 'dining', pointsPerEgp: 2, pointValueEgp: 0.015 },
]);

insertCard('CIB', {
  nameEn: 'CIB Cashback Credit Card',
  nameAr: 'بطاقة CIB كاش باك',
  tier: 'platinum',
  annualFeeEgp: 0,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 10000,
  creditLimitMin: 10000,
  creditLimitMax: 250000,
  gracePeriodDays: 55,
  imageUrl: 'https://www.cibeg.com/-/media/project/cib/product-cards/personal/cards/cashback/cib---cashback-card-offering-2021-product-card-600x338px-en.jpg',
  applyUrl: 'https://www.cibeg.com/en/personal/cards/credit',
}, [
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans at partner merchants', descriptionAr: 'تقسيط بدون فوائد لدى التجار الشركاء' },
], [
  { category: 'general', cashbackPct: 0.01, maxCashbackEgpMonthly: 500 },
  { category: 'groceries', cashbackPct: 0.02, maxCashbackEgpMonthly: 200 },
  { category: 'dining', cashbackPct: 0.03, maxCashbackEgpMonthly: 150 },
  { category: 'fuel', cashbackPct: 0.02, maxCashbackEgpMonthly: 100 },
  { category: 'online_shopping', cashbackPct: 0.02, maxCashbackEgpMonthly: 200 },
], []);

insertCard('CIB', {
  nameEn: 'CIB Talabat Mastercard',
  nameAr: 'بطاقة CIB طلبات ماستركارد',
  tier: 'platinum',
  annualFeeEgp: 0,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 10000,
  creditLimitMin: 10000,
  creditLimitMax: 250000,
  gracePeriodDays: 55,
  imageUrl: 'https://www.cibeg.com/-/media/project/cib/product-cards/personal/cards/cib-talabat/cib-talabat-credit-card-600x338.jpg',
  applyUrl: 'https://www.cibeg.com/en/personal/cards/credit',
}, [
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
  { benefitType: 'dining_discount', descriptionEn: 'Exclusive Talabat offers and discounts', descriptionAr: 'عروض وخصومات حصرية على طلبات' },
], [
  { category: 'general', cashbackPct: 0.01 },
  { category: 'dining', cashbackPct: 0.05, maxCashbackEgpMonthly: 400 },
  { category: 'groceries', cashbackPct: 0.03, maxCashbackEgpMonthly: 300 },
], []);

insertCard('CIB', {
  nameEn: 'CIB Heya Credit Card',
  nameAr: 'بطاقة CIB هيا',
  tier: 'platinum',
  annualFeeEgp: 500,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 10000,
  creditLimitMin: 10000,
  creditLimitMax: 250000,
  gracePeriodDays: 55,
  imageUrl: 'https://www.cibeg.com/-/media/project/cib/product-cards/personal/cards/heya/hero-banner-thumbnail-english.jpg',
  applyUrl: 'https://www.cibeg.com/en/personal/cards/credit/heya',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Access to 15+ airport lounges', descriptionAr: 'دخول أكثر من 15 صالة مطار' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
  { benefitType: 'purchase_protection', descriptionEn: 'Purchase protection for 90 days', descriptionAr: 'حماية المشتريات لمدة 90 يوم' },
], [
  { category: 'general', cashbackPct: 0.01, maxCashbackEgpMonthly: 300 },
  { category: 'online_shopping', cashbackPct: 0.03, maxCashbackEgpMonthly: 200 },
], []);

insertCard('CIB', {
  nameEn: 'CIB Gold Credit Card',
  nameAr: 'بطاقة CIB الذهبية',
  tier: 'gold',
  annualFeeEgp: 400,
  interestRateMonthly: 0.032,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 7000,
  creditLimitMin: 5000,
  creditLimitMax: 100000,
  gracePeriodDays: 55,
  imageUrl: 'https://www.cibeg.com/-/media/project/cib/product-cards/personal/cards/gold/hero-banner-thumbnail-english.jpg',
  applyUrl: 'https://www.cibeg.com/en/personal/cards/credit',
}, [
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans at partners', descriptionAr: 'تقسيط بدون فوائد لدى الشركاء' },
], [], [
  { category: 'general', pointsPerEgp: 1, pointValueEgp: 0.01 },
]);

// ===================== NBE CARDS =====================

insertCard('National Bank of Egypt', {
  nameEn: 'NBE Visa Infinite',
  nameAr: 'بطاقة الأهلي فيزا إنفينيت',
  tier: 'infinite',
  annualFeeEgp: 5000,
  interestRateMonthly: 0.025,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 60000,
  creditLimitMin: 150000,
  creditLimitMax: 500000,
  gracePeriodDays: 56,
  applyUrl: 'https://www.nbe.com.eg',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Unlimited airport lounge access', descriptionAr: 'دخول غير محدود لصالات المطارات' },
  { benefitType: 'travel_insurance', descriptionEn: 'Premium travel insurance', descriptionAr: 'تأمين سفر متميز' },
  { benefitType: 'concierge', descriptionEn: '24/7 premium concierge', descriptionAr: 'كونسيرج متميز على مدار الساعة' },
  { benefitType: 'valet_parking', descriptionEn: 'Complimentary valet parking', descriptionAr: 'خدمة صف السيارات مجاناً' },
], [], [
  { category: 'general', pointsPerEgp: 2, pointValueEgp: 0.012 },
  { category: 'travel', pointsPerEgp: 4, pointValueEgp: 0.012 },
]);

insertCard('National Bank of Egypt', {
  nameEn: 'NBE World MasterCard',
  nameAr: 'بطاقة الأهلي وورلد ماستركارد',
  tier: 'world',
  annualFeeEgp: 3000,
  interestRateMonthly: 0.027,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 40000,
  creditLimitMin: 60000,
  creditLimitMax: 400000,
  gracePeriodDays: 56,
  applyUrl: 'https://www.nbe.com.eg',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Airport lounge access', descriptionAr: 'دخول صالات المطارات' },
  { benefitType: 'travel_insurance', descriptionEn: 'Travel insurance coverage', descriptionAr: 'تغطية تأمين السفر' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans up to 36 months', descriptionAr: 'تقسيط بدون فوائد حتى 36 شهر' },
], [], [
  { category: 'general', pointsPerEgp: 1.5, pointValueEgp: 0.012 },
  { category: 'travel', pointsPerEgp: 3, pointValueEgp: 0.012 },
]);

insertCard('National Bank of Egypt', {
  nameEn: 'NBE Visa Platinum',
  nameAr: 'بطاقة الأهلي فيزا بلاتينيوم',
  tier: 'platinum',
  annualFeeEgp: 1200,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 15000,
  creditLimitMin: 20000,
  creditLimitMax: 250000,
  gracePeriodDays: 56,
  applyUrl: 'https://www.nbe.com.eg',
}, [
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans at partner merchants', descriptionAr: 'تقسيط بدون فوائد لدى التجار الشركاء' },
  { benefitType: 'purchase_protection', descriptionEn: 'Purchase protection', descriptionAr: 'حماية المشتريات' },
], [], [
  { category: 'general', pointsPerEgp: 1, pointValueEgp: 0.01 },
]);

insertCard('National Bank of Egypt', {
  nameEn: 'NBE Visa Gold',
  nameAr: 'بطاقة الأهلي فيزا الذهبية',
  tier: 'gold',
  annualFeeEgp: 650,
  interestRateMonthly: 0.032,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 8000,
  creditLimitMin: 5000,
  creditLimitMax: 100000,
  gracePeriodDays: 56,
  applyUrl: 'https://www.nbe.com.eg',
}, [
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [], [
  { category: 'general', pointsPerEgp: 0.75, pointValueEgp: 0.01 },
]);

// ===================== HSBC CARDS =====================

insertCard('HSBC Egypt', {
  nameEn: 'HSBC Visa Platinum Cashback',
  nameAr: 'بطاقة HSBC فيزا بلاتينيوم كاش باك',
  tier: 'platinum',
  annualFeeEgp: 0,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 15000,
  creditLimitMin: 15000,
  creditLimitMax: 300000,
  gracePeriodDays: 56,
  imageUrl: 'https://www.hsbc.com.eg/content/dam/hsbc/hbeg/images/card-images/7786-cashback-credit-card-front-800x510.jpg',
  applyUrl: 'https://www.hsbc.com.eg/credit-cards/',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Access to 25 airport lounges worldwide', descriptionAr: 'دخول 25 صالة مطار حول العالم' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [
  { category: 'general', cashbackPct: 0.01 },
  { category: 'groceries', cashbackPct: 0.06, maxCashbackEgpMonthly: 300 },
  { category: 'dining', cashbackPct: 0.06, maxCashbackEgpMonthly: 300 },
  { category: 'fuel', cashbackPct: 0.06, maxCashbackEgpMonthly: 150 },
  { category: 'online_shopping', cashbackPct: 0.03, maxCashbackEgpMonthly: 250 },
], []);

insertCard('HSBC Egypt', {
  nameEn: 'HSBC Visa Platinum Rewards',
  nameAr: 'بطاقة HSBC فيزا بلاتينيوم ريواردز',
  tier: 'platinum',
  annualFeeEgp: 600,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 15000,
  creditLimitMin: 15000,
  creditLimitMax: 300000,
  gracePeriodDays: 56,
  imageUrl: 'https://www.hsbc.com.eg/content/dam/hsbc/hbeg/images/card-images/visa-platinum.png',
  applyUrl: 'https://www.hsbc.com.eg/credit-cards/',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Airport lounge access', descriptionAr: 'دخول صالات المطارات' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [], [
  { category: 'general', pointsPerEgp: 0.2, pointValueEgp: 0.05 },
  { category: 'dining', pointsPerEgp: 0.4, pointValueEgp: 0.05 },
  { category: 'travel', pointsPerEgp: 0.4, pointValueEgp: 0.05 },
]);

insertCard('HSBC Egypt', {
  nameEn: 'HSBC Advance MasterCard',
  nameAr: 'بطاقة HSBC أدفانس ماستركارد',
  tier: 'platinum',
  annualFeeEgp: 0,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 20000,
  creditLimitMin: 20000,
  creditLimitMax: 400000,
  gracePeriodDays: 56,
  imageUrl: 'https://www.hsbc.com.eg/content/dam/hsbc/hbeg/images/card-images/adv-mc-platinum.png',
  applyUrl: 'https://www.hsbc.com.eg/credit-cards/',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Airport lounge access', descriptionAr: 'دخول صالات المطارات' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [
  { category: 'general', cashbackPct: 0.01 },
  { category: 'groceries', cashbackPct: 0.06, maxCashbackEgpMonthly: 400 },
  { category: 'dining', cashbackPct: 0.06, maxCashbackEgpMonthly: 400 },
  { category: 'fuel', cashbackPct: 0.06, maxCashbackEgpMonthly: 200 },
], []);

insertCard('HSBC Egypt', {
  nameEn: 'HSBC Premier MasterCard',
  nameAr: 'بطاقة HSBC بريميير ماستركارد',
  tier: 'world',
  annualFeeEgp: 0,
  interestRateMonthly: 0.025,
  foreignTransactionFeePct: 0.025,
  minSalaryEgp: 50000,
  creditLimitMin: 50000,
  creditLimitMax: 700000,
  gracePeriodDays: 56,
  imageUrl: 'https://www.hsbc.com.eg/content/dam/hsbc/hbeg/images/card-images/17390-hsbc-premier-world-credit-card-face-800x510.jpg',
  applyUrl: 'https://www.hsbc.com.eg/credit-cards/',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Unlimited airport lounge access', descriptionAr: 'دخول غير محدود لصالات المطارات' },
  { benefitType: 'travel_insurance', descriptionEn: 'Comprehensive travel insurance', descriptionAr: 'تأمين سفر شامل' },
  { benefitType: 'concierge', descriptionEn: '24/7 concierge service', descriptionAr: 'خدمة كونسيرج على مدار الساعة' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [
  { category: 'general', cashbackPct: 0.02 },
  { category: 'groceries', cashbackPct: 0.06, maxCashbackEgpMonthly: 500 },
  { category: 'dining', cashbackPct: 0.06, maxCashbackEgpMonthly: 500 },
  { category: 'fuel', cashbackPct: 0.06, maxCashbackEgpMonthly: 300 },
  { category: 'travel', cashbackPct: 0.05, maxCashbackEgpMonthly: 500 },
], []);

// ===================== QNB CARDS =====================

insertCard('QNB Alahli', {
  nameEn: 'QNB Visa Signature',
  nameAr: 'بطاقة QNB فيزا سيجنتشر',
  tier: 'signature',
  annualFeeEgp: 3500,
  interestRateMonthly: 0.027,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 40000,
  creditLimitMin: 60000,
  creditLimitMax: 350000,
  gracePeriodDays: 57,
  applyUrl: 'https://www.qnb.com.eg',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Airport lounge access worldwide', descriptionAr: 'دخول صالات المطارات حول العالم' },
  { benefitType: 'travel_insurance', descriptionEn: 'Travel insurance with life coverage', descriptionAr: 'تأمين سفر مع تغطية تأمين على الحياة' },
  { benefitType: 'concierge', descriptionEn: 'Premium concierge service', descriptionAr: 'خدمة كونسيرج متميزة' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans up to 36 months', descriptionAr: 'تقسيط بدون فوائد حتى 36 شهر' },
], [], [
  { category: 'general', pointsPerEgp: 2, pointValueEgp: 0.01 },
  { category: 'online_shopping', pointsPerEgp: 3, pointValueEgp: 0.01 },
]);

insertCard('QNB Alahli', {
  nameEn: 'QNB Visa Platinum',
  nameAr: 'بطاقة QNB فيزا بلاتينيوم',
  tier: 'platinum',
  annualFeeEgp: 1500,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 15000,
  creditLimitMin: 20000,
  creditLimitMax: 200000,
  gracePeriodDays: 57,
  applyUrl: 'https://www.qnb.com.eg',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Airport lounge access', descriptionAr: 'دخول صالات المطارات' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans up to 36 months', descriptionAr: 'تقسيط بدون فوائد حتى 36 شهر' },
], [], [
  { category: 'general', pointsPerEgp: 2, pointValueEgp: 0.008 },
  { category: 'online_shopping', pointsPerEgp: 3, pointValueEgp: 0.008 },
]);

insertCard('QNB Alahli', {
  nameEn: 'QNB Visa Gold',
  nameAr: 'بطاقة QNB فيزا الذهبية',
  tier: 'gold',
  annualFeeEgp: 500,
  interestRateMonthly: 0.032,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 8000,
  creditLimitMin: 5000,
  creditLimitMax: 100000,
  gracePeriodDays: 57,
  applyUrl: 'https://www.qnb.com.eg',
}, [
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [], [
  { category: 'general', pointsPerEgp: 1, pointValueEgp: 0.008 },
]);

// ===================== BANQUE MISR CARDS =====================

insertCard('Banque Misr', {
  nameEn: 'Banque Misr Platinum',
  nameAr: 'بطاقة بنك مصر بلاتينيوم',
  tier: 'platinum',
  annualFeeEgp: 1000,
  interestRateMonthly: 0.03,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 15000,
  creditLimitMin: 15000,
  creditLimitMax: 200000,
  gracePeriodDays: 56,
  imageUrl: 'https://www.banquemisr.com/-/media/Landing-Pages/platinum-card-en.ashx',
  applyUrl: 'https://www.banquemisr.com',
}, [
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans up to 36 months', descriptionAr: 'تقسيط بدون فوائد حتى 36 شهر' },
  { benefitType: 'purchase_protection', descriptionEn: 'Purchase protection', descriptionAr: 'حماية المشتريات' },
], [], [
  { category: 'general', pointsPerEgp: 1, pointValueEgp: 0.01 },
]);

insertCard('Banque Misr', {
  nameEn: 'Banque Misr Titanium',
  nameAr: 'بطاقة بنك مصر تيتانيوم',
  tier: 'titanium',
  annualFeeEgp: 500,
  interestRateMonthly: 0.032,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 8000,
  creditLimitMin: 5000,
  creditLimitMax: 100000,
  gracePeriodDays: 56,
  imageUrl: 'https://www.banquemisr.com/-/media/Cards/Credit/04839-v1-Banque-Misr-MC-Titanium-Credit-Contactless.ashx',
  applyUrl: 'https://www.banquemisr.com',
}, [
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [], [
  { category: 'general', pointsPerEgp: 0.75, pointValueEgp: 0.01 },
]);

insertCard('Banque Misr', {
  nameEn: 'Banque Misr Classic',
  nameAr: 'بطاقة بنك مصر كلاسيك',
  tier: 'classic',
  annualFeeEgp: 200,
  interestRateMonthly: 0.035,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 5000,
  creditLimitMin: 3000,
  creditLimitMax: 50000,
  gracePeriodDays: 56,
  imageUrl: 'https://www.banquemisr.com/-/media/Retail-Cards/Credit/Classic-Credit-Cards.ashx',
  applyUrl: 'https://www.banquemisr.com',
}, [
  { benefitType: 'zero_installments', descriptionEn: 'Installment plans up to 36 months', descriptionAr: 'تقسيط حتى 36 شهر' },
], [], [
  { category: 'general', pointsPerEgp: 0.5, pointValueEgp: 0.01 },
]);

// ===================== AAIB CARDS =====================

insertCard('AAIB', {
  nameEn: 'AAIB MasterCard World Elite',
  nameAr: 'بطاقة AAIB ماستركارد وورلد إيليت',
  tier: 'world',
  annualFeeEgp: 4000,
  interestRateMonthly: 0.027,
  foreignTransactionFeePct: 0.025,
  minSalaryEgp: 50000,
  creditLimitMin: 100000,
  creditLimitMax: 500000,
  gracePeriodDays: 55,
  imageUrl: 'https://aaib.com/images/world-elite.png',
  applyUrl: 'https://aaib.com/individual/personal-banking/cards/credit-card',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Airport lounge access worldwide', descriptionAr: 'دخول صالات المطارات حول العالم' },
  { benefitType: 'travel_insurance', descriptionEn: 'Travel insurance coverage', descriptionAr: 'تغطية تأمين السفر' },
  { benefitType: 'concierge', descriptionEn: '24/7 concierge service', descriptionAr: 'خدمة كونسيرج على مدار الساعة' },
  { benefitType: 'purchase_protection', descriptionEn: 'Purchase protection', descriptionAr: 'حماية المشتريات' },
], [], [
  { category: 'general', pointsPerEgp: 2.5, pointValueEgp: 0.01 },
]);

insertCard('AAIB', {
  nameEn: 'AAIB Visa Platinum Cashback',
  nameAr: 'بطاقة AAIB فيزا بلاتينيوم كاش باك',
  tier: 'platinum',
  annualFeeEgp: 1200,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 15000,
  creditLimitMin: 15000,
  creditLimitMax: 250000,
  gracePeriodDays: 55,
  imageUrl: 'https://aaib.com/images/visa-platinum.png',
  applyUrl: 'https://aaib.com/individual/personal-banking/cards/credit-card',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Airport lounge access', descriptionAr: 'دخول صالات المطارات' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [
  { category: 'general', cashbackPct: 0.01, maxCashbackEgpMonthly: 2000 },
  { category: 'groceries', cashbackPct: 0.03, maxCashbackEgpMonthly: 500 },
  { category: 'dining', cashbackPct: 0.03, maxCashbackEgpMonthly: 500 },
  { category: 'online_shopping', cashbackPct: 0.02, maxCashbackEgpMonthly: 400 },
], []);

insertCard('AAIB', {
  nameEn: 'AAIB Visa Gold',
  nameAr: 'بطاقة AAIB فيزا الذهبية',
  tier: 'gold',
  annualFeeEgp: 450,
  interestRateMonthly: 0.032,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 8000,
  creditLimitMin: 5000,
  creditLimitMax: 80000,
  gracePeriodDays: 55,
  imageUrl: 'https://aaib.com/images/visa-gold.png',
  applyUrl: 'https://aaib.com/individual/personal-banking/cards/credit-card',
}, [
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [], [
  { category: 'general', pointsPerEgp: 1, pointValueEgp: 0.01 },
]);

// ===================== BANQUE DU CAIRE CARDS =====================

insertCard('Banque du Caire', {
  nameEn: 'BDC World Elite MasterCard',
  nameAr: 'بطاقة بنك القاهرة وورلد إيليت',
  tier: 'world',
  annualFeeEgp: 3500,
  interestRateMonthly: 0.027,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 40000,
  creditLimitMin: 50000,
  creditLimitMax: 400000,
  gracePeriodDays: 55,
  imageUrl: 'https://www.bdc.com.eg/bdcwebsite/dam/jcr:eb80b99d-7f41-4819-a640-2ab45149a7de/WorldElite.2022-04-03-13-15-46.png',
  applyUrl: 'https://www.bdc.com.eg',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Unlimited access to 25+ LoungeKey lounges', descriptionAr: 'دخول غير محدود لأكثر من 25 صالة LoungeKey' },
  { benefitType: 'travel_insurance', descriptionEn: 'Travel insurance', descriptionAr: 'تأمين سفر' },
  { benefitType: 'concierge', descriptionEn: 'Concierge service', descriptionAr: 'خدمة كونسيرج' },
  { benefitType: 'free_supplementary', descriptionEn: '2 free supplementary cards', descriptionAr: 'بطاقتان إضافيتان مجانيتان' },
], [], [
  { category: 'general', pointsPerEgp: 4, pointValueEgp: 0.005 },
]);

insertCard('Banque du Caire', {
  nameEn: 'BDC Gold Credit Card',
  nameAr: 'بطاقة بنك القاهرة الذهبية',
  tier: 'gold',
  annualFeeEgp: 400,
  interestRateMonthly: 0.032,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 8000,
  creditLimitMin: 5000,
  creditLimitMax: 100000,
  gracePeriodDays: 55,
  imageUrl: 'https://www.bdc.com.eg/bdcwebsite/dam/jcr:342bc4ef-bcbc-49bb-b413-3f41ccf64807/Visa-Gold.2022-04-03-13-16-47.png',
  applyUrl: 'https://www.bdc.com.eg',
}, [
  { benefitType: 'zero_installments', descriptionEn: 'Installment plans up to 60 months', descriptionAr: 'تقسيط حتى 60 شهر' },
], [], [
  { category: 'general', pointsPerEgp: 2, pointValueEgp: 0.005 },
]);

// ===================== MASHREQ CARDS =====================

insertCard('Mashreq Bank', {
  nameEn: 'Mashreq Platinum Rewards',
  nameAr: 'بطاقة المشرق بلاتينيوم ريواردز',
  tier: 'platinum',
  annualFeeEgp: 1500,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.0,
  minSalaryEgp: 15000,
  creditLimitMin: 20000,
  creditLimitMax: 1000000,
  gracePeriodDays: 55,
  imageUrl: 'https://mashreq.com/-/jssmedia/Images/Egypt/personal/cards/platinum-rewards',
  applyUrl: 'https://www.mashreq.com/en/egypt/personal/cards/',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Airport lounge access', descriptionAr: 'دخول صالات المطارات' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans up to 36 months', descriptionAr: 'تقسيط بدون فوائد حتى 36 شهر' },
  { benefitType: 'free_supplementary', descriptionEn: 'Up to 4 free supplementary cards', descriptionAr: 'حتى 4 بطاقات إضافية مجاناً' },
], [], [
  { category: 'general', pointsPerEgp: 3, pointValueEgp: 0.005 },
]);

insertCard('Mashreq Bank', {
  nameEn: 'Mashreq Dine Titanium',
  nameAr: 'بطاقة المشرق داين تيتانيوم',
  tier: 'titanium',
  annualFeeEgp: 800,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 10000,
  creditLimitMin: 10000,
  creditLimitMax: 500000,
  gracePeriodDays: 55,
  imageUrl: 'https://mashreq.com/-/jssmedia/Images/Egypt/personal/cards/dine-titanium',
  applyUrl: 'https://www.mashreq.com/en/egypt/personal/cards/',
}, [
  { benefitType: 'dining_discount', descriptionEn: '5% cashback on all dining', descriptionAr: '5% استرداد نقدي على جميع المطاعم' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [
  { category: 'dining', cashbackPct: 0.05, maxCashbackEgpMonthly: 500 },
  { category: 'general', cashbackPct: 0.01 },
], []);

insertCard('Mashreq Bank', {
  nameEn: 'Mashreq World Card',
  nameAr: 'بطاقة المشرق وورلد',
  tier: 'world',
  annualFeeEgp: 3000,
  interestRateMonthly: 0.027,
  foreignTransactionFeePct: 0.0,
  minSalaryEgp: 40000,
  creditLimitMin: 50000,
  creditLimitMax: 1000000,
  gracePeriodDays: 55,
  imageUrl: 'https://mashreq.com/-/jssmedia/Images/Egypt/personal/cards/world-card-list.ashx',
  applyUrl: 'https://www.mashreq.com/en/egypt/personal/cards/',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Unlimited airport lounge access', descriptionAr: 'دخول غير محدود لصالات المطارات' },
  { benefitType: 'travel_insurance', descriptionEn: 'Premium travel insurance', descriptionAr: 'تأمين سفر متميز' },
  { benefitType: 'concierge', descriptionEn: '24/7 concierge', descriptionAr: 'كونسيرج على مدار الساعة' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans up to 36 months', descriptionAr: 'تقسيط بدون فوائد حتى 36 شهر' },
], [], [
  { category: 'general', pointsPerEgp: 3, pointValueEgp: 0.008 },
  { category: 'travel', pointsPerEgp: 5, pointValueEgp: 0.008 },
]);

insertCard('Mashreq Bank', {
  nameEn: 'Mashreq NEO Plus',
  nameAr: 'بطاقة المشرق نيو بلس',
  tier: 'platinum',
  annualFeeEgp: 0,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 10000,
  creditLimitMin: 10000,
  creditLimitMax: 300000,
  gracePeriodDays: 55,
  applyUrl: 'https://www.mashreq.com/en/egypt/personal/cards/',
}, [
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [
  { category: 'general', cashbackPct: 0.01 },
  { category: 'groceries', cashbackPct: 0.03, maxCashbackEgpMonthly: 250 },
  { category: 'online_shopping', cashbackPct: 0.03, maxCashbackEgpMonthly: 250 },
], []);

// ===================== CREDIT AGRICOLE CARDS =====================

insertCard('Credit Agricole Egypt', {
  nameEn: 'Credit Agricole Visa Infinite',
  nameAr: 'بطاقة كريدي أجريكول فيزا إنفينيت',
  tier: 'infinite',
  annualFeeEgp: 4500,
  interestRateMonthly: 0.027,
  foreignTransactionFeePct: 0.025,
  minSalaryEgp: 50000,
  creditLimitMin: 100000,
  creditLimitMax: 500000,
  gracePeriodDays: 55,
  imageUrl: 'https://www.ca-egypt.com/app/uploads/2023/11/infinite-credit-card-1.jpg',
  applyUrl: 'https://www.ca-egypt.com',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Unlimited airport lounge access', descriptionAr: 'دخول غير محدود لصالات المطارات' },
  { benefitType: 'travel_insurance', descriptionEn: 'Comprehensive travel insurance', descriptionAr: 'تأمين سفر شامل' },
  { benefitType: 'concierge', descriptionEn: '24/7 concierge service', descriptionAr: 'خدمة كونسيرج على مدار الساعة' },
  { benefitType: 'purchase_protection', descriptionEn: 'Extended warranty up to 24 months', descriptionAr: 'ضمان ممتد حتى 24 شهر' },
], [
  { category: 'general', cashbackPct: 0.02 },
], [
  { category: 'general', pointsPerEgp: 2, pointValueEgp: 0.01 },
]);

insertCard('Credit Agricole Egypt', {
  nameEn: 'Credit Agricole Platinum',
  nameAr: 'بطاقة كريدي أجريكول بلاتينيوم',
  tier: 'platinum',
  annualFeeEgp: 1200,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 15000,
  creditLimitMin: 15000,
  creditLimitMax: 250000,
  gracePeriodDays: 55,
  imageUrl: 'https://www.ca-egypt.com/app/uploads/2023/11/platinum-credit-card-1.jpg',
  applyUrl: 'https://www.ca-egypt.com',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Airport lounge access', descriptionAr: 'دخول صالات المطارات' },
  { benefitType: 'zero_installments', descriptionEn: 'Taksit installment service 7-60 months', descriptionAr: 'خدمة تقسيط من 7 إلى 60 شهر' },
  { benefitType: 'purchase_protection', descriptionEn: 'Purchase protection and extended warranty', descriptionAr: 'حماية المشتريات وضمان ممتد' },
], [], [
  { category: 'general', pointsPerEgp: 1, pointValueEgp: 0.01 },
]);

insertCard('Credit Agricole Egypt', {
  nameEn: 'Credit Agricole Classic',
  nameAr: 'بطاقة كريدي أجريكول كلاسيك',
  tier: 'classic',
  annualFeeEgp: 250,
  interestRateMonthly: 0.035,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 5000,
  creditLimitMin: 3000,
  creditLimitMax: 50000,
  gracePeriodDays: 55,
  applyUrl: 'https://www.ca-egypt.com',
}, [
  { benefitType: 'zero_installments', descriptionEn: 'Taksit installment service', descriptionAr: 'خدمة تقسيط' },
], [], [
  { category: 'general', pointsPerEgp: 0.5, pointValueEgp: 0.01 },
]);

// ===================== ALEXBANK CARDS =====================

insertCard('ALEXBANK', {
  nameEn: 'ALEXBANK World Credit Card',
  nameAr: 'بطاقة بنك الإسكندرية وورلد',
  tier: 'world',
  annualFeeEgp: 3000,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.027,
  minSalaryEgp: 30000,
  creditLimitMin: 50000,
  creditLimitMax: 350000,
  gracePeriodDays: 55,
  imageUrl: 'https://res.cloudinary.com/alex-bank/image/upload/fl_lossy/c_scale,w_auto/f_auto,q_auto/dpr_auto/v1684228896/New_cards_2023/Com_9_CC_2023_w',
  applyUrl: 'https://www.alexbank.com/en/retail/cards/world-credit-card',
}, [
  { benefitType: 'lounge_access', descriptionEn: 'Airport lounge access', descriptionAr: 'دخول صالات المطارات' },
  { benefitType: 'travel_insurance', descriptionEn: 'Travel insurance', descriptionAr: 'تأمين سفر' },
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
  { benefitType: 'purchase_protection', descriptionEn: 'Purchase protection', descriptionAr: 'حماية المشتريات' },
], [
  { category: 'general', cashbackPct: 0.01 },
], [
  { category: 'general', pointsPerEgp: 1.5, pointValueEgp: 0.01 },
]);

insertCard('ALEXBANK', {
  nameEn: 'ALEXBANK Platinum Credit Card',
  nameAr: 'بطاقة بنك الإسكندرية بلاتينيوم',
  tier: 'platinum',
  annualFeeEgp: 1000,
  interestRateMonthly: 0.029,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 15000,
  creditLimitMin: 15000,
  creditLimitMax: 200000,
  gracePeriodDays: 55,
  imageUrl: 'https://res.cloudinary.com/alex-bank/image/upload/fl_lossy/c_scale,w_auto/f_auto,q_auto/dpr_auto/v1684228895/New_cards_2023/Com_9_CC_2023_P',
  applyUrl: 'https://www.alexbank.com',
}, [
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [], [
  { category: 'general', pointsPerEgp: 1, pointValueEgp: 0.01 },
]);

insertCard('ALEXBANK', {
  nameEn: 'ALEXBANK Gold Credit Card',
  nameAr: 'بطاقة بنك الإسكندرية الذهبية',
  tier: 'gold',
  annualFeeEgp: 400,
  interestRateMonthly: 0.032,
  foreignTransactionFeePct: 0.03,
  minSalaryEgp: 7000,
  creditLimitMin: 5000,
  creditLimitMax: 80000,
  gracePeriodDays: 55,
  imageUrl: 'https://res.cloudinary.com/alex-bank/image/upload/fl_lossy/c_scale,w_auto/f_auto,q_auto/dpr_auto/v1684228896/New_cards_2023/Com_9_CC_2023_g',
  applyUrl: 'https://www.alexbank.com',
}, [
  { benefitType: 'zero_installments', descriptionEn: '0% installment plans', descriptionAr: 'تقسيط بدون فوائد' },
], [], [
  { category: 'general', pointsPerEgp: 0.75, pointValueEgp: 0.01 },
]);

// ===================== SUMMARY =====================
const bankCount = sqlite.prepare('SELECT COUNT(*) as count FROM banks').get() as { count: number };
const cardCount = sqlite.prepare('SELECT COUNT(*) as count FROM cards').get() as { count: number };
const benefitCount = sqlite.prepare('SELECT COUNT(*) as count FROM card_benefits').get() as { count: number };
const cashbackCount = sqlite.prepare('SELECT COUNT(*) as count FROM card_cashback').get() as { count: number };
const rewardCount = sqlite.prepare('SELECT COUNT(*) as count FROM card_rewards').get() as { count: number };

console.log(`\nSeed complete!`);
console.log(`  Banks: ${bankCount.count}`);
console.log(`  Cards: ${cardCount.count}`);
console.log(`  Benefits: ${benefitCount.count}`);
console.log(`  Cashback entries: ${cashbackCount.count}`);
console.log(`  Reward entries: ${rewardCount.count}`);

sqlite.close();
