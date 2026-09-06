import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { GovHeader } from '@/components/layout/GovHeader';
import { GovNav } from '@/components/layout/GovNav';
import { GovFooter } from '@/components/layout/GovFooter';

export const metadata: Metadata = {
  title: 'National Land Acquisition & Management System | MoRD, Govt of India',
  description:
    'Real-Time National Land Acquisition & Management System for End-to-End Digital Monitoring and Decision Support under RFCTLARR Act, 2013 (SIH PS 26016)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Providers>
          <GovHeader />
          <GovNav />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6">
            {children}
          </main>
          <GovFooter />
        </Providers>
      </body>
    </html>
  );
}
