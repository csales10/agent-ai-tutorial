import journalEntries from '../../mock-sap-data/journal-entries.json';
import vendors from '../../mock-sap-data/vendors.json';
import payments from '../../mock-sap-data/payments.json';
import chartOfAccounts from '../../mock-sap-data/chart-of-accounts.json';
import auditLog from '../../mock-sap-data/audit-log.json';
import closingChecklist from '../../mock-sap-data/closing-checklist.json';

export function getMockData() {
  return {
    journalEntries,
    vendors,
    payments,
    chartOfAccounts,
    auditLog,
    closingChecklist,
  };
}

export type MockData = ReturnType<typeof getMockData>;
