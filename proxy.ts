import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig, isProtectedPath } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((request) => {
  // Send signed-out visitors on protected routes to sign in
  if (!request.auth?.user && isProtectedPath(request.nextUrl.pathname)) {
    const signInUrl = new URL(authConfig.pages.signIn, request.nextUrl);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Skips API routes, static files and Sentry's tunnel (/monitoring)
  matcher: [
    "/((?!api|monitoring|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
