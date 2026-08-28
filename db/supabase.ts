export type GuestbookRow = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};

const encoder = new TextEncoder();

export function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("Supabase 저장소가 연결되지 않았습니다.");
  return { url, secretKey };
}

export async function supabaseRest<T>(path: string, init: RequestInit = {}) {
  const { url, secretKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Supabase 요청 실패: ${response.status}`);
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
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
