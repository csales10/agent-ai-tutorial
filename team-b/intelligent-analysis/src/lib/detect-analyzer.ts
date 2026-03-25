import { runFraudRules } from './fraud-rules';
import type { FraudAlert } from './fraud-rules';
import type { MockData } from './mock-data';

export type { FraudAlert };

export interface PatternSummary {
  pattern: string;
  count: number;
  exposure: number;
  maxRisk: 'Critical' | 'High' | 'Medium' | 'Low';
  icon: string;
}

export interface DetectSummary {
  totalAlerts: number;
  totalExposure: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  patterns: PatternSummary[];
  alerts: FraudAlert[];
}

const RISK_ORDER: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
const PATTERN_ICONS: Record<string, string> = {
  'Duplicate Payment':   '🔁',
  'Ghost Vendor':        '👻',
  'Round Number':        '🔢',
  'Split Transaction':   '✂️',
  'After-Hours Posting': '🌙',
};

export function analyzeDetect(data: MockData): DetectSummary {
  const alerts = runFraudRules(data);

  // Group by pattern
  const patternMap = new Map<string, { alerts: FraudAlert[]; totalExposure: number }>();
  for (const alert of alerts) {
    if (!patternMap.has(alert.pattern)) patternMap.set(alert.pattern, { alerts: [], totalExposure: 0 });
    const entry = patternMap.get(alert.pattern)!;
    entry.alerts.push(alert);
    entry.totalExposure += alert.exposure ?? 0;
  }

  const patterns: PatternSummary[] = [];
  for (const [pattern, { alerts: pAlerts, totalExposure }] of patternMap) {
    const maxRisk = pAlerts.reduce<'Critical' | 'High' | 'Medium' | 'Low'>((max, a) =>
      RISK_ORDER[a.riskLevel] > RISK_ORDER[max] ? a.riskLevel : max, 'Low'
    );
    patterns.push({
      pattern,
      count: pAlerts.length,
      exposure: totalExposure,
      maxRisk,
      icon: PATTERN_ICONS[pattern] ?? '⚠',
    });
  }

  // Sort patterns: Critical first
  patterns.sort((a, b) => RISK_ORDER[b.maxRisk] - RISK_ORDER[a.maxRisk]);

  const totalExposure = alerts.reduce((sum, a) => sum + (a.exposure ?? 0), 0);

  return {
    totalAlerts: alerts.length,
    totalExposure,
    criticalCount: alerts.filter((a) => a.riskLevel === 'Critical').length,
    highCount: alerts.filter((a) => a.riskLevel === 'High').length,
    mediumCount: alerts.filter((a) => a.riskLevel === 'Medium').length,
    patterns,
    alerts,
  };
}
