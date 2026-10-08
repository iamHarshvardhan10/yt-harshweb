import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/auth/encryption";
import { lockedMessage, registerFailedAttempt } from "@/lib/auth/lockout";
import { createSession, destroySession, readSession } from "@/lib/auth/session";
import { verifyTotp } from "@/lib/auth/totp";
import { readJson } from "@/lib/home/validation";

/**
 * POST /api/auth/2fa/verify  { code }
 * Step 2 of 2. Checks the 6-digit authenticator code. On first login this also
 * activates the authenticator. Success upgrades to a full ACTIVE session.
 */
export async function POST(req: NextRequest) {
    const session = await readSession("PENDING_2FA");
    if (!session) {
        return NextResponse.json({ error: "Your login expired. Sign in again." }, { status: 401 });
    }

    const { user } = session;

    const locked = lockedMessage(user);
    if (locked) return NextResponse.json({ error: locked }, { status: 429 });

    const body = (await readJson(req)) as { code?: unknown } | undefined;
    const code = typeof body?.code === "string" ? body.code : "";

    const isSetup = !user.totpEnabled;
    const encrypted = isSetup ? user.totpPendingSecret : user.totpSecret;
    if (!encrypted) {
        return NextResponse.json({ error: "Authenticator is not set up. Sign in again." }, { status: 400 });
    }

    const step = verifyTotp(decryptSecret(encrypted), code, user.totpLastCounter);
    if (step === null) {
        await registerFailedAttempt(user);
        return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            ...(isSetup && { totpSecret: encrypted, totpPendingSecret: null, totpEnabled: true }),
            totpLastCounter: step,
            failedLoginCount: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
        },
    });

    await destroySession("PENDING_2FA");
    await createSession(user.id, "ACTIVE");

    return NextResponse.json({ success: true });
}
