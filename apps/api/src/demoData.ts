import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { dashboardSchema, transactionSchema } from '@qred-case/contract';

const mockCompanySchema = dashboardSchema.omit({ transactions: true }).extend({
  transactions: z.array(transactionSchema),
});
export type DemoCompany = z.infer<typeof mockCompanySchema>;

export function parseDemoData(data: unknown): DemoCompany[] {
  const companies = z.array(mockCompanySchema).parse(data);
  if (new Set(companies.map((record) => record.company.id)).size !== companies.length) {
    throw new Error('Duplicate company IDs in demo data');
  }
  return companies;
}

export function loadDemoData(filename: string): DemoCompany[] {
  return parseDemoData(JSON.parse(readFileSync(filename, 'utf8')) as unknown);
}
