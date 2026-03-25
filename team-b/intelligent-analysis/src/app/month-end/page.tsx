'use client';

import { getMockData } from '@/lib/mock-data';
import { analyzeReconcile } from '@/lib/reconcile-analyzer';
import { ReconcilePanel } from '@/components/ReconcilePanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function MonthEndPage() {
  const data = analyzeReconcile(getMockData());
  const PROGRESS_COLOR = data.passRate >= 80 ? 'bg-green-500' : data.passRate >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <ErrorBoundary>
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Month-End Close</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Automated reconciliation · GL variance analysis · Stage M3: RECONCILE
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-4 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Close Progress</p>
          <div className="mt-2">
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.passRate}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{data.passed}/{data.total} tasks</p>
            </div>
            <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full ${PROGRESS_COLOR} rounded-full`} style={{ width: `${data.passRate}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4 border bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Failed Checks</p>
          <p className="text-3xl font-bold mt-1">{data.failed}</p>
          <p className="text-xs mt-2 opacity-60">Blocking close</p>
        </div>

        <div className="rounded-xl p-4 border bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">AP Variance</p>
          <p className="text-2xl font-bold mt-1 leading-tight">
            ₱{data.apVariance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs mt-2 opacity-60">Sub-ledger mismatch (CL-001, CL-004)</p>
        </div>

        <div className="rounded-xl p-4 border bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Duplicate Exposure</p>
          <p className="text-2xl font-bold mt-1 leading-tight">
            ₱{data.duplicateExposure.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs mt-2 opacity-60">GlobalEdge + TechSupply (CL-005)</p>
        </div>
      </div>

      {/* Exception summary strip */}
      <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Exception Summary
        </p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-lg mt-0.5">✗</span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">GL Trial Balance Mismatch</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">AP control acct 2100 vs. vendor sub-ledger: ₱3,320.00 variance</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-lg mt-0.5">✗</span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Duplicate Payments Detected</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">2 pairs identified · ₱22,350.00 total exposure</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-orange-500 text-lg mt-0.5">⚠</span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">After-Hours Transactions</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{data.afterHoursCount} entries posted between 1–3:30 AM by rgarcia</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-700 mb-6" />

      {/* Interactive panel */}
      <ReconcilePanel data={data} />
    </div>
    </ErrorBoundary>
  );
}
