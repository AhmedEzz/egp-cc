import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CreditCard, Search, BarChart3, Globe, Users, Zap, Languages } from 'lucide-react';

const BANK_NAMES = [
  'CIB', 'NBE', 'HSBC', 'QNB', 'Banque Misr',
  'AAIB', 'Banque du Caire', 'Mashreq', 'Credit Agricole', 'ALEXBANK',
];

export default function HomePage() {
  const t = useTranslations('landing');
  const tc = useTranslations('common');

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CreditCard className="w-4 h-4" />
            {tc('siteName')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            <Search className="w-5 h-5" />
            {t('cta')}
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('howItWorksTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: CreditCard, title: t('step1Title'), desc: t('step1Desc'), step: '1' },
              { icon: BarChart3, title: t('step2Title'), desc: t('step2Desc'), step: '2' },
              { icon: Search, title: t('step3Title'), desc: t('step3Desc'), step: '3' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm font-bold text-primary mb-2">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('featuresTitle')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: t('feature1Title'), desc: t('feature1Desc') },
              { icon: Zap, title: t('feature2Title'), desc: t('feature2Desc') },
              { icon: Globe, title: t('feature3Title'), desc: t('feature3Desc') },
              { icon: Languages, title: t('feature4Title'), desc: t('feature4Desc') },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-border">
                <item.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Banks */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">{t('supportedBanks')}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {BANK_NAMES.map((name) => (
              <div
                key={name}
                className="px-6 py-3 bg-muted rounded-lg text-sm font-medium text-muted-foreground border border-border"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
