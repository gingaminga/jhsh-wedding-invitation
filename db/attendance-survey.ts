import { env } from "cloudflare:workers";

export async function ensureAttendanceSurveySchema() {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS attendance_survey_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attendance TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      meal_plan TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_attendance_survey_updated_at
      ON attendance_survey_responses(updated_at DESC, id DESC)`),
  ]);
}

export function getAttendanceSurveyDb() {
  if (!env.DB) throw new Error("결혼식 참석 수요조사 저장소가 연결되지 않았습니다.");
  return env.DB;
}
