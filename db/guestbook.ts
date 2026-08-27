import { env } from "cloudflare:workers";

export type GuestbookRow = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};

const encoder = new TextEncoder();

export async function ensureGuestbookSchema() {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS guestbook_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_guestbook_entries_created_at
      ON guestbook_entries(created_at DESC, id DESC)`),
  ]);
}

export async function hashPassword(password: string, salt?: string) {
  const resolvedSalt = salt ?? crypto.randomUUID();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${resolvedSalt}:${password}`));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${resolvedSalt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string) {
  const separator = stored.indexOf(":");
  if (separator < 0) return false;
  const salt = stored.slice(0, separator);
  return (await hashPassword(password, salt)) === stored;
}

export function getGuestbookDb() {
  if (!env.DB) throw new Error("방명록 저장소가 연결되지 않았습니다.");
  return env.DB;
}
