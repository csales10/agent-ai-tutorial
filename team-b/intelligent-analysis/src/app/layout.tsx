import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SideNav } from '@/components/SideNav';
import { TopBar } from '@/components/TopBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Intelligent Analysis · SAP B1',
  description: 'AI-powered fraud detection and month-end close for SAP Business One',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var stored = localStorage.getItem('theme');
            var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (stored === 'dark' || (!stored && prefersDark)) {
              document.documentElement.classList.add('dark');
            }
          })();
        `}} />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
          <SideNav />
          <div className="flex-1 ml-56 flex flex-col min-h-screen">
            <TopBar />
            <main className="flex-1 mt-14 p-6 max-w-screen-2xl mx-auto w-full">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
