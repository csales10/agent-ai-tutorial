import type { MockData } from './mock-data';

export interface FraudAlert {
  pattern: string;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  explanation: string;
  ids: string[];
  exposure?: number;
  confidence: number;
}

const BUSINESS_HOURS_START = 7;
const BUSINESS_HOURS_END = 20;
const APPROVAL_THRESHOLD = 5000;

export function runFraudRules(data: MockData): FraudAlert[] {
  const alerts: FraudAlert[] = [];

  // --- Rule 1: Duplicate Payments (same vendor + amount + reference) ---
  const paymentMap = new Map<string, any[]>();
  for (const p of data.payments as any[]) {
    const key = `${p.CardCode}|${p.PaymentAmount}|${p.Reference}`;
    if (!paymentMap.has(key)) paymentMap.set(key, []);
    paymentMap.get(key)!.push(p);
  }
  for (const [, group] of paymentMap) {
    if (group.length > 1) {
      alerts.push({
        pattern: 'Duplicate Payment',
        riskLevel: 'High',
        title: `Duplicate payment to ${group[0].CardName}`,
        explanation: `${group.length} payments of ₱${group[0].PaymentAmount.toLocaleString()} to ${group[0].CardName} share the same reference (${group[0].Reference}). Likely a duplicate disbursement.`,
        ids: group.map((p: any) => p.DocNum),
        exposure: group[0].PaymentAmount,
        confidence: 95,
      });
    }
  }

  // --- Rule 2: Ghost Vendor (new vendor + null LastPurchaseDate + payment within 30 days) ---
  for (const vendor of data.vendors as any[]) {
    if (vendor.LastPurchaseDate !== null) continue;
    const vendorPayments = (data.payments as any[]).filter((p) => p.CardCode === vendor.CardCode);
    if (vendorPayments.length === 0) continue;
    const createDate = new Date(vendor.CreateDate);
    if (isNaN(createDate.getTime())) continue;
    for (const p of vendorPayments) {
      const payDate = new Date(p.DocDate);
      if (isNaN(payDate.getTime())) continue;
      const daysDiff = (payDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 30) {
        alerts.push({
          pattern: 'Ghost Vendor',
          riskLevel: 'Critical',
          title: `Ghost vendor payment — ${vendor.CardName}`,
          explanation: `Vendor ${vendor.CardCode} (${vendor.CardName}) was created on ${vendor.CreateDate} with no prior purchase history. A payment of ₱${p.PaymentAmount.toLocaleString()} was made ${Math.round(daysDiff)} days later. High risk of fictitious vendor fraud.`,
          ids: [vendor.CardCode, p.DocNum],
          exposure: p.PaymentAmount,
          confidence: 98,
        });
      }
    }
  }

  // --- Rule 3: Round Number Anomaly (exact thousands > 1000) ---
  for (const p of data.payments as any[]) {
    if (p.PaymentAmount > 1000 && p.PaymentAmount % 1000 === 0) {
      alerts.push({
        pattern: 'Round Number',
        riskLevel: 'Medium',
        title: `Round-number payment — ${p.CardName}`,
        explanation: `Payment of ₱${p.PaymentAmount.toLocaleString()} to ${p.CardName} is an exact round number. Legitimate invoices rarely result in perfectly round amounts.`,
        ids: [p.DocNum],
        confidence: 65,
      });
    }
  }

  // --- Rule 4: Split Transactions (same vendor + same day + each below threshold + sum above) ---
  const byVendorDate = new Map<string, any[]>();
  for (const p of data.payments as any[]) {
    const key = `${p.CardCode}|${p.DocDate}`;
    if (!byVendorDate.has(key)) byVendorDate.set(key, []);
    byVendorDate.get(key)!.push(p);
  }
  for (const [, group] of byVendorDate) {
    if (group.length < 2) continue;
    const allBelowThreshold = group.every((p: any) => p.PaymentAmount < APPROVAL_THRESHOLD);
    const combinedTotal = group.reduce((sum: number, p: any) => sum + p.PaymentAmount, 0);
    if (allBelowThreshold && combinedTotal > APPROVAL_THRESHOLD) {
      alerts.push({
        pattern: 'Split Transaction',
        riskLevel: 'High',
        title: `Split transactions — ${group[0].CardName}`,
        explanation: `${group.length} payments totalling ₱${combinedTotal.toLocaleString()} were made to ${group[0].CardName} on ${group[0].DocDate}. Each individual payment (₱${group.map((p: any) => p.PaymentAmount.toLocaleString()).join(', ₱')}) is below the ₱${APPROVAL_THRESHOLD.toLocaleString()} approval threshold, suggesting intentional splitting.`,
        ids: group.map((p: any) => p.DocNum),
        exposure: combinedTotal,
        confidence: 90,
      });
    }
  }

  // --- Rule 5: After-Hours Postings ---
  const afterHoursEntries = (data.journalEntries as any[]).filter((je) => {
    if (!je.PostingTime || typeof je.PostingTime !== 'string') return false;
    const parts = je.PostingTime.split(':');
    if (parts.length < 1) return false;
    const hour = parseInt(parts[0], 10);
    return !isNaN(hour) && (hour < BUSINESS_HOURS_START || hour >= BUSINESS_HOURS_END);
  });
  if (afterHoursEntries.length > 0) {
    const userGroups = new Map<string, any[]>();
    for (const je of afterHoursEntries) {
      if (!userGroups.has(je.CreatedBy)) userGroups.set(je.CreatedBy, []);
      userGroups.get(je.CreatedBy)!.push(je);
    }
    for (const [user, entries] of userGroups) {
      alerts.push({
        pattern: 'After-Hours Posting',
        riskLevel: entries.length >= 3 ? 'High' : 'Medium',
        title: `After-hours postings by ${user}`,
        explanation: `${entries.length} journal entr${entries.length === 1 ? 'y' : 'ies'} posted outside business hours (before ${BUSINESS_HOURS_START}:00 or after ${BUSINESS_HOURS_END}:00) by user "${user}". Times: ${entries.map((e: any) => e.PostingTime).join(', ')}.`,
        ids: entries.map((e: any) => String(e.TransId)),
        confidence: 80,
      });
    }
  }

  return alerts;
}
