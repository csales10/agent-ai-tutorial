'use client';

import { useState } from 'react';
import type { FraudAlert } from '@/lib/fraud-rules';
import type { DetectSummary, PatternSummary } from '@/lib/detect-analyzer';

// ─── Style maps ──────────────────────────────────────────────────────────────

const SEVERITY_BORDER: Record<string, string> = {
  Critical: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950/50',
  High:     'border-l-4 border-orange-400 bg-orange-50 dark:bg-orange-950/50',
  Medium:   'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/50',
  Low:      'border-l-4 border-blue-300 bg-blue-50 dark:bg-blue-950/50',
};

const SEVERITY_PILL: Record<string, string> = {
  Critical: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700',
  High:     'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700',
  Medium:   'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700',
  Low:      'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
};

const PATTERN_PILL: Record<string, string> = {
  'Duplicate Payment':   'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  'Ghost Vendor':        'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
  'Round Number':        'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300',
  'Split Transaction':   'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
  'After-Hours Posting': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 90 ? 'bg-red-500' :
    value >= 75 ? 'bg-orange-400' :
    value >= 60 ? 'bg-yellow-400' : 'bg-blue-400';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 tabular-nums w-8">{value}%</span>
    </div>
  );
}

function AlertCard({
  alert,
  reviewed,
  onToggle,
}: {
  alert: FraudAlert;
  reviewed: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-opacity ${
        reviewed ? 'opacity-50' : ''
      }`}
    >
      {/* Main row */}
      <div className={`${SEVERITY_BORDER[alert.riskLevel]} px-5 py-4`}>
        <div className="flex items-start justify-between gap-4">
          {/* Left: title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_PILL[alert.riskLevel]}`}>
                {alert.riskLevel}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PATTERN_PILL[alert.pattern] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                {alert.pattern}
              </span>
              {alert.exposure && (
                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                  ₱{alert.exposure.toLocaleString('en-PH', { minimumFractionDigits: 2 })} exposure
                </span>
              )}
            </div>

            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{alert.title}</p>

            {/* Confidence */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Confidence:</span>
              <div className="flex-1 max-w-xs">
                <ConfidenceBar value={alert.confidence} />
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Hide alert details' : 'View alert details'}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {expanded ? 'Hide details' : 'View details'} <span aria-hidden="true">{expanded ? '▲' : '▼'}</span>
            </button>
            <button
              onClick={onToggle}
              aria-label={reviewed ? 'Mark alert as not reviewed' : 'Mark alert as reviewed'}
              className={`text-xs px-3 py-1 rounded border font-medium transition-colors ${
                reviewed
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {reviewed ? '✓ Reviewed' : 'Mark reviewed'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-5 py-4 space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{alert.explanation}</p>

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Affected Records</p>
            <div className="flex flex-wrap gap-2">
              {alert.ids.map((id) => (
                <code
                  key={id}
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded font-mono border border-gray-200 dark:border-gray-600"
                >
                  {id}
                </code>
              ))}
            </div>
          </div>

          {alert.exposure && (
            <div className="flex items-center gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">Financial exposure:</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                ₱{alert.exposure.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Confidence: {alert.confidence}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PatternTab({
  label,
  count,
  icon,
  active,
  onClick,
}: {
  label: string;
  count: number;
  icon?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-blue-600 dark:bg-blue-700 text-white'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{label}</span>
      <span
        className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
          active ? 'bg-blue-500 dark:bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// ─── Stable key per alert (pattern + title + first id) ───────────────────────
function alertKey(alert: FraudAlert): string {
  return `${alert.pattern}|${alert.title}|${alert.ids[0] ?? ''}`;
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

export function DetectPanel({ data }: { data: DetectSummary }) {
  const [activePattern, setActivePattern] = useState<string>('All');
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  const toggleReviewed = (key: string) =>
    setReviewed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const filteredAlerts = activePattern === 'All'
    ? data.alerts
    : data.alerts.filter((a) => a.pattern === activePattern);

  const pendingAlerts = filteredAlerts.filter((a) => !reviewed.has(alertKey(a)));
  const reviewedAlerts = filteredAlerts.filter((a) => reviewed.has(alertKey(a)));

  return (
    <div>
      {/* Pattern tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        <PatternTab
          label="All Patterns"
          count={data.alerts.length}
          active={activePattern === 'All'}
          onClick={() => setActivePattern('All')}
        />
        {data.patterns.map((p) => (
          <PatternTab
            key={p.pattern}
            label={p.pattern}
            count={p.count}
            icon={p.icon}
            active={activePattern === p.pattern}
            onClick={() => setActivePattern(p.pattern)}
          />
        ))}
      </div>

      {/* Pattern exposure bar (only All view) */}
      {activePattern === 'All' && (
        <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Exposure by Pattern
          </p>
          <div className="space-y-2.5">
            {data.patterns
              .filter((p) => p.exposure > 0)
              .sort((a, b) => b.exposure - a.exposure)
              .map((p) => {
                const pct = (p.exposure / data.totalExposure) * 100;
                const barColors: Record<string, string> = {
                  Critical: 'bg-red-500', High: 'bg-orange-400', Medium: 'bg-yellow-400', Low: 'bg-blue-400',
                };
                return (
                  <div key={p.pattern} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-36 shrink-0">
                      <span aria-hidden="true">{p.icon}</span> {p.pattern}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColors[p.maxRisk]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums w-28 text-right shrink-0">
                      ₱{p.exposure.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Active alerts */}
      {pendingAlerts.length === 0 && reviewedAlerts.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-8 text-center text-blue-700 dark:text-blue-400 text-sm">
          No fraud alerts for this pattern.
        </div>
      )}

      {pendingAlerts.length > 0 && (
        <div className="space-y-3 mb-6">
          {pendingAlerts.map((alert) => {
            const key = alertKey(alert);
            return (
              <AlertCard
                key={key}
                alert={alert}
                reviewed={reviewed.has(key)}
                onToggle={() => toggleReviewed(key)}
              />
            );
          })}
        </div>
      )}

      {/* Reviewed section */}
      {reviewedAlerts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            Reviewed ({reviewedAlerts.length})
          </p>
          <div className="space-y-2">
            {reviewedAlerts.map((alert) => {
              const key = alertKey(alert);
              return (
                <AlertCard
                  key={key}
                  alert={alert}
                  reviewed={reviewed.has(key)}
                  onToggle={() => toggleReviewed(key)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
