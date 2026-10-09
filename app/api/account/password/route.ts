import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminUser, unauthorized } from "@/lib/auth/dal";
import { requirePassword } from "@/lib/auth/account";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { currentSessionId } from "@/lib/auth/session";
import { readJson } from "@/lib/home/validation";

/**
 * POST /api/account/password  { currentPassword, newPassword }
 * Signs out every other session, so a leaked password stops working everywhere.
 */
export async function POST(req: NextRequest) {
    const admin = await getAdminUser();
    if (!admin) return unauthorized();

    const { currentPassword, newPassword } = ((await readJson(req)) ?? {}) as Record<string, unknown>;

    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
    }
    if (newPassword.length > 200) return NextResponse.json({ error: "New password is too long" }, { status: 400 });
    if (newPassword === currentPassword) {
        return NextResponse.json({ error: "Choose a password different from your current one" }, { status: 400 });
    }

    const denied = await requirePassword(admin.id, currentPassword);
    if (denied) return denied;

    const keep = await currentSessionId();
    await prisma.$transaction([
        prisma.user.update({ where: { id: admin.id }, data: { passwordHash: await hashPassword(newPassword) } }),
        prisma.session.deleteMany({ where: { userId: admin.id, id: { not: keep ?? "" } } }),
    ]);

    return NextResponse.json({ ok: true });
}
