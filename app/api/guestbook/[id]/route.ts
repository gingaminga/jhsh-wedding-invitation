import { ensureGuestbookSchema, getGuestbookDb, verifyPassword } from "../../../../db/guestbook";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    const payload = (await request.json()) as { password?: unknown };
    const password = typeof payload.password === "string" ? payload.password : "";
    if (!Number.isInteger(numericId) || numericId < 1 || !password) {
      return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }
    await ensureGuestbookSchema();
    const entry = await getGuestbookDb()
      .prepare("SELECT password_hash FROM guestbook_entries WHERE id = ?")
      .bind(numericId)
      .first<{ password_hash: string }>();
    if (!entry) return Response.json({ error: "이미 삭제된 메시지입니다." }, { status: 404 });
    if (!(await verifyPassword(password, entry.password_hash))) {
      return Response.json({ error: "비밀번호가 맞지 않습니다." }, { status: 403 });
    }
    await getGuestbookDb().prepare("DELETE FROM guestbook_entries WHERE id = ?").bind(numericId).run();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "메시지를 삭제하지 못했습니다." }, { status: 500 });
  }
}
