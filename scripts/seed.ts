/**
 * Loads the bundled demo meeting for a given user id, bypassing the API/UI.
 * Handy for local development: `npm run db:seed -- <clerkUserId>`.
 *
 * Note: this writes directly with Drizzle, so it also (re)creates the users
 * row if it doesn't exist yet - pass a real Clerk user id you've signed in
 * with locally so the meeting shows up when you browse to /upload.
 */
import "dotenv/config";
import { db, schema } from "../src/db";
import { demoRaces } from "../src/lib/demoData";
import { saveStructuredMeeting } from "../src/lib/meetingRepo";

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error("Usage: npm run db:seed -- <clerkUserId>");
    process.exit(1);
  }

  await db
    .insert(schema.users)
    .values({ id: userId, email: `${userId}@example.com` })
    .onConflictDoNothing({ target: schema.users.id });

  const meetingId = await saveStructuredMeeting(
    userId,
    { sourceFileName: "Demo meeting.pdf", courseName: "Demo Racecourse", meetingDate: "Today" },
    demoRaces
  );

  console.log(`Seeded demo meeting ${meetingId} for user ${userId}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
