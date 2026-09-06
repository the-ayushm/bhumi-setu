import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { LayoutShell } from '@/components/layout/LayoutShell';

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
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
