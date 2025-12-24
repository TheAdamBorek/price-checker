import { and, eq, gt } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "~/server/db";
import { sessions } from "~/server/db/schema";

const AUTH_COOKIE_NAME = "price-checker-auth";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Allow access to login page and auth API
	if (pathname === "/login" || pathname.startsWith("/api/auth")) {
		return NextResponse.next();
	}

	// Check for auth cookie
	const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

	if (!authCookie?.value) {
		const loginUrl = new URL("/login", request.url);
		return NextResponse.redirect(loginUrl);
	}

	// Validate session token against database
	const session = await db.query.sessions.findFirst({
		where: and(
			eq(sessions.token, authCookie.value),
			gt(sessions.expiresAt, new Date()),
		),
	});

	if (!session) {
		const loginUrl = new URL("/login", request.url);
		const response = NextResponse.redirect(loginUrl);
		response.cookies.delete(AUTH_COOKIE_NAME);
		return response;
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Match all paths except static files and _next
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
