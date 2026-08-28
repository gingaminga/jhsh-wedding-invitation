import { supabaseRest } from "../../../db/supabase";

const ATTENDANCE_OPTIONS = new Set(["attending", "not-attending"]);

function parseCount(value: unknown) {
  const count = Number(value);
  return Number.isInteger(count) && count >= 0 && count <= 10 ? count : Number.NaN;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const attendance = typeof payload.attendance === "string" ? payload.attendance : "";
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const guestCount = parseCount(payload.guestCount);

    if (!ATTENDANCE_OPTIONS.has(attendance) || !name || name.length > 20 || Number.isNaN(guestCount)) {
      return Response.json({ error: "참석 여부와 성함, 참석 인원을 확인해 주세요." }, { status: 400 });
    }
    if (attendance === "attending" && guestCount < 1) {
      return Response.json({ error: "참석 인원은 1명 이상 선택해 주세요." }, { status: 400 });
    }
    if (attendance === "not-attending" && guestCount !== 0) {
      return Response.json({ error: "불참 응답 정보를 다시 확인해 주세요." }, { status: 400 });
    }

    await supabaseRest("attendance_survey_responses", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        attendance,
        name,
        guest_count: guestCount,
      }),
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "참석 응답을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
