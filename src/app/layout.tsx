import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ClientProviders from '@/components/ClientProviders';
import { ToastProvider } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Polkadot DeFi Flow Platform',
  description: 'Cross-chain DeFi automation platform for Polkadot ecosystem',
  keywords: 'Polkadot, DeFi, XCM, Cross-chain, Automation, Workflow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
        <ThemeProvider>
          <ClientProviders>
            {children}
          </ClientProviders>
        </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
