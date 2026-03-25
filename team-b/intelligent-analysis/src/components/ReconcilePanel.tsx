'use client';

import { useState } from 'react';
import type { ChecklistItem, GLAccount, ReconcileSummary, ChecklistStatus } from '@/lib/reconcile-analyzer';

// ─── Style maps ──────────────────────────────────────────────────────────────

const STATUS_BORDER: Record<ChecklistStatus, string> = {
  passed:  'border-l-4 border-green-500',
  failed:  'border-l-4 border-red-500',
  pending: 'border-l-4 border-yellow-400',
};

const STATUS_PILL: Record<ChecklistStatus, string> = {
  passed:  'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700',
  failed:  'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700',
  pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700',
};

const STATUS_BG: Record<ChecklistStatus, string> = {
  passed:  'bg-green-50 dark:bg-green-950/50',
  failed:  'bg-red-50 dark:bg-red-950/50',
  pending: 'bg-yellow-50 dark:bg-yellow-950/50',
};

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-400',
  medium:   'bg-yellow-400',
  info:     'bg-gray-300',
};

// ─── Checklist Card ───────────────────────────────────────────────────────────

function ChecklistCard({
  item,
  resolved,
  onToggle,
  allItems,
}: {
  item: ChecklistItem;
  resolved: boolean;
  onToggle: () => void;
  allItems: ChecklistItem[];
}) {
  const [expanded, setExpanded] = useState(item.status === 'failed');

  const blockingNames = item.blockedBy.map((id) => {
    const found = allItems.find((t) => t.taskId === id);
    return found ? `${id}: ${found.name}` : id;
  });

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-opacity ${
        resolved ? 'opacity-50' : ''
      }`}
    >
      {/* Header row */}
      <div
        className={`${STATUS_BORDER[item.status]} ${STATUS_BG[item.status]} px-5 py-4 cursor-pointer`}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs text-gray-400 dark:text-gray-500 shrink-0">{item.taskId}</span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${SEVERITY_DOT[item.severity]}`}
                title={`Severity: ${item.severity}`}
              />
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.name}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded-full">
                {item.category}
              </span>
              {item.autoCheck && (
                <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                  Auto
                </span>
              )}
            </div>
            {/* Blocked by notice */}
            {item.status === 'pending' && item.blockedBy.length > 0 && (
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
                ⛔ Blocked by: {item.blockedBy.join(', ')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_PILL[item.status]}`}>
              {item.status}
            </span>
            {item.status === 'failed' && !resolved && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                aria-label={`Mark ${item.name} as resolved`}
                className="text-xs px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Mark resolved
              </button>
            )}
            {resolved && (
              <span className="text-xs px-3 py-1 rounded border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 font-medium">
                ✓ Resolved
              </span>
            )}
            <span aria-hidden="true" className="text-gray-400 dark:text-gray-500 text-xs ml-1">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-5 py-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.description}</p>
          {blockingNames.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Dependencies (must resolve first)
              </p>
              <ul className="space-y-1">
                {blockingNames.map((b) => (
                  <li key={b} className="text-xs text-red-700 dark:text-red-400 flex items-center gap-1.5">
                    <span>⛔</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── GL Variance Table ────────────────────────────────────────────────────────

function GLVarianceTable({ accounts }: { accounts: GLAccount[] }) {
  const [showAll, setShowAll] = useState(false);
  const display = showAll ? accounts : accounts.filter((a) => a.isFlagged || Math.abs(a.variancePct) > 20);

  function varianceColor(pct: number, isFlagged: boolean) {
    if (isFlagged) return 'text-red-600 dark:text-red-400 font-bold';
    if (Math.abs(pct) > 50) return 'text-orange-600 dark:text-orange-400 font-semibold';
    if (Math.abs(pct) > 20) return 'text-yellow-700 dark:text-yellow-400 font-semibold';
    return 'text-gray-500 dark:text-gray-400';
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">GL Account Variances — March 2026 vs. Prior Period</p>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showAll ? 'Show flagged only' : `Show all ${accounts.length} accounts`}
        </button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
          <tr>
            {['Account', 'Category', 'Current Balance', 'Prior Balance', 'Variance (₱)', 'Variance (%)'].map((h) => (
              <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
          {display.map((acct) => (
            <>
              <tr
                key={acct.acctCode}
                className={acct.isFlagged ? 'bg-red-50 dark:bg-red-950/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {acct.isFlagged && <span className="text-red-500 text-xs">⚠</span>}
                    <span>
                      <span className="font-mono text-xs text-gray-400 dark:text-gray-500">{acct.acctCode}</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">{acct.acctName}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{acct.category}</span>
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                  {acct.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2.5 text-right text-gray-500 dark:text-gray-400 tabular-nums">
                  {acct.priorBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </td>
                <td className={`px-4 py-2.5 text-right tabular-nums ${acct.varianceAmt >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {acct.varianceAmt >= 0 ? '+' : ''}
                  {acct.varianceAmt.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </td>
                <td className={`px-4 py-2.5 text-right tabular-nums ${varianceColor(acct.variancePct, acct.isFlagged)}`}>
                  {acct.variancePct >= 0 ? '+' : ''}{acct.variancePct.toFixed(1)}%
                </td>
              </tr>
              {acct.isFlagged && acct.flags.length > 0 && (
                <tr key={`${acct.acctCode}-flag`} className="bg-red-50 dark:bg-red-950/50 border-t-0">
                  <td colSpan={6} className="px-6 pb-2.5">
                    {acct.flags.map((f, i) => (
                      <p key={i} className="text-xs text-red-700 dark:text-red-400 flex items-start gap-1">
                        <span className="shrink-0 mt-0.5">→</span> {f}
                      </p>
                    ))}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

type FilterType = 'All' | ChecklistStatus;

function FilterTabs({
  active,
  onChange,
  counts,
}: {
  active: FilterType;
  onChange: (v: FilterType) => void;
  counts: Record<string, number>;
}) {
  const tabs: { label: FilterType; color: string; activeColor: string }[] = [
    { label: 'All',     color: 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',   activeColor: 'bg-blue-600 text-white' },
    { label: 'failed',  color: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900',    activeColor: 'bg-red-600 text-white' },
    { label: 'passed',  color: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900', activeColor: 'bg-green-600 text-white' },
    { label: 'pending', color: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900', activeColor: 'bg-yellow-400 text-gray-900' },
  ];

  return (
    <div className="flex gap-2">
      {tabs.map(({ label, color, activeColor }) => (
        <button
          key={label}
          onClick={() => onChange(label)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
            active === label ? activeColor : color
          }`}
        >
          {label} <span className="ml-1 opacity-75">({counts[label] ?? 0})</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function ReconcilePanel({ data }: { data: ReconcileSummary }) {
  const [filter, setFilter] = useState<FilterType>('All');
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const toggleResolved = (taskId: string) =>
    setResolved((prev) => {
      const next = new Set(prev);
      next.has(taskId) ? next.delete(taskId) : next.add(taskId);
      return next;
    });

  const filtered =
    filter === 'All'
      ? data.checklistItems
      : data.checklistItems.filter((c) => c.status === filter);

  const counts: Record<string, number> = {
    All: data.total,
    failed: data.failed,
    passed: data.passed,
    pending: data.pending,
  };

  // Group by category
  const grouped = data.categories.reduce<Record<string, ChecklistItem[]>>((acc, cat) => {
    acc[cat] = filtered.filter((c) => c.category === cat);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Filter tabs */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">Filter:</span>
        <FilterTabs active={filter} onChange={setFilter} counts={counts} />
      </div>

      {/* Grouped checklist */}
      {data.categories.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        return (
          <section key={cat}>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
              {cat}
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <ChecklistCard
                  key={item.taskId}
                  item={item}
                  resolved={resolved.has(item.taskId)}
                  onToggle={() => toggleResolved(item.taskId)}
                  allItems={data.checklistItems}
                />
              ))}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No tasks match this filter.</p>
      )}

      {/* GL Variance section — always shown */}
      {(filter === 'All' || filter === 'failed') && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
            GL Account Variance Analysis
          </h3>
          <GLVarianceTable accounts={data.glAccounts} />
        </section>
      )}
    </div>
  );
}
