import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LOCKOUT_MS, MAX_FAILED_ATTEMPTS } from "@/lib/auth/constants";

/**
 * Failed password and authenticator attempts share one counter per user.
 * After MAX_FAILED_ATTEMPTS the account is locked for LOCKOUT_MS.
 */

export function lockedMessage(user: Pick<User, "lockedUntil">) {
    if (!user.lockedUntil || user.lockedUntil <= new Date()) return null;
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

export async function registerFailedAttempt(user: Pick<User, "id" | "failedLoginCount">) {
    const failures = user.failedLoginCount + 1;
    const lock = failures >= MAX_FAILED_ATTEMPTS;

    await prisma.user.update({
        where: { id: user.id },
        data: lock
            ? { failedLoginCount: 0, lockedUntil: new Date(Date.now() + LOCKOUT_MS) }
            : { failedLoginCount: failures },
    });

    if (lock) {
        // Also drop any half-finished login for this account
        await prisma.session.deleteMany({ where: { userId: user.id, stage: "PENDING_2FA" } });
    }
}
