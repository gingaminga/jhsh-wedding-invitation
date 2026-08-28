import { ensureAttendanceSurveySchema, getAttendanceSurveyDb } from "../../../db/attendance-survey";

const ATTENDANCE_OPTIONS = new Set(["attending", "not-attending"]);
const MEAL_OPTIONS = new Set(["yes", "no", "undecided", "not-applicable"]);

function parseCount(value: unknown) {
  const count = Number(value);
  return Number.isInteger(count) && count >= 0 && count <= 10 ? count : Number.NaN;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const attendance = typeof payload.attendance === "string" ? payload.attendance : "";
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const phone = typeof payload.phone === "string" ? payload.phone.replace(/\D/g, "") : "";
    const mealPlan = typeof payload.mealPlan === "string" ? payload.mealPlan : "";
    const guestCount = parseCount(payload.guestCount);

    if (!ATTENDANCE_OPTIONS.has(attendance) || !name || name.length > 20 || !/^01\d{8,9}$/.test(phone)) {
      return Response.json({ error: "참석 여부와 성함, 휴대전화 번호를 확인해 주세요." }, { status: 400 });
    }
    if (!MEAL_OPTIONS.has(mealPlan) || Number.isNaN(guestCount)) {
      return Response.json({ error: "식사 여부와 참석 인원을 확인해 주세요." }, { status: 400 });
    }
    if (attendance === "attending" && guestCount < 1) {
      return Response.json({ error: "참석 인원은 1명 이상 선택해 주세요." }, { status: 400 });
    }
    if (attendance === "not-attending" && (mealPlan !== "not-applicable" || guestCount !== 0)) {
      return Response.json({ error: "불참 응답 정보를 다시 확인해 주세요." }, { status: 400 });
    }

    await ensureAttendanceSurveySchema();
    await getAttendanceSurveyDb()
      .prepare(`INSERT INTO attendance_survey_responses (attendance, name, phone, meal_plan, guest_count)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(phone) DO UPDATE SET
          attendance = excluded.attendance,
          name = excluded.name,
          meal_plan = excluded.meal_plan,
          guest_count = excluded.guest_count,
          updated_at = CURRENT_TIMESTAMP`)
      .bind(attendance, name, phone, mealPlan, guestCount)
      .run();

    return Response.json({ ok: true, updated: true });
  } catch {
    return Response.json({ error: "참석 응답을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
