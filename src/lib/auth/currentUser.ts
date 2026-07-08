import { auth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export class UnauthenticatedError extends Error {
  constructor() {
    super("Not signed in");
    this.name = "UnauthenticatedError";
  }
}

/**
 * Returns the current Clerk user id, lazily creating (or refreshing) the
 * corresponding row in our `users` table on first sight. Every owned
 * resource (meetings, notes) is keyed off this id, so route handlers can
 * call this once and use the returned id directly in queries.
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new UnauthenticatedError();

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    columns: { id: true },
  });
  if (existing) return userId;

  const user = await clerkCurrentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? "";
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;

  await db
    .insert(schema.users)
    .values({ id: userId, email, name })
    .onConflictDoNothing({ target: schema.users.id });

  return userId;
}
