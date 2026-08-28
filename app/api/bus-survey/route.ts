import { ensureBusSurveySchema, getBusSurveyDb } from "../../../db/bus-survey";

const DEADLINE = new Date("2026-10-23T23:59:59+09:00");

function parseCount(value: unknown) {
  const count = Number(value);
  return Number.isInteger(count) && count >= 1 && count <= 10 ? count : Number.NaN;
}

export async function POST(request: Request) {
  try {
    if (Date.now() > DEADLINE.getTime()) {
      return Response.json({ error: "전세버스 수요조사가 마감되었습니다. 신랑·신부에게 개별 연락 부탁드립니다." }, { status: 410 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const phone = typeof payload.phone === "string" ? payload.phone.replace(/\D/g, "") : "";
    const note = typeof payload.note === "string" ? payload.note.trim() : "";
    const passengerCount = parseCount(payload.passengerCount);

    if (!name || name.length > 20 || !/^01\d{8,9}$/.test(phone)) {
      return Response.json({ error: "대표자 이름과 휴대전화 번호를 확인해 주세요." }, { status: 400 });
    }
    if (Number.isNaN(passengerCount) || note.length > 200) {
      return Response.json({ error: "탑승 인원과 전달 사항을 확인해 주세요." }, { status: 400 });
    }

    await ensureBusSurveySchema();
    await getBusSurveyDb()
      .prepare(`INSERT INTO bus_survey_responses (name, phone, outbound_count, note)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(phone) DO UPDATE SET
          name = excluded.name,
          outbound_count = excluded.outbound_count,
          note = excluded.note,
          updated_at = CURRENT_TIMESTAMP`)
      .bind(name, phone, passengerCount, note)
      .run();

    return Response.json({ ok: true, updated: true });
  } catch {
    return Response.json({ error: "수요조사 응답을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
