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
  title: 'Farm to Home | Fresh from the Farm. Naturally to Your Home.',
  description:
    'AI-Powered Agricultural E-Commerce and Organic Farming Community Platform connecting verified Indian farmers directly with families, terrace gardeners, and sustainable food lovers.',
  keywords: [
    'organic farming',
    'farm fresh produce',
    'desi seeds',
    'vermicompost',
    'neem cake',
    'farm passport',
    'harvest calendar',
    'farm waste exchange',
    'kisan market',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
