import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/currentUser";
import { saveStructuredMeeting } from "@/lib/meetingRepo";
import { demoRaces } from "@/lib/demoData";

/** Loads the bundled 8-race demo meeting for the current user, so the app
 * can be tried immediately without a real racecard to hand. */
export async function POST() {
  const userId = await requireUserId();
  const meetingId = await saveStructuredMeeting(
    userId,
    { sourceFileName: "Demo meeting.pdf", courseName: "Demo Racecourse", meetingDate: "Today" },
    demoRaces
  );
  return NextResponse.json({ meetingId });
}
