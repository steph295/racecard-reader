import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/currentUser";
import { getMeetingDetail } from "@/lib/meetingRepo";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const userId = await requireUserId();
  const { meetingId } = await params;

  const meeting = await getMeetingDetail(userId, meetingId);
  if (!meeting) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ meeting });
}
