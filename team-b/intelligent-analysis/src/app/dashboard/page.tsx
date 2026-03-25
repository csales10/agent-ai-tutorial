'use client';

import { useState } from 'react';
import { getMockData } from '@/lib/mock-data';
import { scoreTransactions } from '@/lib/risk-scorer';
import type { RiskLevel } from '@/lib/risk-scorer';
import { JournalEntriesTable, PaymentsTable, RiskFilterBar } from '@/components/MonitorTable';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ArrowUpRight } from 'lucide-react';


const RISK_LEVELS: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low', 'Clean'];
const BAR_COLORS: Record<RiskLevel, string> = {
  Critical: 'bg-red-500', High: 'bg-orange-400', Medium: 'bg-yellow-400', Low: 'bg-blue-400', Clean: 'bg-blue-500',
};
const DOT_COLORS: Record<RiskLevel, string> = {
  Critical: 'bg-red-500', High: 'bg-orange-400', Medium: 'bg-yellow-400', Low: 'bg-blue-400', Clean: 'bg-blue-500',
};

export default function DashboardPage() {
  const { journalEntries, payments, summary } = scoreTransactions(getMockData());

  const KPI_CARDS = [
    { label: 'Total Transactions', value: summary.totalTransactions,  sub: 'All documents',       dark: true  },
    { label: 'Clean',              value: summary.riskBreakdown.Clean, sub: 'No anomalies',        dark: false, accent: 'text-blue-600 dark:text-blue-400' },
    { label: 'Flagged',            value: summary.flaggedCount,        sub: `${Math.round((summary.flaggedCount / summary.totalTransactions) * 100)}% of total`, dark: false, accent: 'text-orange-500' },
    { label: 'Critical Alerts',   value: summary.criticalCount,       sub: 'Immediate action',    dark: false, accent: 'text-red-600' },
  ];

  const all = [...journalEntries, ...payments];
  const counts = {
    All:      all.length,
    Critical: all.filter((t) => t.riskLevel === 'Critical').length,
    High:     all.filter((t) => t.riskLevel === 'High').length,
    Medium:   all.filter((t) => t.riskLevel === 'Medium').length,
    Low:      all.filter((t) => t.riskLevel === 'Low').length,
    Clean:    all.filter((t) => t.riskLevel === 'Clean').length,
  };

  const [filter, setFilter] = useState<RiskLevel | 'All'>('All');
  const jeCount = filter === 'All' ? journalEntries.length : journalEntries.filter(e => e.riskLevel === filter).length;
  const pyCount = filter === 'All' ? payments.length : payments.filter(p => p.riskLevel === filter).length;

  return (
    <ErrorBoundary>
    <div>
      {/* Action bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Transaction Monitor</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Stage M1 · Mock SAP B1 data with rule-based risk scoring</p>
        </div>
        <div className="flex gap-2">
          <button className="text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
            View All
          </button>
          <button className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5">
            + New Analysis
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {KPI_CARDS.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl p-5 border relative overflow-hidden ${
              card.dark
                ? 'bg-blue-700 dark:bg-blue-800 border-blue-700 dark:border-blue-800 text-white'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
            }`}
          >
            <div className={`absolute top-3 right-3 w-6 h-6 rounded-md flex items-center justify-center ${
              card.dark ? 'bg-blue-600 dark:bg-blue-700' : 'bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600'
            }`}>
              <ArrowUpRight size={13} className={card.dark ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'} />
            </div>
            <p className={`text-xs font-medium mb-2 ${card.dark ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
              {card.label}
            </p>
            <p className={`text-4xl font-bold leading-none ${card.dark ? 'text-white' : (card.accent ?? 'text-gray-900 dark:text-gray-100')}`}>
              {card.value}
            </p>
            <p className={`text-xs mt-2 ${card.dark ? 'text-blue-300' : 'text-gray-400 dark:text-gray-500'}`}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        {/* Risk breakdown */}
        <div className="col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Risk Breakdown</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Click any row to expand flag details</p>
          </div>
          <div className="flex h-4 rounded-lg overflow-hidden mb-3">
            {RISK_LEVELS.map((level) => {
              const pct = (summary.riskBreakdown[level] / summary.totalTransactions) * 100;
              return pct > 0 ? (
                <div key={level} className={BAR_COLORS[level]} style={{ width: `${pct}%` }} title={`${level}: ${summary.riskBreakdown[level]}`} />
              ) : null;
            })}
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            {RISK_LEVELS.map((level) => (
              <span key={level} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <span className={`w-2.5 h-2.5 rounded-full ${DOT_COLORS[level]}`} />
                {level} <span className="text-gray-400 dark:text-gray-500">({summary.riskBreakdown[level]})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Exposure + pipeline */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Exposure Summary</p>
          <p className="text-2xl font-bold text-red-600 leading-none">
            ₱{summary.totalExposure.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-4">High + Critical risk</p>
          <div className="space-y-2.5">
            {[
              { label: 'Capture', sub: 'All transactions loaded', count: summary.totalTransactions,                                       color: 'bg-blue-400' },
              { label: 'Score',   sub: 'Risk-scored by engine',   count: summary.totalTransactions,                                       color: 'bg-blue-500' },
              { label: 'Flag',    sub: 'Anomalies flagged',       count: summary.flaggedCount,                                            color: 'bg-blue-600' },
              { label: 'Alert',   sub: 'Critical / High alerts',  count: summary.criticalCount + summary.riskBreakdown.High,              color: 'bg-blue-700' },
            ].map((stage) => (
              <div key={stage.label} className="flex items-center gap-2.5">
                <div className={`w-6 h-6 ${stage.color} rounded-md flex items-center justify-center shrink-0`}>
                  <span className="text-white text-[9px] font-bold">{stage.label[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{stage.label}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{stage.sub}</p>
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 tabular-nums">{stage.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 mb-4 flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">Filter by risk:</span>
        <RiskFilterBar active={filter} onChange={setFilter} counts={counts} />
      </div>

      {/* Tables */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-2.5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Journal Entries</h3>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full">{jeCount} shown</span>
        </div>
        <JournalEntriesTable entries={journalEntries} activeFilter={filter} />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-2.5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Payments</h3>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full">{pyCount} shown</span>
        </div>
        <PaymentsTable payments={payments} activeFilter={filter} />
      </section>
    </div>
    </ErrorBoundary>
  );
}
