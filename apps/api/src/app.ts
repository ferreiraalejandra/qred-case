import express from 'express';
import type { DashboardDatabase } from './database';
import { DashboardNotConfiguredError, getDashboard, getTransactionsPage } from './dashboardDataSource';

export function buildApp(db: DashboardDatabase, now: () => Date = () => new Date()) {
  const app = express();

  // Expo's local web preview
  app.use((request, response, next) => {
    const origin = request.get('Origin');
    if (origin === 'http://localhost:8081' || origin === 'http://127.0.0.1:8081') {
      response.vary('Origin');
      response.set('Access-Control-Allow-Origin', origin);
    }
    next();
  });

  app.get('/api/v1/companies/:companyId/dashboard', (request, response) => {
    try {
      const dashboard = getDashboard(db, request.params.companyId, now());
      if (!dashboard) {
        response.status(404).json({ error: 'Company not found' });
        return;
      }
      response.json(dashboard);
    } catch (error) {
      if (error instanceof DashboardNotConfiguredError) {
        response.status(409).json({ error: 'Dashboard not configured' });
        return;
      }
      throw error;
    }
  });

  app.get('/api/v1/companies/:companyId/transactions', (request, response) => {
    const { offset: rawOffset = '0', limit: rawLimit = '20' } = request.query;
    if (typeof rawOffset !== 'string' || !/^\d+$/.test(rawOffset) ||
        typeof rawLimit !== 'string' || !/^\d+$/.test(rawLimit)) {
      response.status(400).json({ error: 'Invalid pagination parameters' });
      return;
    }

    const offset = Number(rawOffset);
    const limit = Number(rawLimit);
    if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
      response.status(400).json({ error: 'Invalid pagination parameters' });
      return;
    }

    const page = getTransactionsPage(db, request.params.companyId, offset, limit, now());
    if (!page) {
      response.status(404).json({ error: 'Company not found' });
      return;
    }
    response.json(page);
  });

  return app;
}
