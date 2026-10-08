import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import type { SessionStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
    PENDING_2FA_COOKIE,
    PENDING_2FA_TTL_MS,
    SESSION_COOKIE,
    SESSION_TTL_MS,
} from "@/lib/auth/constants";

/**
 * DB-backed sessions. The cookie holds a random token; the DB stores only its
 * SHA-256, so a leaked database can't be used to forge cookies.
 *
 *   PENDING_2FA  password checked, waiting for the authenticator code (cookie: admin_2fa)
 *   ACTIVE       fully signed in (cookie: admin_session)
 */

const config: Record<SessionStage, { cookie: string; ttl: number }> = {
    PENDING_2FA: { cookie: PENDING_2FA_COOKIE, ttl: PENDING_2FA_TTL_MS },
    ACTIVE: { cookie: SESSION_COOKIE, ttl: SESSION_TTL_MS },
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: number, stage: SessionStage) {
    const { cookie, ttl } = config[stage];
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + ttl);
    const requestHeaders = await headers();

    await prisma.session.create({
        data: {
            id: hashToken(token),
            userId,
            stage,
            expiresAt,
            userAgent: requestHeaders.get("user-agent")?.slice(0, 300),
            ipAddress: requestHeaders.get("x-forwarded-for")?.split(",")[0].trim().slice(0, 64),
        },
    });

    const jar = await cookies();
    jar.set(cookie, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
    });
}

/** The current session for a stage, with the user — or null if missing / expired. */
export async function readSession(stage: SessionStage) {
    const token = (await cookies()).get(config[stage].cookie)?.value;
    if (!token) return null;

    const session = await prisma.session.findUnique({
        where: { id: hashToken(token) },
        include: { user: true },
    });

    if (!session || session.stage !== stage || session.expiresAt < new Date()) return null;
    return session;
}

export async function destroySession(stage: SessionStage) {
    const jar = await cookies();
    const token = jar.get(config[stage].cookie)?.value;

    if (token) await prisma.session.deleteMany({ where: { id: hashToken(token) } });
    jar.delete(config[stage].cookie);
}

export async function deleteExpiredSessions() {
    await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
