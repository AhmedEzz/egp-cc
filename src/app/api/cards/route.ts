import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const cards = await db.query.cards.findMany({
    where: (cards, { eq }) => eq(cards.isActive, true),
    with: {
      bank: true,
      benefits: true,
      cashback: true,
      rewards: true,
    },
  });

  return NextResponse.json(cards);
}
