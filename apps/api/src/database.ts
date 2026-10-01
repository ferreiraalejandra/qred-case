import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type DashboardDatabase = Database.Database;

export function openDatabase(filename: string): DashboardDatabase {
  const db = new Database(filename);
  try {
    db.pragma('foreign_keys = ON');
    const version = db.pragma('user_version', { simple: true }) as number;
    if (version !== 0 && version !== 1) throw new Error(`Unsupported dashboard schema version: ${version}`);
    if (version === 0) {
      db.transaction(() => {
        db.exec(readFileSync(join(__dirname, '../schema.sql'), 'utf8'));
        db.pragma('user_version = 1');
      })();
    }
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}
