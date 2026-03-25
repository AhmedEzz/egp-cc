import { db } from '@/lib/db';
import { rankCards } from '@/lib/scoring';
import type { SpendingProfile } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const profile: SpendingProfile = await request.json();

    if (!profile.monthlyIncome || profile.monthlyIncome <= 0) {
      return NextResponse.json({ error: 'Invalid income' }, { status: 400 });
    }

    const cards = await db.query.cards.findMany({
      where: (cards, { eq }) => eq(cards.isActive, true),
      with: {
        bank: true,
        benefits: true,
        cashback: true,
        rewards: true,
      },
    });

    const results = rankCards(profile, cards as any);

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
