import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: {
    template: '%s | Nexmarto',
    default: 'Nexmarto - India\'s Premium B2B Marketplace',
  },
  description: 'Connect with verified wholesale suppliers, manufacturers, and exporters. The most reliable B2B marketplace for sourcing quality products.',
  keywords: ['B2B marketplace', 'wholesale suppliers', 'manufacturers', 'exporters', 'buy wholesale', 'Nexmarto'],
  openGraph: {
    title: 'Nexmarto - India\'s Premium B2B Marketplace',
    description: 'Connect with verified wholesale suppliers and manufacturers.',
    url: 'https://nexmarto.com',
    siteName: 'Nexmarto',
    images: [
      {
        url: 'https://nexmarto.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { ThemeProvider } from '@/components/ThemeProvider';
import { FeedbackModal } from '@/components/FeedbackModal';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
            <FeedbackModal />
            <Toaster richColors position="top-right" />
          </ReactQueryProvider>
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
