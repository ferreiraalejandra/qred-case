import { z } from 'zod';

// Amounts are plain SEK values in this case study (e.g. 5400 means 5,400 kr).
const amount = z.number().finite().nonnegative();
const currency = z.literal('SEK');

export const transactionSchema = z.object({
  id: z.string(),
  merchant: z.string(),
  merchantLogoUrl: z.string().url().nullable(),
  occurredAt: z.string().datetime({ offset: true }),
  amount,
  currency,
});

export const transactionsPageSchema = z.object({
  items: z.array(transactionSchema),
  totalCount: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
  limit: z.number().int().min(1).max(50),
});

export type TransactionsPage = z.infer<typeof transactionsPageSchema>;

export const dashboardSchema = z.object({
  company: z.object({
    id: z.string(),
    name: z.string(),
    organizationNumber: z.string().regex(/^\d{6}-\d{4}$/),
  }),
  card: z.object({
    id: z.string(),
    status: z.enum(['inactive', 'active', 'blocked']),
    label: z.string(),
    provider: z.enum(['visa', 'mastercard']),
    lastFour: z.string().regex(/^\d{4}$/),
    logoUrl: z.string().url().nullable(),
  }),
  invoiceDue: z.object({
    id: z.string(),
    invoiceNumber: z.string().min(1),
    amount,
    currency,
    dueDate: z.string().datetime({ offset: true }),
  }).nullable(),
  spend: z.object({
    currency,
    periodStart: z.string().date(),
    periodEnd: z.string().date(),
    limit: amount,
    spent: amount,
    remaining: amount,
  }),
  transactions: z.object({
    items: z.array(transactionSchema),
    totalCount: z.number().int().nonnegative(),
  }),
});

export type Dashboard = z.infer<typeof dashboardSchema>;
