'use client';

import { usePathname } from 'next/navigation';
import { Search, Bell, Mail } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':    { title: 'Dashboard',       subtitle: 'Monitor, score, and flag SAP B1 transactions with AI' },
  '/fraud':        { title: 'Fraud Detection', subtitle: 'AI pattern analysis across 5 fraud vectors' },
  '/month-end':    { title: 'Month-End Close', subtitle: 'Automated GL reconciliation and close checklist' },
  '/audit-report': { title: 'Audit Report',    subtitle: 'Compliance-ready report aggregating all pipeline stages' },
};

export function TopBar() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? { title: 'Intelligent Analysis', subtitle: 'SAP B1 AI-powered financial oversight' };

  return (
    <div className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 fixed top-0 right-0 left-56 z-20 transition-colors print:hidden">

      {/* Left: Page title */}
      <div>
        <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">{meta.title}</h1>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none">{meta.subtitle}</p>
      </div>

      {/* Center: Search (coming soon) */}
      <div className="flex-1 max-w-xs mx-6">
        <div className="relative" title="Search coming soon">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
          <input
            type="text"
            placeholder="Search transactions..."
            disabled
            aria-label="Search transactions (coming soon)"
            className="w-full pl-8 pr-28 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-400 dark:text-gray-600 placeholder-gray-300 dark:placeholder-gray-600 cursor-not-allowed opacity-60"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5">
            coming soon
          </span>
        </div>
      </div>

      {/* Right: Icons + user */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <button
          aria-label="Messages (coming soon)"
          title="Messages (coming soon)"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <Mail size={16} aria-hidden="true" />
        </button>

        <button
          aria-label="Notifications (coming soon)"
          title="Notifications (coming soon)"
          className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <Bell size={16} aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 ml-2 border-l border-gray-200 dark:border-gray-700">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shrink-0" aria-hidden="true">
            <span className="text-white text-[10px] font-bold">IA</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none">Demo User</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none">demo@sapb1.local</p>
          </div>
        </div>
      </div>
    </div>
  );
}
