import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import request from 'supertest';
import { dashboardSchema, transactionsPageSchema } from '@qred-case/contract';
import { buildApp } from './app';
import { openDatabase } from './database';
import { parseDemoData } from './demoData';
import { seedDemoData } from './seed';

const now = new Date('2026-09-30T12:00:00Z');

function demoDb() {
  const db = openDatabase(':memory:');
  const records = parseDemoData(JSON.parse(readFileSync(join(__dirname, '../data/demo.json'), 'utf8')) as unknown);
  seedDemoData(db, records);
  return db;
}

test('returns company details, spend and the three newest transactions', async () => {
  const db = demoDb();
  try {
    const response = await request(buildApp(db, () => now)).get('/api/v1/companies/company_demo/dashboard');
    assert.equal(response.status, 200);
    const dashboard = dashboardSchema.parse(response.body);
    assert.deepEqual(dashboard.company, {
      id: 'company_demo', name: 'Qred Bank AB', organizationNumber: '559008-9800',
    });
    assert.equal(dashboard.card.provider, 'visa');
    assert.equal(dashboard.card.lastFour, '4242');
    assert.equal(dashboard.invoiceDue?.invoiceNumber, 'DEMO-2026-001');
    assert.deepEqual(dashboard.spend, {
      currency: 'SEK', periodStart: '2026-09-01', periodEnd: '2026-09-30',
      limit: 10000, spent: 4600, remaining: 5400,
    });
    assert.equal(dashboard.transactions.totalCount, 6);
    assert.deepEqual(dashboard.transactions.items.map((item) => item.id), ['txn_6', 'txn_5', 'txn_3']);
    assert.equal(dashboard.transactions.items[0].merchantLogoUrl,
      'https://www.google.com/s2/favicons?domain=ikea.com&sz=64');
  } finally {
    db.close();
  }
});

test('returns the full transaction history in pages', async () => {
  const db = demoDb();
  try {
    const app = buildApp(db, () => now);
    const pages = await Promise.all([0, 2, 4].map(async (offset) => {
      const response = await request(app).get(`/api/v1/companies/company_demo/transactions?offset=${offset}&limit=2`);
      assert.equal(response.status, 200);
      return transactionsPageSchema.parse(response.body);
    }));
    assert.ok(pages.every((page) => page.totalCount === 6));
    assert.deepEqual(pages.flatMap((page) => page.items.map((item) => item.id)),
      ['txn_6', 'txn_5', 'txn_3', 'txn_4', 'txn_2', 'txn_1']);
  } finally {
    db.close();
  }
});

test('orders transactions by actual time across time zones', async () => {
  const db = openDatabase(':memory:');
  try {
    const records = parseDemoData(JSON.parse(readFileSync(join(__dirname, '../data/demo.json'), 'utf8')) as unknown);
    records[0].transactions.push({ id: 'offset', merchant: 'Offset merchant', merchantLogoUrl: null,
      occurredAt: '2026-09-29T15:00:00+04:00', amount: 1, currency: 'SEK' });
    seedDemoData(db, records);
    const response = await request(buildApp(db, () => now)).get('/api/v1/companies/company_demo/dashboard');
    const dashboard = dashboardSchema.parse(response.body);
    assert.deepEqual(dashboard.transactions.items.map((item) => item.id), ['txn_6', 'offset', 'txn_5']);
  } finally {
    db.close();
  }
});

test('shows the nearest unpaid invoice and empty data for a new company', async () => {
  const db = demoDb();
  try {
    db.prepare('INSERT INTO companies (id, name, organization_number) VALUES (?, ?, ?)')
      .run('other', 'Other AB', '123456-7890');
    db.prepare(`INSERT INTO cards (id, company_id, status, label, provider, last_four)
      VALUES (?, ?, ?, ?, ?, ?)`).run('other_card', 'other', 'active', 'Other card', 'visa', '1234');
    db.prepare(`INSERT INTO spend_limits (id, company_id, period_start, period_end, amount, currency)
      VALUES (?, ?, ?, ?, ?, ?)`).run('other_limit', 'other', '2026-09-01', '2026-09-30', 2000, 'SEK');
    db.prepare(`INSERT INTO invoices (id, company_id, invoice_number, amount, currency, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run('paid', 'company_demo', 'PAID-1', 100,
      'SEK', '2026-09-01T00:00:00.000Z', 'paid');
    db.prepare(`INSERT INTO invoices (id, company_id, invoice_number, amount, currency, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run('nearest', 'company_demo', 'DUE-2', 100,
      'SEK', '2026-09-10T00:00:00.000Z', 'unpaid');

    const app = buildApp(db, () => now);
    const company = dashboardSchema.parse((await request(app).get('/api/v1/companies/company_demo/dashboard')).body);
    const other = dashboardSchema.parse((await request(app).get('/api/v1/companies/other/dashboard')).body);
    assert.equal(company.invoiceDue?.invoiceNumber, 'DUE-2');
    assert.equal(other.invoiceDue, null);
    assert.deepEqual(other.transactions, { items: [], totalCount: 0 });
    assert.equal(other.spend.remaining, 2000);
    assert.equal((await request(app).get('/api/v1/companies/other/transactions')).body.totalCount, 0);
  } finally {
    db.close();
  }
});

test('keeps invoices, transactions and spend separate for each company', async () => {
  const db = demoDb();
  try {
    db.prepare('INSERT INTO companies (id, name, organization_number) VALUES (?, ?, ?)')
      .run('other', 'Other AB', '123456-7890');
    db.prepare(`INSERT INTO cards (id, company_id, status, label, provider, last_four)
      VALUES (?, ?, ?, ?, ?, ?)`).run('other_card', 'other', 'active', 'Other card', 'visa', '1234');
    db.prepare(`INSERT INTO spend_limits (id, company_id, period_start, period_end, amount, currency)
      VALUES (?, ?, ?, ?, ?, ?)`).run('other_limit', 'other', '2026-09-01', '2026-09-30', 2000, 'SEK');
    db.prepare(`INSERT INTO invoices (id, company_id, invoice_number, amount, currency, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run('other_invoice', 'other', 'OTHER-1', 100,
      'SEK', '2026-10-01T00:00:00.000Z', 'unpaid');
    db.prepare(`INSERT INTO transactions (id, company_id, merchant, occurred_at, amount, currency)
      VALUES (?, ?, ?, ?, ?, ?)`).run('other_txn', 'other', 'Other purchase', '2026-09-29T15:00:00.000Z', 120, 'SEK');

    const app = buildApp(db, () => now);
    const demo = dashboardSchema.parse((await request(app).get('/api/v1/companies/company_demo/dashboard')).body);
    const other = dashboardSchema.parse((await request(app).get('/api/v1/companies/other/dashboard')).body);
    const demoPage = transactionsPageSchema.parse(
      (await request(app).get('/api/v1/companies/company_demo/transactions')).body,
    );
    const otherPage = transactionsPageSchema.parse((await request(app).get('/api/v1/companies/other/transactions')).body);

    assert.equal(demo.invoiceDue?.invoiceNumber, 'DEMO-2026-001');
    assert.equal(demo.spend.spent, 4600);
    assert.equal(demo.transactions.totalCount, 6);
    assert.equal(demoPage.totalCount, 6);
    assert.ok(demoPage.items.every((item) => item.id !== 'other_txn'));
    assert.equal(other.invoiceDue?.invoiceNumber, 'OTHER-1');
    assert.equal(other.spend.spent, 120);
    assert.equal(other.spend.remaining, 1880);
    assert.deepEqual(other.transactions.items.map((item) => item.id), ['other_txn']);
    assert.deepEqual(otherPage.items.map((item) => item.id), ['other_txn']);
  } finally {
    db.close();
  }
});

test('recalculates spend from purchases and never shows negative remaining', async () => {
  const db = demoDb();
  try {
    const insert = db.prepare(`INSERT INTO transactions (id, company_id, merchant, occurred_at, amount, currency)
      VALUES (?, ?, ?, ?, ?, ?)`);
    insert.run('extra', 'company_demo', 'Large purchase', '2026-09-29T13:00:00.000Z', 6000, 'SEK');
    insert.run('future', 'company_demo', 'Future purchase', '2026-10-01T13:00:00.000Z', 9000, 'SEK');
    const response = await request(buildApp(db, () => now)).get('/api/v1/companies/company_demo/dashboard');
    const dashboard = dashboardSchema.parse(response.body);
    assert.equal(dashboard.spend.spent, 10600);
    assert.equal(dashboard.spend.remaining, 0);
    assert.equal(dashboard.transactions.totalCount, 7);
    assert.equal(dashboard.transactions.items[0].id, 'extra');
  } finally {
    db.close();
  }
});

test('counts purchases on both period boundary days but not outside the period or in the future', async () => {
  const db = demoDb();
  try {
    const insert = db.prepare(`INSERT INTO transactions (id, company_id, merchant, occurred_at, amount, currency)
      VALUES (?, ?, ?, ?, ?, ?)`);
    for (const [id, occurredAt, amount] of [
      ['before', '2026-08-31T23:59:59.999Z', 7],
      ['start', '2026-09-01T00:00:00.000Z', 11],
      ['end', '2026-09-30T23:59:59.999Z', 13],
      ['after', '2026-10-01T00:00:00.000Z', 17],
    ] as const) {
      insert.run(id, 'company_demo', id, occurredAt, amount, 'SEK');
    }

    const atNoon = dashboardSchema.parse(
      (await request(buildApp(db, () => now)).get('/api/v1/companies/company_demo/dashboard')).body,
    );
    assert.equal(atNoon.spend.spent, 4611);

    const afterPeriod = dashboardSchema.parse((await request(buildApp(db, () => new Date('2026-10-02T12:00:00Z')))
      .get('/api/v1/companies/company_demo/dashboard')).body);
    assert.equal(afterPeriod.spend.spent, 4624);
    assert.equal(afterPeriod.spend.remaining, 5376);
  } finally {
    db.close();
  }
});

test('returns clear errors for unknown companies, missing setup and invalid pagination', async () => {
  const db = demoDb();
  try {
    const app = buildApp(db, () => now);
    assert.equal((await request(app).get('/api/v1/companies/unknown/dashboard')).status, 404);
    assert.equal((await request(app).get('/api/v1/companies/unknown/transactions')).status, 404);
    for (const query of ['?limit=0', '?limit=51', '?offset=-1', '?offset=1.5', '?offset=999999999999999999999']) {
      assert.equal((await request(app).get(`/api/v1/companies/company_demo/transactions${query}`)).status, 400);
    }
    db.prepare('DELETE FROM spend_limits WHERE company_id = ?').run('company_demo');
    const missing = await request(app).get('/api/v1/companies/company_demo/dashboard');
    assert.equal(missing.status, 409);
    assert.deepEqual(missing.body, { error: 'Dashboard not configured' });
  } finally {
    db.close();
  }
});

test('allows the local web preview to request dashboard data', async () => {
  const db = demoDb();
  try {
    const response = await request(buildApp(db, () => now)).get('/api/v1/companies/company_demo/dashboard')
      .set('Origin', 'http://localhost:8081');
    assert.equal(response.status, 200);
    assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:8081');
  } finally {
    db.close();
  }
});
