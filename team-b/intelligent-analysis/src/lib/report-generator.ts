import { runFraudRules } from './fraud-rules';
import type { FraudAlert } from './fraud-rules';
import { analyzeReconcile } from './reconcile-analyzer';
import type { GLAccount, ChecklistItem } from './reconcile-analyzer';
import type { MockData } from './mock-data';

export interface AuditLogEntry {
  logId: number;
  timestamp: string;
  user: string;
  action: string;
  objectType: string;
  objectKey: string;
  oldValue: string | null;
  newValue: string | null;
  flags: string[];
  isSuspicious: boolean;
}

export interface UserRiskProfile {
  user: string;
  suspiciousActions: number;
  afterHoursActions: number;
  flaggedEntries: AuditLogEntry[];
  riskRating: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface ReportData {
  // Meta
  reportId: string;
  period: string;
  generatedAt: string;

  // Totals
  totalTransactions: number;
  totalAlerts: number;
  totalExposure: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;

  // Findings
  alerts: FraudAlert[];
  criticalAlerts: FraudAlert[];
  highAlerts: FraudAlert[];

  // Reconcile
  checklistItems: ChecklistItem[];
  failedChecklist: ChecklistItem[];
  passedCount: number;
  failedCount: number;
  pendingCount: number;

  // GL
  flaggedGLAccounts: GLAccount[];

  // Audit trail
  auditLogEntries: AuditLogEntry[];
  suspiciousLogEntries: AuditLogEntry[];
  userRiskProfiles: UserRiskProfile[];

  // Recommendations
  recommendations: string[];
}

function buildRecommendations(alerts: FraudAlert[], failedChecklist: ChecklistItem[]): string[] {
  const recs: string[] = [];

  const hasGhost = alerts.some((a) => a.pattern === 'Ghost Vendor');
  const hasDuplicate = alerts.some((a) => a.pattern === 'Duplicate Payment');
  const hasSplit = alerts.some((a) => a.pattern === 'Split Transaction');
  const hasAfterHours = alerts.some((a) => a.pattern === 'After-Hours Posting');
  const hasAPMismatch = failedChecklist.some((c) => c.taskId === 'CL-001' || c.taskId === 'CL-004');

  if (hasGhost) recs.push('Implement mandatory vendor onboarding review: require manager sign-off before first payment to any vendor created within the last 60 days.');
  if (hasDuplicate) recs.push('Enable duplicate payment controls in SAP B1: configure system-level warnings when payment reference, vendor, and amount match a prior payment within 30 days.');
  if (hasSplit) recs.push('Lower the split-transaction detection threshold from ₱5,000 to ₱3,000 and require dual approval for same-vendor payments on the same day.');
  if (hasAfterHours) recs.push('Restrict after-hours posting access: require time-locked approval for journal entries and payments created between 10:00 PM and 6:00 AM.');
  if (hasAPMismatch) recs.push('Resolve the ₱3,320 AP sub-ledger variance (AcctCode 2100) before financial statement generation. Investigate duplicate payment postings by rgarcia.');
  recs.push('Suspend rgarcia\'s posting privileges pending investigation. All flagged transactions (ghost vendor creation, duplicate payments, after-hours postings) originate from this user account.');
  recs.push('Conduct a full vendor master data audit: verify bank account details, contact information, and TIN for all vendors created or modified in the past 90 days.');
  recs.push('Schedule a follow-up review in 30 days to confirm all Critical and High findings have been resolved and controls are operating effectively.');

  return recs;
}

export function generateReport(data: MockData): ReportData {
  const alerts = runFraudRules(data);
  const reconcile = analyzeReconcile(data);
  const rawAuditLog = data.auditLog as any[];

  // Process audit log
  const auditLogEntries: AuditLogEntry[] = rawAuditLog.map((entry) => ({
    logId: entry.LogId,
    timestamp: entry.Timestamp,
    user: entry.User,
    action: entry.Action,
    objectType: entry.ObjectType,
    objectKey: entry.ObjectKey,
    oldValue: entry.OldValue ?? null,
    newValue: entry.NewValue ?? null,
    flags: entry._flags ?? [],
    isSuspicious: (entry._flags?.length ?? 0) > 0,
  }));

  const suspiciousLogEntries = auditLogEntries.filter((e) => e.isSuspicious);

  // Build user risk profiles
  const userMap = new Map<string, AuditLogEntry[]>();
  for (const entry of auditLogEntries) {
    if (!userMap.has(entry.user)) userMap.set(entry.user, []);
    userMap.get(entry.user)!.push(entry);
  }

  const userRiskProfiles: UserRiskProfile[] = [];
  for (const [user, entries] of userMap) {
    const flagged = entries.filter((e) => e.isSuspicious);
    const afterHours = entries.filter((e) => {
      const hour = new Date(e.timestamp).getHours();
      return hour < 7 || hour >= 22;
    });
    const suspiciousActions = flagged.length;
    const riskRating: UserRiskProfile['riskRating'] =
      suspiciousActions >= 4 ? 'Critical' :
      suspiciousActions >= 2 ? 'High' :
      suspiciousActions >= 1 ? 'Medium' : 'Low';

    if (flagged.length > 0 || afterHours.length > 0) {
      userRiskProfiles.push({
        user,
        suspiciousActions,
        afterHoursActions: afterHours.length,
        flaggedEntries: flagged,
        riskRating,
      });
    }
  }

  userRiskProfiles.sort((a, b) => {
    const order = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return order[b.riskRating] - order[a.riskRating];
  });

  const totalExposure = alerts.reduce((sum, a) => sum + (a.exposure ?? 0), 0);
  const criticalAlerts = alerts.filter((a) => a.riskLevel === 'Critical');
  const highAlerts = alerts.filter((a) => a.riskLevel === 'High');

  const failedChecklist = reconcile.checklistItems.filter((c) => c.status === 'failed');
  const flaggedGLAccounts = reconcile.glAccounts.filter((a) => a.isFlagged);

  return {
    reportId: `AR-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
    period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    generatedAt: 'March 25, 2026, 05:00 PM',

    totalTransactions: (data.journalEntries as any[]).length + (data.payments as any[]).length,
    totalAlerts: alerts.length,
    totalExposure,
    criticalCount: criticalAlerts.length,
    highCount: highAlerts.length,
    mediumCount: alerts.filter((a) => a.riskLevel === 'Medium').length,

    alerts,
    criticalAlerts,
    highAlerts,

    checklistItems: reconcile.checklistItems,
    failedChecklist,
    passedCount: reconcile.passed,
    failedCount: reconcile.failed,
    pendingCount: reconcile.pending,

    flaggedGLAccounts,

    auditLogEntries,
    suspiciousLogEntries,
    userRiskProfiles,

    recommendations: buildRecommendations(alerts, failedChecklist),
  };
}
