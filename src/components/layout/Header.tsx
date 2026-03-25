'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CreditCard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const t = useTranslations('common');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl">
          <CreditCard className="w-6 h-6" />
          <span className="hidden sm:inline">{t('siteName')}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-foreground hover:text-primary transition-colors">
            {t('home')}
          </Link>
          <Link href="/compare" className="text-sm text-foreground hover:text-primary transition-colors">
            {t('compare')}
          </Link>
          <LanguageSwitcher />
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-4">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm text-foreground hover:text-primary">
            {t('home')}
          </Link>
          <Link href="/compare" onClick={() => setMenuOpen(false)} className="text-sm text-foreground hover:text-primary">
            {t('compare')}
          </Link>
          <LanguageSwitcher />
        </div>
      )}
    </header>
  );
}
