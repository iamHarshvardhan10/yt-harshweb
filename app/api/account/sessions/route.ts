import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminUser, unauthorized } from "@/lib/auth/dal";
import { currentSessionId } from "@/lib/auth/session";

/**
 * DELETE /api/account/sessions?id=…     sign out one of your sessions
 * DELETE /api/account/sessions?others=1 sign out everywhere except this browser
 */
export async function DELETE(req: NextRequest) {
    const admin = await getAdminUser();
    if (!admin) return unauthorized();

    const current = await currentSessionId();
    const id = req.nextUrl.searchParams.get("id");
    const others = req.nextUrl.searchParams.get("others") === "1";

    if (id) {
        if (id === current) return NextResponse.json({ error: "Use Sign out to end this session" }, { status: 400 });
        const { count } = await prisma.session.deleteMany({ where: { id, userId: admin.id } });
        return count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (others) {
        const { count } = await prisma.session.deleteMany({ where: { userId: admin.id, id: { not: current ?? "" } } });
        return NextResponse.json({ ok: true, count });
    }

    return NextResponse.json({ error: "Pass ?id= or ?others=1" }, { status: 400 });
}
