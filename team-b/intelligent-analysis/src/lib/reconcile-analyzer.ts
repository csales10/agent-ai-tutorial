import type { MockData } from './mock-data';

export type ChecklistStatus = 'passed' | 'failed' | 'pending';

export interface ChecklistItem {
  taskId: string;
  name: string;
  category: string;
  status: ChecklistStatus;
  autoCheck: boolean;
  description: string;
  blockedBy: string[];
  severity: 'critical' | 'high' | 'medium' | 'info';
}

export interface GLAccount {
  acctCode: string;
  acctName: string;
  category: string;
  balance: number;
  priorBalance: number;
  varianceAmt: number;
  variancePct: number;
  flags: string[];
  isFlagged: boolean;
}

export interface ReconcileSummary {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  passRate: number;
  apVariance: number;
  duplicateExposure: number;
  afterHoursCount: number;
  categories: string[];
  checklistItems: ChecklistItem[];
  glAccounts: GLAccount[];
}

// Known dependency chain from task descriptions
const BLOCKED_BY: Record<string, string[]> = {
  'CL-010': ['CL-001', 'CL-004'],
};

// Severity by task ID based on financial impact
const TASK_SEVERITY: Record<string, ChecklistItem['severity']> = {
  'CL-001': 'critical',
  'CL-004': 'critical',
  'CL-005': 'critical',
  'CL-006': 'high',
  'CL-009': 'medium',
  'CL-010': 'medium',
  'CL-002': 'info',
  'CL-003': 'info',
  'CL-007': 'info',
  'CL-008': 'info',
};

export function analyzeReconcile(data: MockData): ReconcileSummary {
  const rawChecklist = data.closingChecklist as any[];
  const rawCoa = data.chartOfAccounts as any[];

  // Enrich checklist items
  const checklistItems: ChecklistItem[] = rawChecklist.map((item) => ({
    taskId: item.TaskId,
    name: item.Name,
    category: item.Category,
    status: item.Status as ChecklistStatus,
    autoCheck: item.AutoCheck,
    description: item.Description,
    blockedBy: BLOCKED_BY[item.TaskId] ?? [],
    severity: TASK_SEVERITY[item.TaskId] ?? 'info',
  }));

  // Compute GL account variances
  const glAccounts: GLAccount[] = rawCoa.map((acct) => {
    const prior = acct.PriorPeriodBalance as number;
    const current = acct.Balance as number;
    const varianceAmt = current - prior;
    const variancePct = prior !== 0 ? (varianceAmt / Math.abs(prior)) * 100 : 0;
    const flags: string[] = acct._flags ?? [];
    // Flag: >50% swing on expense accounts, or explicit flag in data
    const isFlagged =
      flags.length > 0 ||
      (acct.Category === 'Expense' && Math.abs(variancePct) > 50) ||
      (acct.Category === 'Liability' && flags.length > 0);

    return {
      acctCode: acct.AcctCode,
      acctName: acct.AcctName,
      category: acct.Category,
      balance: current,
      priorBalance: prior,
      varianceAmt,
      variancePct,
      flags,
      isFlagged,
    };
  });

  const passed = checklistItems.filter((c) => c.status === 'passed').length;
  const failed = checklistItems.filter((c) => c.status === 'failed').length;
  const pending = checklistItems.filter((c) => c.status === 'pending').length;
  const categories = [...new Set(checklistItems.map((c) => c.category))];

  // Derive AP variance from flagged liability GL accounts
  const apVariance = glAccounts
    .filter((a) => a.isFlagged && a.category === 'Liability')
    .reduce((sum, a) => sum + Math.abs(a.varianceAmt), 0);

  // Derive duplicate exposure from payments (same vendor + amount + reference)
  const paymentMap = new Map<string, any[]>();
  for (const p of data.payments as any[]) {
    const key = `${p.CardCode}|${p.PaymentAmount}|${p.Reference}`;
    if (!paymentMap.has(key)) paymentMap.set(key, []);
    paymentMap.get(key)!.push(p);
  }
  const duplicateExposure = [...paymentMap.values()]
    .filter((group) => group.length > 1)
    .reduce((sum, group) => sum + (group[0].PaymentAmount as number), 0);

  // Derive after-hours count from journal entries (before 7AM or after 8PM)
  const afterHoursCount = (data.journalEntries as any[]).filter((je) => {
    if (!je.PostingTime || typeof je.PostingTime !== 'string') return false;
    const parts = je.PostingTime.split(':');
    if (parts.length < 1) return false;
    const hour = parseInt(parts[0], 10);
    return !isNaN(hour) && (hour < 7 || hour >= 20);
  }).length;

  return {
    total: checklistItems.length,
    passed,
    failed,
    pending,
    passRate: Math.round((passed / checklistItems.length) * 100),
    apVariance,
    duplicateExposure,
    afterHoursCount,
    categories,
    checklistItems,
    glAccounts,
  };
}
