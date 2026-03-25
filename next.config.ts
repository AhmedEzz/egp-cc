import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.cibeg.com' },
      { protocol: 'https', hostname: 'www.nbe.com.eg' },
      { protocol: 'https', hostname: 'www.hsbc.com.eg' },
      { protocol: 'https', hostname: 'www.qnb.com.eg' },
      { protocol: 'https', hostname: 'www.banquemisr.com' },
      { protocol: 'https', hostname: 'aaib.com' },
      { protocol: 'https', hostname: 'www.bdc.com.eg' },
      { protocol: 'https', hostname: 'mashreq.com' },
      { protocol: 'https', hostname: 'www.mashreq.com' },
      { protocol: 'https', hostname: 'www.ca-egypt.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'www.alexbank.com' },
    ],
  },
};

export default withNextIntl(nextConfig);
