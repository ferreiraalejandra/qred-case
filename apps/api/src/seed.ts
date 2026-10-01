import type { DashboardDatabase } from './database';
import type { DemoCompany } from './demoData';

/** Seed only missing demo companies, leaving edited database rows unchanged on restart. */
export function seedDemoData(db: DashboardDatabase, records: DemoCompany[]): void {
  db.transaction(() => {
    const insertCompany = db.prepare('INSERT INTO companies (id, name, organization_number) VALUES (?, ?, ?)');
    const insertCard = db.prepare(`INSERT INTO cards
      (id, company_id, status, label, provider, last_four, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const insertInvoice = db.prepare(`INSERT INTO invoices
      (id, company_id, invoice_number, amount, currency, due_date, status) VALUES (?, ?, ?, ?, ?, ?, 'unpaid')`);
    const insertLimit = db.prepare(`INSERT INTO spend_limits
      (id, company_id, period_start, period_end, amount, currency) VALUES (?, ?, ?, ?, ?, ?)`);
    const insertTransaction = db.prepare(`INSERT INTO transactions
      (id, company_id, merchant, merchant_logo_url, occurred_at, amount, currency) VALUES (?, ?, ?, ?, ?, ?, ?)`);

    for (const record of records) {
      const { company, card, invoiceDue, spend, transactions } = record;
      if (db.prepare('SELECT 1 FROM companies WHERE id = ?').get(company.id)) continue;
      insertCompany.run(company.id, company.name, company.organizationNumber);
      insertCard.run(card.id, company.id, card.status, card.label, card.provider, card.lastFour, card.logoUrl);
      if (invoiceDue) {
        insertInvoice.run(invoiceDue.id, company.id, invoiceDue.invoiceNumber,
          invoiceDue.amount, invoiceDue.currency, new Date(invoiceDue.dueDate).toISOString());
      }
      insertLimit.run(`limit_${company.id}_${spend.periodStart}`, company.id,
        spend.periodStart, spend.periodEnd, spend.limit, spend.currency);
      for (const transaction of transactions) {
        insertTransaction.run(transaction.id, company.id, transaction.merchant, transaction.merchantLogoUrl,
          new Date(transaction.occurredAt).toISOString(), transaction.amount, transaction.currency);
      }
    }
  })();
}
