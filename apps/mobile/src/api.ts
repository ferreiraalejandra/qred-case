import { dashboardSchema, transactionsPageSchema } from '@qred-case/contract';

declare const process: { env: { EXPO_PUBLIC_API_URL?: string } };

const baseUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export async function fetchDashboard(companyId: string, signal: AbortSignal) {
  const response = await fetch(`${baseUrl}/api/v1/companies/${encodeURIComponent(companyId)}/dashboard`, { signal });
  if (!response.ok) throw new Error(`Dashboard request failed (${response.status})`);
  return dashboardSchema.parse(await response.json());
}

export async function fetchTransactions(companyId: string, offset: number, signal: AbortSignal) {
  const url = `${baseUrl}/api/v1/companies/${encodeURIComponent(companyId)}/transactions?offset=${offset}&limit=20`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Transactions request failed (${response.status})`);
  return transactionsPageSchema.parse(await response.json());
}
