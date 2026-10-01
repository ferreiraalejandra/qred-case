import type { Dashboard, TransactionsPage } from '@qred-case/contract';

export const demoTransaction: TransactionsPage['items'][number] = {
  id: 'txn_2',
  merchant: 'Train tickets',
  merchantLogoUrl: null,
  occurredAt: '2026-09-29T10:00:00Z',
  amount: 420,
  currency: 'SEK',
};

export const demoDashboard: Dashboard = {
  company: { id: 'company_demo', name: 'Qred Bank AB', organizationNumber: '559008-9800' },
  card: {
    id: 'card_demo', label: 'Demo company card', status: 'inactive', provider: 'visa',
    lastFour: '4242', logoUrl: null,
  },
  invoiceDue: {
    id: 'invoice_demo', invoiceNumber: 'DEMO-2026-001', amount: 1200,
    currency: 'SEK', dueDate: '2026-10-15T00:00:00.000Z',
  },
  spend: {
    currency: 'SEK', periodStart: '2026-09-01', periodEnd: '2026-09-30',
    limit: 10000, spent: 4600, remaining: 5400,
  },
  transactions: {
    totalCount: 6,
    items: [
      {
        id: 'txn_6', merchant: 'IKEA',
        merchantLogoUrl: 'https://www.google.com/s2/favicons?domain=ikea.com&sz=64',
        occurredAt: '2026-09-29T12:00:00.000Z', amount: 900, currency: 'SEK',
      },
      {
        id: 'txn_5', merchant: 'Fuel stop', merchantLogoUrl: null,
        occurredAt: '2026-09-28T09:45:00.000Z', amount: 800, currency: 'SEK',
      },
      {
        id: 'txn_3', merchant: 'Office supplies', merchantLogoUrl: null,
        occurredAt: '2026-09-27T15:30:00.000Z', amount: 850, currency: 'SEK',
      },
    ],
  },
};

export function transactionPage(
  items: TransactionsPage['items'],
  offset = 0,
): TransactionsPage {
  return { items, totalCount: 2, offset, limit: 20 };
}
