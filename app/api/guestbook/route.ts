import { ensureGuestbookSchema, getGuestbookDb, GuestbookRow, hashPassword } from "../../../db/guestbook";

export async function GET() {
  try {
    await ensureGuestbookSchema();
    const { results } = await getGuestbookDb()
      .prepare(`SELECT id, name, message, created_at
        FROM guestbook_entries
        ORDER BY created_at DESC, id DESC
        LIMIT 100`)
      .all<GuestbookRow>();
    return Response.json({
      entries: results.map((row) => ({
        id: row.id,
        name: row.name,
        message: row.message,
        createdAt: row.created_at,
      })),
    });
  } catch {
    return Response.json({ error: "방명록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { name?: unknown; message?: unknown; password?: unknown };
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    if (!name || !message || password.length < 4) {
      return Response.json({ error: "이름, 메시지, 4자리 이상의 비밀번호를 입력해 주세요." }, { status: 400 });
    }
    if (name.length > 20 || message.length > 300 || password.length > 30) {
      return Response.json({ error: "입력 가능한 글자 수를 확인해 주세요." }, { status: 400 });
    }
    await ensureGuestbookSchema();
    const passwordHash = await hashPassword(password);
    await getGuestbookDb()
      .prepare("INSERT INTO guestbook_entries (name, message, password_hash) VALUES (?, ?, ?)")
      .bind(name, message, passwordHash)
      .run();
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "메시지를 남기지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
