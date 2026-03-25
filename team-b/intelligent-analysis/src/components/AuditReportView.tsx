'use client';

import { useRef } from 'react';
import { Printer } from 'lucide-react';
import type { ReportData, AuditLogEntry, UserRiskProfile } from '@/lib/report-generator';
import type { FraudAlert } from '@/lib/fraud-rules';

// ─── Date helpers (consistent between server and client) ──────────────────────

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function fmtDate(date: Date): string {
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const RISK_PILL: Record<string, string> = {
  Critical: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700',
  High:     'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700',
  Medium:   'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700',
  Low:      'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
};

const RISK_ROW: Record<string, string> = {
  Critical: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950/50',
  High:     'border-l-4 border-orange-400 bg-orange-50 dark:bg-orange-950/50',
  Medium:   'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/50',
  Low:      'border-l-4 border-blue-300 bg-blue-50 dark:bg-blue-950/50',
};

const USER_RISK_COLOR: Record<string, string> = {
  Critical: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  High:     'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
  Medium:   'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  Low:      'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-5">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <span className="w-7 h-7 bg-blue-600 dark:bg-blue-700 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
          {num}
        </span>
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AlertRow({ alert }: { alert: FraudAlert }) {
  return (
    <div className={`rounded-lg ${RISK_ROW[alert.riskLevel]} px-4 py-3`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 mt-0.5 ${RISK_PILL[alert.riskLevel]}`}>
            {alert.riskLevel}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{alert.title}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{alert.explanation}</p>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {alert.ids.map((id) => (
                <code key={id} className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded font-mono text-gray-600 dark:text-gray-400">
                  {id}
                </code>
              ))}
              <span className="text-xs text-gray-400">· Confidence: {alert.confidence}%</span>
            </div>
          </div>
        </div>
        {alert.exposure && (
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">Exposure</p>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              ₱{alert.exposure.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AuditTrailRow({ entry }: { entry: AuditLogEntry }) {
  const ts = new Date(entry.timestamp);
  const hour = ts.getHours();
  const isAfterHours = hour < 7 || hour >= 22;

  return (
    <div className={`px-4 py-3 rounded-lg border ${isAfterHours || entry.isSuspicious ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700'}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 text-center">
          <p className={`text-xs font-mono font-bold ${isAfterHours ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {fmtTime(ts)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{fmtDate(ts)}</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{entry.user}</span>
            <span className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded font-mono text-gray-500 dark:text-gray-400">
              {entry.action}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{entry.objectType}</span>
            <code className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded font-mono text-gray-600 dark:text-gray-400">
              {entry.objectKey}
            </code>
            {isAfterHours && (
              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 px-2 py-0.5 rounded-full">
                After-hours
              </span>
            )}
          </div>
          {entry.newValue && (
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{entry.newValue}</p>
          )}
          {entry.flags.map((f, i) => (
            <p key={i} className="text-xs text-red-700 dark:text-red-400 mt-0.5 flex items-start gap-1">
              <span className="shrink-0">⚠</span> {f}
            </p>
          ))}
        </div>
        <span className="font-mono text-xs text-gray-300 dark:text-gray-600 shrink-0">#{entry.logId}</span>
      </div>
    </div>
  );
}

function UserRiskCard({ profile }: { profile: UserRiskProfile }) {
  return (
    <div className={`rounded-xl border p-4 ${USER_RISK_COLOR[profile.riskRating]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{profile.user}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${USER_RISK_COLOR[profile.riskRating]}`}>
            {profile.riskRating} Risk
          </span>
        </div>
        <div className="flex gap-4 text-xs">
          <span><strong>{profile.suspiciousActions}</strong> suspicious actions</span>
          <span><strong>{profile.afterHoursActions}</strong> after-hours</span>
        </div>
      </div>
      <div className="space-y-1 mt-2">
        {profile.flaggedEntries.map((e) => (
          <p key={e.logId} className="text-xs leading-relaxed opacity-80">
            • {fmtDate(new Date(e.timestamp))} —{' '}
            {e.action} {e.objectType} {e.objectKey}: {e.flags[0] ?? e.newValue}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Main Report View ─────────────────────────────────────────────────────────

export function AuditReportView({ data }: { data: ReportData }) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => window.print();

  const checklist = data.checklistItems;

  return (
    <div ref={reportRef}>
      {/* ── Cover ────────────────────────────────────────────────────────── */}
      <div className="bg-blue-700 dark:bg-blue-800 text-white rounded-xl p-6 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-blue-200 uppercase tracking-widest mb-1">SAP B1 Intelligent Analysis</p>
            <h1 className="text-2xl font-bold">Internal Audit Report</h1>
            <p className="text-blue-200 mt-1 text-sm">Period: {data.period} · Report ID: {data.reportId}</p>
            <p className="text-blue-300 text-xs mt-1">Generated: {data.generatedAt}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs bg-red-600 text-white px-3 py-1 rounded-full font-semibold">
              CONFIDENTIAL
            </span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors print:hidden"
            >
              <Printer size={15} /> Print / Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── 1. Executive Summary ─────────────────────────────────────────── */}
      <Section num="1" title="Executive Summary">
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Transactions Reviewed',  value: data.totalTransactions,  sub: 'Journal entries + payments', color: 'text-gray-900 dark:text-gray-100' },
            { label: 'Fraud Alerts Raised',    value: data.totalAlerts,        sub: `${data.criticalCount} critical · ${data.highCount} high`, color: 'text-red-600 dark:text-red-400' },
            { label: 'Total Exposure',
              value: `₱${data.totalExposure.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
              sub: 'High + Critical risk', color: 'text-red-700 dark:text-red-400' },
            { label: 'Month-End: Passed',      value: `${data.passedCount}/${data.checklistItems.length}`, sub: 'Reconciliation checks', color: 'text-green-700 dark:text-green-400' },
            { label: 'Month-End: Failed',      value: data.failedCount,        sub: 'Blocking financial close', color: 'text-red-600 dark:text-red-400' },
            { label: 'Suspicious Audit Logs',  value: data.suspiciousLogEntries.length, sub: 'From audit trail', color: 'text-orange-600 dark:text-orange-400' },
          ].map((kpi) => (
            <div key={kpi.label} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
          <p className="text-sm text-amber-900 dark:text-amber-300 font-medium">
            ⚠ Key Finding: <strong>₱47,150.00</strong> in fraud exposure identified across duplicate payments, ghost vendor, and split transactions.
            User <strong>rgarcia</strong> is implicated in all Critical findings. Immediate action required.
          </p>
        </div>
      </Section>

      {/* ── 2. Priority Findings ─────────────────────────────────────────── */}
      <Section num="2" title="Priority Findings — Critical & High Risk">
        <div className="space-y-3">
          {[...data.criticalAlerts, ...data.highAlerts]
            .sort((a, b) => (b.exposure ?? 0) - (a.exposure ?? 0))
            .map((alert, i) => (
              <AlertRow key={i} alert={alert} />
            ))}
        </div>
      </Section>

      {/* ── 3. Full Fraud Detection Results ──────────────────────────────── */}
      <Section num="3" title="All Fraud Detection Results">
        {['Critical', 'High', 'Medium'].map((level) => {
          const levelAlerts = data.alerts.filter((a) => a.riskLevel === level);
          if (levelAlerts.length === 0) return null;
          return (
            <div key={level} className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{level} Risk ({levelAlerts.length})</p>
              <div className="space-y-2">
                {levelAlerts.map((alert, i) => <AlertRow key={i} alert={alert} />)}
              </div>
            </div>
          );
        })}
      </Section>

      {/* ── 4. Audit Trail Analysis ───────────────────────────────────────── */}
      <Section num="4" title="Audit Trail — Suspicious Activity Log">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {data.suspiciousLogEntries.length} of {data.auditLogEntries.length} audit log entries flagged as suspicious.
        </p>
        <div className="space-y-2">
          {data.suspiciousLogEntries.map((entry) => (
            <AuditTrailRow key={entry.logId} entry={entry} />
          ))}
        </div>
      </Section>

      {/* ── 5. User Risk Profiles ─────────────────────────────────────────── */}
      <Section num="5" title="User Activity Risk Assessment">
        <div className="space-y-3">
          {data.userRiskProfiles.map((profile) => (
            <UserRiskCard key={profile.user} profile={profile} />
          ))}
        </div>
        {data.userRiskProfiles.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">No high-risk user activity detected.</p>
        )}
      </Section>

      {/* ── 6. Month-End Close Status ─────────────────────────────────────── */}
      <Section num="6" title="Month-End Close — Reconciliation Status">
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Overall progress</span>
            <span className="font-semibold">{data.passedCount}/{data.checklistItems.length} passed</span>
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full" style={{ width: `${(data.passedCount / data.checklistItems.length) * 100}%` }} />
            <div className="bg-red-400 h-full" style={{ width: `${(data.failedCount / data.checklistItems.length) * 100}%` }} />
            <div className="bg-yellow-400 h-full" style={{ width: `${(data.pendingCount / data.checklistItems.length) * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-1.5 text-xs">
            <span className="text-green-700 dark:text-green-400">✓ {data.passedCount} passed</span>
            <span className="text-red-600 dark:text-red-400">✗ {data.failedCount} failed</span>
            <span className="text-yellow-700 dark:text-yellow-400">⋯ {data.pendingCount} pending</span>
          </div>
        </div>
        <div className="space-y-2">
          {checklist.map((task) => (
            <div
              key={task.taskId}
              className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${
                task.status === 'passed'  ? 'bg-green-50 dark:bg-green-950/50 border-green-100 dark:border-green-900' :
                task.status === 'failed'  ? 'bg-red-50 dark:bg-red-950/50 border-red-100 dark:border-red-900' :
                'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-100 dark:border-yellow-900'
              }`}
            >
              <span className="font-mono text-xs font-bold text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">{task.taskId}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{task.name}</p>
                {task.status !== 'passed' && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{task.description}</p>
                )}
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize shrink-0 ${
                task.status === 'passed'  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' :
                task.status === 'failed'  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' :
                'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
              }`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 7. GL Variance Highlights ─────────────────────────────────────── */}
      <Section num="7" title="GL Variance Highlights — Flagged Accounts">
        <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                {['Account', 'Current Balance', 'Prior Balance', 'Variance', '%'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {data.flaggedGLAccounts.map((acct) => (
                <>
                  <tr key={acct.acctCode} className="bg-red-50 dark:bg-red-950/50">
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs text-gray-400 dark:text-gray-500">{acct.acctCode}</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">{acct.acctName}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                      ₱{acct.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-500 dark:text-gray-400 tabular-nums">
                      ₱{acct.priorBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-2.5 text-right font-semibold tabular-nums ${acct.varianceAmt > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {acct.varianceAmt > 0 ? '+' : ''}₱{acct.varianceAmt.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-red-600 dark:text-red-400 tabular-nums">
                      {acct.variancePct > 0 ? '+' : ''}{acct.variancePct.toFixed(1)}%
                    </td>
                  </tr>
                  {acct.flags.map((f, i) => (
                    <tr key={`${acct.acctCode}-f${i}`} className="bg-red-50 dark:bg-red-950/50">
                      <td colSpan={5} className="px-6 pb-2 text-xs text-red-700 dark:text-red-400">→ {f}</td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── 8. Recommendations ───────────────────────────────────────────── */}
      <Section num="8" title="Recommendations & Required Actions">
        <ol className="space-y-3">
          {data.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="w-6 h-6 bg-blue-600 dark:bg-blue-700 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{rec}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Sign-off footer ───────────────────────────────────────────────── */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-5 mt-5">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Sign-off Trail</p>
        <div className="grid grid-cols-3 gap-6">
          {['Prepared by: Finance Controller', 'Reviewed by: Internal Auditor', 'Approved by: CFO / Management'].map((role) => (
            <div key={role} className="text-center">
              <div className="h-10 border-b-2 border-gray-300 dark:border-gray-600 mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Date: ___________</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {data.reportId} · Intelligent Analysis · SAP B1 Fraud Detection & Compliance Suite · {data.period}
        </p>
      </div>
    </div>
  );
}
