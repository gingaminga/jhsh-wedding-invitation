import { supabaseRest, verifyPassword } from "../../../../db/supabase";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    const payload = (await request.json()) as { password?: unknown };
    const password = typeof payload.password === "string" ? payload.password : "";
    if (!Number.isInteger(numericId) || numericId < 1 || !password) {
      return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }
    const entries = await supabaseRest<Array<{ password_hash: string }>>(`guestbook_entries?select=password_hash&id=eq.${numericId}&limit=1`);
    const entry = entries[0];
    if (!entry) return Response.json({ error: "이미 삭제된 메시지입니다." }, { status: 404 });
    if (!(await verifyPassword(password, entry.password_hash))) {
      return Response.json({ error: "비밀번호가 맞지 않습니다." }, { status: 403 });
    }
    await supabaseRest(`guestbook_entries?id=eq.${numericId}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "메시지를 삭제하지 못했습니다." }, { status: 500 });
  }
}
