import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { lockedMessage, registerFailedAttempt } from "@/lib/auth/lockout";

/**
 * Re-checks the signed-in admin's password before a sensitive change
 * (email, password, authenticator). Wrong guesses count toward the lockout.
 * Returns an error response, or null when the password is right.
 */
export async function requirePassword(userId: number, password: unknown) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const locked = lockedMessage(user);
    if (locked) return NextResponse.json({ error: locked }, { status: 429 });

    if (typeof password !== "string" || !password || !(await verifyPassword(password, user.passwordHash))) {
        await registerFailedAttempt(user);
        return NextResponse.json({ error: "Your current password is incorrect" }, { status: 403 });
    }

    if (user.failedLoginCount > 0) {
        await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0 } });
    }
    return null;
}
