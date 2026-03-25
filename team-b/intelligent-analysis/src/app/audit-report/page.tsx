'use client';

import { getMockData } from '@/lib/mock-data';
import { generateReport } from '@/lib/report-generator';
import { AuditReportView } from '@/components/AuditReportView';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AuditReportPage() {
  const reportData = generateReport(getMockData());
  return (
    <ErrorBoundary>
      <div>
        {/* Page header (non-printable context) */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Audit Report Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Compliance-ready report aggregating DETECT + RECONCILE findings · Stage M4: REPORT
          </p>
        </div>

        <AuditReportView data={reportData} />
      </div>
    </ErrorBoundary>
  );
}
