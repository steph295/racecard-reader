import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/currentUser";
import { upsertNote } from "@/lib/meetingRepo";

const bodySchema = z.object({
  runnerId: z.string().uuid(),
  body: z.string().max(10_000),
});

export async function PUT(req: NextRequest) {
  const userId = await requireUserId();
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  await upsertNote(userId, parsed.data.runnerId, parsed.data.body);
  return NextResponse.json({ ok: true });
}
