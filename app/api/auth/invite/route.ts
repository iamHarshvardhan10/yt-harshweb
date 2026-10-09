import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { findInvite } from "@/lib/auth/invites";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { readJson } from "@/lib/home/validation";

/**
 * POST /api/auth/invite  { token, password }   (public)
 * Accepts a team invite by setting a password. The invite link stops working,
 * and the first sign-in sets up Google Authenticator.
 */
export async function POST(req: NextRequest) {
    const { token, password } = ((await readJson(req)) ?? {}) as Record<string, unknown>;

    const user = await findInvite(typeof token === "string" ? token : "");
    if (!user) return NextResponse.json({ error: "This invite link is invalid or has expired. Ask for a new one." }, { status: 404 });

    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH || password.length > 200) {
        return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(password), inviteTokenHash: null, inviteExpiresAt: null },
    });

    return NextResponse.json({ ok: true, email: user.email });
}
