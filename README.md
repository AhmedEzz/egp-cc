# CardCompare Egypt

A bilingual (English/Arabic) web app that helps users in Egypt find the best credit card based on their actual spending habits and lifestyle preferences.

## Features

- **Smart Questionnaire** — 4-step form: income, spending by category, lifestyle preferences, card tier
- **Scoring Algorithm** — Ranks cards by estimated annual savings (cashback + rewards - fees) and preference match
- **32+ Credit Cards** from 10 Egyptian banks: CIB, NBE, HSBC, QNB, Banque Misr, AAIB, Banque du Caire, Mashreq, Credit Agricole, ALEXBANK
- **Bilingual** — Full English and Arabic (RTL) support
- **Card Details** — Benefits breakdown, cashback rates, rewards, fees, and eligibility
- **Side-by-Side Comparison** — Compare up to 3 cards

## Tech Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4** + Lucide Icons
- **Drizzle ORM** + SQLite (better-sqlite3)
- **next-intl** for i18n with locale routing (`/en/`, `/ar/`)

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/AhmedEzz/egp-cc.git
cd egp-cc
npm install
```

### Seed the Database

```bash
npm run db:seed
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Deployment (AWS Free Tier)

A deployment script is included for EC2 (t2.micro, Amazon Linux 2023):

```bash
ssh -i your-key.pem ec2-user@<ec2-public-ip>
git clone https://github.com/AhmedEzz/egp-cc.git /home/ec2-user/app
cd /home/ec2-user/app
bash deploy.sh
```

The script installs Node.js, PM2, Nginx, seeds the DB, builds the app, and starts everything.

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Locale-based routing (en/ar)
│   │   ├── page.tsx       # Landing page
│   │   ├── compare/       # Questionnaire page
│   │   ├── results/       # Ranked results page
│   │   └── card/[id]/     # Card detail page
│   └── api/
│       ├── cards/         # GET cards with filters
│       └── compare/       # POST spending profile, returns ranked cards
├── components/
│   ├── cards/             # Card display, comparison table
│   ├── layout/            # Header, footer, language switcher
│   └── questionnaire/     # Step components (income, spending, preferences, tier)
├── i18n/                  # Internationalization config
└── lib/
    ├── db/                # Drizzle schema, seed data, connection
    ├── scoring.ts         # Card ranking algorithm
    └── types.ts           # TypeScript interfaces
```

## How Scoring Works

1. Filter cards by eligibility (income >= minimum salary, tier match)
2. Calculate annual cashback per spending category
3. Calculate annual rewards value per spending category
4. Net value = max(cashback, rewards) - annual fee
5. Preference match score (lifestyle benefits the card offers)
6. Overall = 60% net value + 40% preference match
7. Ranked descending

## License

MIT
