'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DefaultCardImage } from './DefaultCardImage';

export function CardImage({
  imageUrl,
  tier,
  bankName,
  cardName,
  size = 'md',
}: {
  imageUrl: string | null;
  tier: string;
  bankName: string;
  cardName: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-28',
    md: 'w-44',
    lg: 'w-64',
  };

  if (!imageUrl || hasError) {
    return (
      <DefaultCardImage
        tier={tier}
        bankName={bankName}
        cardName={cardName}
        className={sizeClasses[size]}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} shrink-0`}>
      <Image
        src={imageUrl}
        alt={cardName}
        width={size === 'lg' ? 320 : size === 'md' ? 220 : 140}
        height={size === 'lg' ? 202 : size === 'md' ? 139 : 88}
        className="rounded-xl shadow-lg object-cover w-full"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}
