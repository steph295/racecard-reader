import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/currentUser";
import { updateRunnerPrivileges } from "@/lib/meetingRepo";

const bodySchema = z.object({
  privileges: z.string().max(500),
});

/** Manually edits one runner's privilege tags. An empty string clears them. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ runnerId: string }> }
) {
  const userId = await requireUserId();
  const { runnerId } = await params;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const ok = await updateRunnerPrivileges(userId, runnerId, parsed.data.privileges);
  if (!ok) {
    return NextResponse.json({ error: "Runner not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
