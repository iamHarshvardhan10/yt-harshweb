import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, unauthorized } from "@/lib/auth/dal";

/** GET /api/auth/me → the signed-in admin (with profile photo), or 401 */
export async function GET() {
    const user = await getAdminUser();
    if (!user) return unauthorized();

    const profile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { avatar: { select: { secureUrl: true } } },
    });
    return NextResponse.json({ user: { ...user, avatar: profile?.avatar?.secureUrl ?? null } });
}
