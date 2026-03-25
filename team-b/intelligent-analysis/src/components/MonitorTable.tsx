'use client';

import React, { useState } from 'react';
import type { ScoredJournalEntry, ScoredPayment, RiskLevel } from '@/lib/risk-scorer';

const RISK_BADGE: Record<RiskLevel, string> = {
  Critical: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700',
  High:     'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700',
  Medium:   'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700',
  Low:      'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
  Clean:    'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700',
};

const RISK_ROW: Record<RiskLevel, string> = {
  Critical: 'border-l-4 border-red-500',
  High:     'border-l-4 border-orange-400',
  Medium:   'border-l-4 border-yellow-400',
  Low:      'border-l-4 border-blue-300',
  Clean:    '',
};

const RISK_LEVELS: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low', 'Clean'];

function RiskPill({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${RISK_BADGE[level]}`}>
      {level}
    </span>
  );
}

function FlagList({ flags }: { flags: string[] }) {
  if (flags.length === 0) return null;
  return (
    <ul className="mt-2 pl-2 space-y-0.5">
      {flags.map((f, i) => (
        <li key={i} className="text-xs text-red-700 dark:text-red-400 flex items-start gap-1">
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Journal Entries Table ────────────────────────────────────────────────────

export function JournalEntriesTable({
  entries,
  activeFilter,
}: {
  entries: ScoredJournalEntry[];
  activeFilter: RiskLevel | 'All';
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const filtered = activeFilter === 'All' ? entries : entries.filter((e) => e.riskLevel === activeFilter);

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (filtered.length === 0) {
    return <p className="text-gray-400 text-sm py-6 text-center">No journal entries match this filter.</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <tr>
            {['Trans ID', 'Date', 'Memo', 'Posted By', 'Time', 'Amount (₱)', 'Risk'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {filtered.map((je) => (
            <React.Fragment key={je.transId}>
              <tr
                className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${RISK_ROW[je.riskLevel]}`}
                onClick={() => je.flags.length > 0 && toggle(je.transId)}
              >
                <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">{je.transId}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{je.transDate}</td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-200 max-w-xs">
                  <span className="truncate block">{je.memo}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{je.createdBy}</td>
                <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">{je.postingTime}</td>
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 text-right">
                  {je.netAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <RiskPill level={je.riskLevel} />
                    {je.flags.length > 0 && (
                      <span aria-hidden="true" className="text-gray-400 text-xs">{expanded.has(je.transId) ? '▲' : '▼'}</span>
                    )}
                  </div>
                </td>
              </tr>
              {expanded.has(je.transId) && je.flags.length > 0 && (
                <tr className="bg-red-50 dark:bg-red-950/50">
                  <td colSpan={7} className="px-6 py-3">
                    <FlagList flags={je.flags} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Payments Table ───────────────────────────────────────────────────────────

export function PaymentsTable({
  payments,
  activeFilter,
}: {
  payments: ScoredPayment[];
  activeFilter: RiskLevel | 'All';
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const filtered = activeFilter === 'All' ? payments : payments.filter((p) => p.riskLevel === activeFilter);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (filtered.length === 0) {
    return <p className="text-gray-400 text-sm py-6 text-center">No payments match this filter.</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <tr>
            {['Doc #', 'Vendor', 'Date', 'Amount (₱)', 'Method', 'Bank', 'Risk'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {filtered.map((p) => (
            <React.Fragment key={p.docEntry}>
              <tr
                className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${RISK_ROW[p.riskLevel]}`}
                onClick={() => p.flags.length > 0 && toggle(p.docNum)}
              >
                <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">{p.docNum}</td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.cardName}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.docDate}</td>
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 text-right">
                  {p.paymentAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.paymentMethod}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.bankCode}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <RiskPill level={p.riskLevel} />
                    {p.flags.length > 0 && (
                      <span aria-hidden="true" className="text-gray-400 text-xs">{expanded.has(p.docNum) ? '▲' : '▼'}</span>
                    )}
                  </div>
                </td>
              </tr>
              {expanded.has(p.docNum) && p.flags.length > 0 && (
                <tr className="bg-red-50 dark:bg-red-950/50">
                  <td colSpan={7} className="px-6 py-3">
                    <FlagList flags={p.flags} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

export function RiskFilterBar({
  active,
  onChange,
  counts,
}: {
  active: RiskLevel | 'All';
  onChange: (v: RiskLevel | 'All') => void;
  counts: Record<string, number>;
}) {
  const filters: (RiskLevel | 'All')[] = ['All', ...RISK_LEVELS];
  const PILL_ACTIVE: Record<string, string> = {
    All:      'bg-blue-600 text-white',
    Critical: 'bg-red-600 text-white',
    High:     'bg-orange-500 text-white',
    Medium:   'bg-yellow-400 text-gray-900',
    Low:      'bg-blue-500 text-white',
    Clean:    'bg-green-600 text-white',
  };
  const PILL_IDLE: Record<string, string> = {
    All:      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
    Critical: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900',
    High:     'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900',
    Medium:   'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900',
    Low:      'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900',
    Clean:    'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900',
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            active === f ? PILL_ACTIVE[f] : PILL_IDLE[f]
          }`}
        >
          {f}
          {counts[f] !== undefined && (
            <span className="ml-1.5 opacity-75">({counts[f]})</span>
          )}
        </button>
      ))}
    </div>
  );
}
