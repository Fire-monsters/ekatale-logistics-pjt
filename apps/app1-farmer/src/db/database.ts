/* eslint-disable @typescript-eslint/no-shadow */
/**
 * Local SQLite Database
 * Stores data for offline-first operation.
 * PRD: "app must display last-cached data when offline"
 */

import * as SQLite from 'expo-sqlite';
import { DB_TABLES } from '@constants/index';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('ekatale.db');
  await initializeSchema(db);
  return db;
}

async function initializeSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Pending listings (drafts created offline)
    CREATE TABLE IF NOT EXISTS ${DB_TABLES.PENDING_LISTINGS} (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    );

    -- Cached prices (last known prices for offline display)
    CREATE TABLE IF NOT EXISTS ${DB_TABLES.CACHED_PRICES} (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Cached orders (for offline viewing)
    CREATE TABLE IF NOT EXISTS ${DB_TABLES.CACHED_ORDERS} (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- AI chat history (persist conversation)
    CREATE TABLE IF NOT EXISTS ${DB_TABLES.CHAT_HISTORY} (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      ts TEXT NOT NULL
    );

    -- Sync queue (actions to send when back online)
    CREATE TABLE IF NOT EXISTS ${DB_TABLES.SYNC_QUEUE} (
      id TEXT PRIMARY KEY,
      action_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      enqueued_at TEXT NOT NULL,
      retry_count INTEGER DEFAULT 0,
      last_error TEXT
    );
  `);
}

// ─────────────────────────────────────────────
// CACHED PRICES
// ─────────────────────────────────────────────

export async function saveCachedPrices(prices: unknown[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const price of prices as any[]) {
      const key = `${price.commodityId}-${price.regionId}`;
      await db.runAsync(
        `INSERT OR REPLACE INTO ${DB_TABLES.CACHED_PRICES} (key, data, updated_at) VALUES (?, ?, ?)`,
        [key, JSON.stringify(price), new Date().toISOString()],
      );
    }
  });
}

export async function getCachedPrices(): Promise<unknown[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ data: string }>(
    `SELECT data FROM ${DB_TABLES.CACHED_PRICES} ORDER BY updated_at DESC`,
  );
  return rows.map((r) => JSON.parse(r.data));
}

// ─────────────────────────────────────────────
// CACHED ORDERS
// ─────────────────────────────────────────────

export async function saveCachedOrders(orders: unknown[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const order of orders as any[]) {
      await db.runAsync(
        `INSERT OR REPLACE INTO ${DB_TABLES.CACHED_ORDERS} (id, data, updated_at) VALUES (?, ?, ?)`,
        [order.id, JSON.stringify(order), new Date().toISOString()],
      );
    }
  });
}

export async function getCachedOrders(): Promise<unknown[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ data: string }>(
    `SELECT data FROM ${DB_TABLES.CACHED_ORDERS} ORDER BY updated_at DESC`,
  );
  return rows.map((r) => JSON.parse(r.data));
}

// ─────────────────────────────────────────────
// CHAT HISTORY
// ─────────────────────────────────────────────

export async function saveChatMessage(
  id: string,
  role: 'user' | 'ai',
  content: string,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO ${DB_TABLES.CHAT_HISTORY} (id, role, content, ts) VALUES (?, ?, ?, ?)`,
    [id, role, content, new Date().toISOString()],
  );
  // Keep only last 100 messages
  await db.runAsync(
    `DELETE FROM ${DB_TABLES.CHAT_HISTORY} WHERE id NOT IN (
        SELECT id FROM ${DB_TABLES.CHAT_HISTORY} ORDER BY ts DESC LIMIT 100
    )`,
  );
}

export async function getChatHistory(): Promise<
  { id: string; role: 'user' | 'ai'; content: string; ts: string }[]
> {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT * FROM ${DB_TABLES.CHAT_HISTORY} ORDER BY ts ASC`,
  );
}

// ─────────────────────────────────────────────
// SYNC QUEUE
// ─────────────────────────────────────────────

export async function enqueueSyncAction(
  id: string,
  actionType: string,
  payload: unknown,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO ${DB_TABLES.SYNC_QUEUE} (id, action_type, payload, enqueued_at) VALUES (?, ?, ?, ?)`,
    [id, actionType, JSON.stringify(payload), new Date().toISOString()],
  );
}

export async function getPendingSyncActions(): Promise<
  { id: string; actionType: string; payload: unknown; retryCount: number }[]
> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    action_type: string;
    payload: string;
    retry_count: number;
  }>(`SELECT * FROM ${DB_TABLES.SYNC_QUEUE} ORDER BY enqueued_at ASC LIMIT 20`);
  return rows.map((r) => ({
    id: r.id,
    actionType: r.action_type,
    payload: JSON.parse(r.payload),
    retryCount: r.retry_count,
  }));
}

export async function removeSyncAction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM ${DB_TABLES.SYNC_QUEUE} WHERE id = ?`, [id]);
}

export async function incrementRetryCount(id: string, error: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE ${DB_TABLES.SYNC_QUEUE} SET retry_count = retry_count + 1, last_error = ? WHERE id = ?`,
    [error, id],
  );
}
