import type { Metadata } from 'next';
import './globals.css';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { SmartAssistantWidget } from '@/components/SmartAssistantWidget';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';

export const metadata: Metadata = {
  metadataBase: new URL('https://farmtohome.store'),
  title: {
    default: 'Farm to Home | Fresh from the Farm to Your Doorstep | farmtohome.store',
    template: '%s | Farm to Home',
  },
  description:
    'Farm to Home (farmtohome.store) connects verified organic farmers directly with families and kitchens across Andhra Pradesh & India. Shop fresh vegetables, heirloom seeds, vermicompost, khadi apparel, and direct harvest.',
  keywords: [
    'Farm to Home',
    'farm to home',
    'farmtohome',
    'farm to home store',
    'farmtohome.store',
    'farm to home online',
    'farm fresh produce',
    'organic vegetables delivery',
    'andhra pradesh farm delivery',
    'vijayawada organic store',
    'desi seeds',
    'vermicompost online',
    'neem cake',
    'farm passport traceability',
    'indian harvest calendar',
    'kisan direct market',
    'seller portal farm',
  ],
  authors: [{ name: 'Farm to Home', url: 'https://farmtohome.store' }],
  creator: 'Farm to Home',
  publisher: 'Farm to Home',
  applicationName: 'Farm to Home',
  alternates: {
    canonical: 'https://farmtohome.store',
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
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://farmtohome.store',
    siteName: 'Farm to Home',
    title: 'Farm to Home | Fresh from the Farm. Naturally to Your Home.',
    description:
      'Official Farm to Home Marketplace (farmtohome.store). Buy direct from local farmers with verified farm passport origin and fast cold-chain delivery.',
    images: [
      {
        url: '/logo.jpeg',
        width: 800,
        height: 600,
        alt: 'Farm to Home Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Farm to Home | Fresh Organic Farm Marketplace',
    description:
      'Buy directly from organic farmers across Andhra Pradesh & India on farmtohome.store.',
    images: ['/logo.jpeg'],
  },
  icons: {
    icon: '/logo.jpeg',
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
  manifest: '/site.webmanifest',
};

// JSON-LD Structured Data for Google Search Rich Results & Brand Authority
const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Farm to Home',
  alternateName: ['Farm to Home Store', 'FarmToHome', 'farmtohome.store', 'Farm to Home India'],
  url: 'https://farmtohome.store',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://farmtohome.store/shop?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Farm to Home',
  url: 'https://farmtohome.store',
  logo: 'https://farmtohome.store/logo.jpeg',
  description:
    'Direct agricultural e-commerce connecting verified Indian farmers directly with families, terrace gardeners, and conscious consumers.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Vijayawada',
    addressRegion: 'Andhra Pradesh',
    postalCode: '520001',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-98480-12345',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Telugu', 'Hindi'],
  },
};

const jsonLdOnlineStore = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: 'Farm to Home Online Store',
  url: 'https://farmtohome.store',
  priceRange: '₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Razorpay, UPI, Cash on Delivery, Credit Card, Net Banking',
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Andhra Pradesh, India',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOnlineStore) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FDFBF7] text-forest-950 antialiased selection:bg-harvest-300 selection:text-forest-950">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AnnouncementBar />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
              <SmartAssistantWidget />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
