'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldAlert,
  ClipboardCheck,
  FileText,
  Database,
  Activity,
} from 'lucide-react';
import { getMockData } from '@/lib/mock-data';
import { runFraudRules } from '@/lib/fraud-rules';

const MENU_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/fraud',        label: 'Fraud Detection', icon: ShieldAlert     },
  { href: '/month-end',    label: 'Month-End Close', icon: ClipboardCheck  },
  { href: '/audit-report', label: 'Audit Report',    icon: FileText        },
];

const GENERAL_ITEMS = [
  { href: '/api/sap/journal-entries', label: 'SAP B1 Data', icon: Database, target: '_blank' },
  { href: '#',                       label: 'API Health (soon)', icon: Activity,  target: undefined },
];

// Derive real counts from mock data
const _data = getMockData();
const _fraudAlerts = runFraudRules(_data);
const FRAUD_BADGE = _fraudAlerts.filter((a) => a.riskLevel === 'Critical' || a.riskLevel === 'High').length;

const DATA_STATS = [
  { label: 'Journal Entries', count: (_data.journalEntries as any[]).length },
  { label: 'Payments',        count: (_data.payments as any[]).length        },
  { label: 'Vendors',         count: (_data.vendors as any[]).length         },
  { label: 'GL Accounts',     count: (_data.chartOfAccounts as any[]).length },
];
const TOTAL_RECORDS = DATA_STATS.reduce((s, d) => s + d.count, 0);

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col z-30 transition-colors">

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">IA</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">Intelligent</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-none mt-0.5">Analysis</p>
        </div>
      </div>

      {/* ── Nav items ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">

        {/* MENU */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-2">
            Menu
          </p>
          <nav className="space-y-0.5">
            {MENU_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              const badge = href === '/fraud' && FRAUD_BADGE > 0 ? FRAUD_BADGE : null;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300'
                  }`}
                >
                  <Icon
                    size={15}
                    className={active ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className="flex-1">{label}</span>
                  {badge !== null && (
                    <span
                      className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        active ? 'bg-white text-blue-700' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* GENERAL */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-2">
            General
          </p>
          <nav className="space-y-0.5">
            {GENERAL_ITEMS.map(({ href, label, icon: Icon, target }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  target={target}
                  rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300'
                  }`}
                >
                  <Icon
                    size={15}
                    className={active ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'}
                    strokeWidth={2}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Bottom banner ─────────────────────────────────── */}
      <div className="mx-3 mb-4 bg-blue-700 dark:bg-blue-900 rounded-xl p-3.5">
        <p className="text-[10px] font-semibold text-blue-200 uppercase tracking-widest mb-1">
          SAP B1 Mock
        </p>
        <p className="text-white text-sm font-bold leading-tight">6 data files loaded</p>
        <p className="text-blue-200 text-xs mt-0.5">{TOTAL_RECORDS} total records</p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3">
          {DATA_STATS.map((d) => (
            <div key={d.label} className="flex items-center justify-between">
              <span className="text-blue-300 text-[10px]">{d.label}</span>
              <span className="text-white text-[10px] font-bold">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
