import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.SQLITE_PATH ?? './data/app.db';
const secret = process.env.APP_SECRET ?? 'dev-secret-please-change';

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

function ensureSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS instance_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE DEFAULT 'default',
      zabbix_url TEXT NOT NULL,
      username TEXT,
      token_enc TEXT NOT NULL,
      auth_type TEXT NOT NULL CHECK (auth_type IN ('token', 'password')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function encrypt(value) {
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash('sha256').update(secret).digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decrypt(payloadBase64) {
  const payload = Buffer.from(payloadBase64, 'base64');
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const encrypted = payload.subarray(28);
  const key = crypto.createHash('sha256').update(secret).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

function upsertSettings({ name = 'default', zabbixUrl, username, secretValue, authType = 'token' }) {
  const encrypted = encrypt(secretValue);
  const existing = db.prepare('SELECT id FROM instance_settings WHERE name = ?').get(name);

  if (existing) {
    db.prepare(`
      UPDATE instance_settings
      SET zabbix_url = ?, username = ?, token_enc = ?, auth_type = ?, updated_at = CURRENT_TIMESTAMP
      WHERE name = ?
    `).run(zabbixUrl, username, encrypted, authType, name);
    return existing.id;
  }

  const result = db.prepare(`
    INSERT INTO instance_settings (name, zabbix_url, username, token_enc, auth_type)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, zabbixUrl, username, encrypted, authType);

  return result.lastInsertRowid;
}

function getSettings(name = 'default') {
  const row = db.prepare('SELECT * FROM instance_settings WHERE name = ?').get(name);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    zabbixUrl: row.zabbix_url,
    username: row.username,
    secretValue: decrypt(row.token_enc),
    authType: row.auth_type
  };
}

ensureSchema();

export { db, upsertSettings, getSettings };
