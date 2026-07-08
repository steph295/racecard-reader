import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/currentUser";
import { applyPrivileges } from "@/lib/meetingRepo";
import { parsePrivilegesSheet } from "@/lib/parsing/parsePrivileges";

/**
 * Accepts an ORC privileges sheet (multipart `file`) and applies its
 * privileges to this meeting's runners, matched by horse name.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const userId = await requireUserId();
  const { meetingId } = await params;

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const text = await file.text();

  let entries;
  try {
    entries = parsePrivilegesSheet(text);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't parse this sheet." },
      { status: 400 }
    );
  }

  if (entries.length === 0) {
    return NextResponse.json(
      { error: "No horses with privileges found in this sheet." },
      { status: 400 }
    );
  }

  const result = await applyPrivileges(userId, meetingId, entries);
  if (!result) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  return NextResponse.json({
    matched: result.matched,
    totalInSheet: entries.length,
    unmatched: result.unmatched,
  });
}
