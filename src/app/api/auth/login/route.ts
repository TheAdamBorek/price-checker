import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { env } from "~/env";
import { db } from "~/server/db";
import { sessions } from "~/server/db/schema";

const AUTH_COOKIE_NAME = "price-checker-auth";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
const ONE_YEAR_IN_MS = ONE_YEAR_IN_SECONDS * 1000;

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as { password?: string };
		const { password } = body;

		if (!password) {
			return NextResponse.json(
				{ error: "Password is required" },
				{ status: 400 },
			);
		}

		const isValid = await bcrypt.compare(password, env.AUTH_PASSWORD_HASH);

		if (!isValid) {
			return NextResponse.json({ error: "Invalid password" }, { status: 401 });
		}

		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + ONE_YEAR_IN_MS);

		await db.insert(sessions).values({ token, expiresAt });

		const cookieStore = await cookies();
		cookieStore.set(AUTH_COOKIE_NAME, token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: ONE_YEAR_IN_SECONDS,
			path: "/",
		});

		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
