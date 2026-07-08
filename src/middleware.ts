import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Everything except the sign-in/sign-up screens and Clerk's own webhook
// endpoint requires a signed-in user - this is a personal racecard tool,
// not a public site.
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      // API clients want a 401 they can handle, not an HTML redirect.
      if (isApiRoute(req)) {
        return NextResponse.json({ error: "Not signed in" }, { status: 401 });
      }
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, always run for API routes.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv)).*)",
    "/(api|trpc)(.*)",
  ],
};
