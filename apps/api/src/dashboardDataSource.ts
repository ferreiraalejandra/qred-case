import { dashboardSchema, transactionsPageSchema, type Dashboard, type TransactionsPage } from '@qred-case/contract';
import type { DashboardDatabase } from './database';

type CompanyRow = Dashboard['company'];
type CardRow = Dashboard['card'];
type InvoiceRow = NonNullable<Dashboard['invoiceDue']>;
type LimitRow = { periodStart: string; periodEnd: string; limit: number; currency: 'SEK' };
type TransactionRow = Dashboard['transactions']['items'][number];

export class DashboardNotConfiguredError extends Error {}

function countTransactions(db: DashboardDatabase, companyId: string, now: string): number {
  const row = db.prepare(`SELECT COUNT(*) AS totalCount FROM transactions
    WHERE company_id = ? AND occurred_at <= ?`).get(companyId, now) as { totalCount: number };
  return row.totalCount;
}

/** Return the mobile summary without fetching the full transaction list. */
export function getDashboard(db: DashboardDatabase, companyId: string, now = new Date()): Dashboard | null {
  return db.transaction(() => {
    const company = db.prepare(`SELECT id, name, organization_number AS organizationNumber
      FROM companies WHERE id = ?`).get(companyId) as CompanyRow | undefined;
    if (!company) return null;
    const card = db.prepare(`SELECT id, status, label, provider, last_four AS lastFour, logo_url AS logoUrl
      FROM cards WHERE company_id = ?`).get(companyId) as CardRow | undefined;
    const limit = db.prepare(`SELECT period_start AS periodStart, period_end AS periodEnd,
      amount AS "limit", currency FROM spend_limits WHERE company_id = ?
      ORDER BY period_start DESC LIMIT 1`).get(companyId) as LimitRow | undefined;
    if (!card || !limit) throw new DashboardNotConfiguredError(`Missing dashboard card or spend limit for ${companyId}`);

    const invoiceDue = db.prepare(`SELECT id, invoice_number AS invoiceNumber, amount, currency,
      due_date AS dueDate FROM invoices WHERE company_id = ? AND status = 'unpaid'
      ORDER BY due_date ASC, id ASC LIMIT 1`).get(companyId) as InvoiceRow | undefined;
    const asOf = now.toISOString();
    const periodEndExclusive = new Date(`${limit.periodEnd}T00:00:00.000Z`);
    periodEndExclusive.setUTCDate(periodEndExclusive.getUTCDate() + 1);
    const { spent } = db.prepare(`SELECT COALESCE(SUM(amount), 0) AS spent FROM transactions
      WHERE company_id = ? AND occurred_at >= ? AND occurred_at < ? AND occurred_at <= ?`)
      .get(companyId, `${limit.periodStart}T00:00:00.000Z`, periodEndExclusive.toISOString(), asOf) as { spent: number };
    const items = db.prepare(`SELECT id, merchant, merchant_logo_url AS merchantLogoUrl,
      occurred_at AS occurredAt, amount, currency FROM transactions
      WHERE company_id = ? AND occurred_at <= ? ORDER BY occurred_at DESC, id DESC LIMIT 3`)
      .all(companyId, asOf) as TransactionRow[];

    return dashboardSchema.parse({
      company, card, invoiceDue: invoiceDue ?? null,
      spend: {
        currency: limit.currency, periodStart: limit.periodStart, periodEnd: limit.periodEnd,
        limit: limit.limit, spent, remaining: Math.max(0, limit.limit - spent),
      },
      transactions: { items, totalCount: countTransactions(db, companyId, asOf) },
    });
  })();
}

export function getTransactionsPage(
  db: DashboardDatabase, companyId: string, offset: number, limit: number, now = new Date(),
): TransactionsPage | null {
  return db.transaction(() => {
    if (!db.prepare('SELECT 1 FROM companies WHERE id = ?').get(companyId)) return null;
    const asOf = now.toISOString();
    const items = db.prepare(`SELECT id, merchant, merchant_logo_url AS merchantLogoUrl,
      occurred_at AS occurredAt, amount, currency FROM transactions
      WHERE company_id = ? AND occurred_at <= ? ORDER BY occurred_at DESC, id DESC LIMIT ? OFFSET ?`)
      .all(companyId, asOf, limit, offset);
    return transactionsPageSchema.parse({
      items, totalCount: countTransactions(db, companyId, asOf), offset, limit,
    });
  })();
}
