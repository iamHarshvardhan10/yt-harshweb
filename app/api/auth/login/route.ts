import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DUMMY_PASSWORD_HASH, verifyPassword } from "@/lib/auth/password";
import { lockedMessage, registerFailedAttempt } from "@/lib/auth/lockout";
import { createSession, deleteExpiredSessions, destroySession } from "@/lib/auth/session";
import { readJson } from "@/lib/home/validation";

/**
 * POST /api/auth/login  { email, password }
 * Step 1 of 2. On success starts a short PENDING_2FA session and tells the
 * client whether to show authenticator setup (first login) or the code prompt.
 */
export async function POST(req: NextRequest) {
    const body = (await readJson(req)) as { email?: unknown; password?: unknown } | undefined;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const invalid = NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    if (!user?.passwordHash) {
        // Same work as a real check so timing doesn't reveal which emails exist
        await verifyPassword(password, DUMMY_PASSWORD_HASH);
        return invalid;
    }

    const locked = lockedMessage(user);
    if (locked) return NextResponse.json({ error: locked }, { status: 429 });

    if (!(await verifyPassword(password, user.passwordHash))) {
        await registerFailedAttempt(user);
        return invalid;
    }

    await deleteExpiredSessions();
    await destroySession("PENDING_2FA");
    await createSession(user.id, "PENDING_2FA");

    return NextResponse.json({ next: user.totpEnabled ? "verify" : "setup" });
}
