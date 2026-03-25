'use client';

import { getMockData } from '@/lib/mock-data';
import { analyzeDetect } from '@/lib/detect-analyzer';
import { DetectPanel } from '@/components/DetectPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const SEVERITY_CARD: Record<string, string> = {
  Critical: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
  High:     'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400',
  Medium:   'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
};

export default function FraudPage() {
  const data = analyzeDetect(getMockData());
  return (
    <ErrorBoundary>
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fraud Detection Engine</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Rule-based AI pattern analysis across 5 fraud vectors · Stage M2: DETECT
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-4 border bg-blue-700 dark:bg-blue-800 border-blue-700 dark:border-blue-800 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Total Alerts</p>
          <p className="text-3xl font-bold mt-1">{data.totalAlerts}</p>
          <p className="text-xs mt-2 text-blue-300">{data.patterns.length} patterns triggered</p>
        </div>

        <div className={`rounded-xl p-4 border bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400`}>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Total Exposure</p>
          <p className="text-2xl font-bold mt-1 leading-tight">
            ₱{data.totalExposure.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs mt-2 opacity-60">High+Critical risk</p>
        </div>

        {(['Critical', 'High', 'Medium'] as const).map((level) => {
          const count = level === 'Critical' ? data.criticalCount : level === 'High' ? data.highCount : data.mediumCount;
          return (
            <div key={level} className={`rounded-xl p-4 border ${SEVERITY_CARD[level]}`}>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{level} Risk</p>
              <p className="text-3xl font-bold mt-1">{count}</p>
              <p className="text-xs mt-2 opacity-60">
                {level === 'Critical' ? 'Immediate action required' :
                 level === 'High' ? 'Review within 24 hrs' : 'Monitor closely'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Pattern summary chips */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {data.patterns.map((p) => (
          <div
            key={p.pattern}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
          >
            <span>{p.icon}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{p.pattern}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{p.count} alert{p.count > 1 ? 's' : ''}</span>
            {p.exposure > 0 && (
              <>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                  ₱{p.exposure.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      <hr className="border-gray-200 dark:border-gray-700 mb-6" />

      {/* Interactive detect panel */}
      <DetectPanel data={data} />
    </div>
    </ErrorBoundary>
  );
}
