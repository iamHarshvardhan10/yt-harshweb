import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { getAdminUser, unauthorized } from "@/lib/auth/dal";
import { requirePassword } from "@/lib/auth/account";
import { readJson } from "@/lib/home/validation";

/**
 * DELETE /api/account/two-factor  { password }
 * Moving to a new phone: removes the authenticator and signs out everywhere.
 * The next sign-in shows the QR code again, like the first login.
 */
export async function DELETE(req: NextRequest) {
    const admin = await getAdminUser();
    if (!admin) return unauthorized();

    const { password } = ((await readJson(req)) ?? {}) as { password?: unknown };
    const denied = await requirePassword(admin.id, password);
    if (denied) return denied;

    await prisma.$transaction([
        prisma.user.update({
            where: { id: admin.id },
            data: { totpEnabled: false, totpSecret: null, totpPendingSecret: null, totpLastCounter: null },
        }),
        prisma.session.deleteMany({ where: { userId: admin.id } }),
    ]);

    const res = NextResponse.json({ ok: true });
    res.cookies.delete(SESSION_COOKIE);
    return res;
}
