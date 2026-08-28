import { env } from "cloudflare:workers";

export async function ensureBusSurveySchema() {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS bus_survey_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      outbound_count INTEGER NOT NULL,
      return_count INTEGER,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_bus_survey_updated_at
      ON bus_survey_responses(updated_at DESC, id DESC)`),
  ]);
}

export function getBusSurveyDb() {
  if (!env.DB) throw new Error("전세버스 수요조사 저장소가 연결되지 않았습니다.");
  return env.DB;
}
