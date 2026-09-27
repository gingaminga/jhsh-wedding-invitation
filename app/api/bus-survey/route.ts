import { supabaseRest } from "../../../db/supabase";
import { notifyDiscordSafely } from "../../../db/discord";

function parseCount(value: unknown) {
  const count = Number(value);
  return Number.isInteger(count) && count >= 1 && count <= 10 ? count : Number.NaN;
}

export async function POST(request: Request) {
  try {
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

    await supabaseRest("bus_survey_responses?on_conflict=phone", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ name, phone, outbound_count: passengerCount, note, updated_at: new Date().toISOString() }),
    });

    await notifyDiscordSafely({ kind: "bus", name, phone, passengerCount, note });

    return Response.json({ ok: true, updated: true });
  } catch {
    return Response.json({ error: "수요조사 응답을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
