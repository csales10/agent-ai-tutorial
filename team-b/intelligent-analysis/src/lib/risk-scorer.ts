import { runFraudRules } from './fraud-rules';
import type { MockData } from './mock-data';

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Clean';

export interface ScoredJournalEntry {
  transId: number;
  transDate: string;
  memo: string;
  reference: string;
  createdBy: string;
  postingTime: string;
  netAmount: number; // sum of all Debit lines
  riskLevel: RiskLevel;
  flags: string[];
}

export interface ScoredPayment {
  docEntry: number;
  docNum: string;
  cardName: string;
  docDate: string;
  paymentAmount: number;
  paymentMethod: string;
  bankCode: string;
  riskLevel: RiskLevel;
  flags: string[];
}

export interface MonitorSummary {
  totalTransactions: number;
  flaggedCount: number;
  criticalCount: number;
  totalExposure: number;
  riskBreakdown: Record<RiskLevel, number>;
}

const RISK_ORDER: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1, Clean: 0 };

function maxRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RISK_ORDER[a] >= RISK_ORDER[b] ? a : b;
}

function riskFromFlags(flags: string[]): RiskLevel {
  if (flags.length === 0) return 'Clean';
  const text = flags.join(' ').toLowerCase();
  if (text.includes('ghost')) return 'Critical';
  if (text.includes('duplicate') || text.includes('split')) return 'High';
  return 'Medium';
}

export function scoreTransactions(data: MockData) {
  const alerts = runFraudRules(data);

  // Build id → alert[] maps (journal entry TransIds stored as strings, payment DocNums)
  const alertsByJeId = new Map<string, typeof alerts>();
  const alertsByPayNum = new Map<string, typeof alerts>();

  for (const alert of alerts) {
    for (const id of alert.ids) {
      // TransIds are numeric strings; DocNums start with "PAY-"
      if (id.startsWith('PAY-')) {
        if (!alertsByPayNum.has(id)) alertsByPayNum.set(id, []);
        alertsByPayNum.get(id)!.push(alert);
      } else if (!isNaN(Number(id))) {
        if (!alertsByJeId.has(id)) alertsByJeId.set(id, []);
        alertsByJeId.get(id)!.push(alert);
      }
    }
  }

  // Score journal entries
  const journalEntries: ScoredJournalEntry[] = (data.journalEntries as any[]).map((je) => {
    const jeAlerts = alertsByJeId.get(String(je.TransId)) || [];
    const flagsFromAlerts = jeAlerts.map((a) => a.title);
    const staticFlags: string[] = je._flags || [];
    const allFlags = [...new Set([...flagsFromAlerts, ...staticFlags])];

    let riskLevel: RiskLevel = 'Clean';
    for (const a of jeAlerts) riskLevel = maxRisk(riskLevel, a.riskLevel);
    if (riskLevel === 'Clean' && staticFlags.length > 0) riskLevel = riskFromFlags(staticFlags);

    const netAmount = ((je.Lines as any[]) ?? []).reduce((sum: number, l: any) => sum + (l.Debit || 0), 0);

    return {
      transId: je.TransId,
      transDate: je.TransDate,
      memo: je.Memo,
      reference: je.Reference,
      createdBy: je.CreatedBy,
      postingTime: je.PostingTime,
      netAmount,
      riskLevel,
      flags: allFlags,
    };
  });

  // Score payments
  const payments: ScoredPayment[] = (data.payments as any[]).map((p) => {
    const pAlerts = alertsByPayNum.get(p.DocNum) || [];
    const flagsFromAlerts = pAlerts.map((a) => a.title);
    const staticFlags: string[] = p._flags || [];
    const allFlags = [...new Set([...flagsFromAlerts, ...staticFlags])];

    let riskLevel: RiskLevel = 'Clean';
    for (const a of pAlerts) riskLevel = maxRisk(riskLevel, a.riskLevel);
    if (riskLevel === 'Clean' && staticFlags.length > 0) riskLevel = riskFromFlags(staticFlags);

    return {
      docEntry: p.DocEntry,
      docNum: p.DocNum,
      cardName: p.CardName,
      docDate: p.DocDate,
      paymentAmount: p.PaymentAmount,
      paymentMethod: p.PaymentMethod,
      bankCode: p.BankCode,
      riskLevel,
      flags: allFlags,
    };
  });

  // Compute summary
  const all = [...journalEntries, ...payments];
  const flagged = all.filter((t) => t.riskLevel !== 'Clean');
  const critical = all.filter((t) => t.riskLevel === 'Critical');

  const criticalExposure = alerts
    .filter((a) => a.riskLevel === 'Critical' || a.riskLevel === 'High')
    .reduce((sum, a) => sum + (a.exposure || 0), 0);

  const riskBreakdown: Record<RiskLevel, number> = {
    Critical: 0, High: 0, Medium: 0, Low: 0, Clean: 0,
  };
  for (const t of all) riskBreakdown[t.riskLevel]++;

  const summary: MonitorSummary = {
    totalTransactions: all.length,
    flaggedCount: flagged.length,
    criticalCount: critical.length,
    totalExposure: criticalExposure,
    riskBreakdown,
  };

  return { journalEntries, payments, summary, alerts };
}
