import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { companyConfig } from '@/data/companyConfig';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const viewport: Viewport = {
  themeColor: '#123D2A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: `${companyConfig.name} — ${companyConfig.tagline}`,
  description:
    'Premier rice milling and processing enterprise based in Mwea, Kirinyaga County, Kenya. Pure Mwea Pishori Grade 1, Super Long Grain, and commercial wholesale supply.',
  keywords: [
    'Top Grade Rice Millers',
    'Rice millers in Mwea',
    'Rice milling in Mwea',
    'Rice millers in Kirinyaga',
    'Mwea rice',
    'Pure Pishori Kenya',
    'Rice suppliers in Kenya',
    'Rice wholesale Kenya',
    'Rice milling services Kenya',
    'Mwea Irrigation Scheme',
  ],
  authors: [{ name: companyConfig.name }],
  creator: companyConfig.name,
  publisher: companyConfig.name,
  metadataBase: new URL('https://www.topgradericemillers.co.ke'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${companyConfig.name} — ${companyConfig.tagline}`,
    description:
      'Quality-focused rice milling and processing from the heart of Mwea, Kirinyaga County. Serving households, hospitality, and institutions nationwide.',
    url: 'https://www.topgradericemillers.co.ke',
    siteName: companyConfig.name,
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${companyConfig.name} — ${companyConfig.tagline}`,
    description: 'Premium Rice. Proudly Milled in Mwea, Kirinyaga County, Kenya.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'KE-Kirinyaga',
    'geo.placename': 'Mwea, Wanguru',
    'geo.position': '-0.6277;37.3597',
    'ICBM': '-0.6277, 37.3597',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Comprehensive Schema.org Structured Data Graph for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': 'https://www.topgradericemillers.co.ke/#organization',
        name: companyConfig.name,
        alternateName: ['Top Grade Rice', 'TGRM Mwea'],
        slogan: 'Home of Pure Pishori',
        description: companyConfig.subheadline,
        url: 'https://www.topgradericemillers.co.ke',
        logo: 'https://www.topgradericemillers.co.ke/logo.jpg',
        image: 'https://www.topgradericemillers.co.ke/logo.jpg',
        telephone: companyConfig.contact.phoneDisplay,
        email: companyConfig.contact.email,
        priceRange: '$$',
        currenciesAccepted: 'KES',
        paymentAccepted: 'Cash, Credit Card, Bank Transfer, M-Pesa',
        areaServed: {
          '@type': 'Country',
          name: 'Kenya',
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: companyConfig.location.landmark,
          addressLocality: companyConfig.location.town,
          addressRegion: companyConfig.location.county,
          addressCountry: 'KE',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: companyConfig.location.coordinates.lat,
          longitude: companyConfig.location.coordinates.lng,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '07:30',
            closes: '17:30',
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Saturday'],
            opens: '08:00',
            closes: '14:00',
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.topgradericemillers.co.ke/#website',
        url: 'https://www.topgradericemillers.co.ke',
        name: companyConfig.name,
        description: companyConfig.tagline,
        publisher: {
          '@id': 'https://www.topgradericemillers.co.ke/#organization',
        },
      },
      {
        '@type': 'ItemList',
        name: 'Top Grade Rice Millers Pure Mwea Rice Selections',
        itemListElement: [
          {
            '@type': 'Product',
            name: 'Mwea Pure Pishori (Grade 1)',
            description:
              'The definitive aromatic Kenyan long-grain rice, celebrated for slender kernel profile and natural aroma.',
            category: 'Aromatic Premium Rice',
            brand: {
              '@type': 'Brand',
              name: 'Top Grade Rice Millers',
            },
            countryOfOrigin: 'Kenya',
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'KES',
              availability: 'https://schema.org/InStock',
            },
          },
          {
            '@type': 'Product',
            name: 'Classic Super Long Grain',
            description:
              'Premium non-sticky slender grain rice ideal for commercial catering, pilau, and high-volume kitchens.',
            category: 'Long Grain Milled Rice',
            brand: {
              '@type': 'Brand',
              name: 'Top Grade Rice Millers',
            },
            countryOfOrigin: 'Kenya',
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'KES',
              availability: 'https://schema.org/InStock',
            },
          },
        ],
      },
    ],
  };

  // Prevent script tag injection by escaping < characters
  const safeJsonLdString = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdString }}
        />
      </head>
      <body className="font-sans antialiased bg-warm-rice text-charcoal min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
