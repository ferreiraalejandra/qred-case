import { buildApp } from './app';
import { openDatabase } from './database';
import { loadDemoData } from './demoData';
import { seedDemoData } from './seed';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const port = Number(process.env.PORT ?? 3000);
const databasePath = resolve(process.env.DATABASE_PATH ?? resolve(__dirname, '../data/dashboard.sqlite'));
mkdirSync(dirname(databasePath), { recursive: true });
const db = openDatabase(databasePath);
seedDemoData(db, loadDemoData(resolve(__dirname, '../data/demo.json')));
const app = buildApp(db);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Dashboard API listening on port ${port}`);
});

function shutdown() {
  server.close(() => db.close());
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.on('error', (error: Error) => {
  console.error(error);
  db.close();
  process.exit(1);
});
