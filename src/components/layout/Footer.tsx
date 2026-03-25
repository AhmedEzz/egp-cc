'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="border-t border-border bg-muted mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground text-center mb-2">
          {t('disclaimer')}
        </p>
        <p className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} {t('copyright')}
        </p>
      </div>
    </footer>
  );
}
