import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminUser, unauthorized } from "@/lib/auth/dal";
import { emailInvite, issueInvite } from "@/lib/auth/invites";
import { readJson } from "@/lib/home/validation";
import { EMAIL_PATTERN } from "@/lib/newsletter/shared";
import { getSiteUrl } from "@/lib/settings";

/**
 * POST /api/team  { email, name }
 * Invites someone to the dashboard. Every member has full access.
 * Returns the invite link too, so it can be shared by hand if email fails.
 */
export async function POST(req: NextRequest) {
    const admin = await getAdminUser();
    if (!admin) return unauthorized();

    const body = ((await readJson(req)) ?? {}) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    if (!name || name.length > 80) return NextResponse.json({ error: "Add their name (up to 80 characters)" }, { status: 400 });

    if (await prisma.user.findUnique({ where: { email } })) {
        return NextResponse.json({ error: "This person already has access or a pending invite" }, { status: 409 });
    }

    const member = await prisma.user.create({ data: { email, name, invitedById: admin.id } });
    const url = await issueInvite(member.id, await getSiteUrl(req.nextUrl.origin));
    const emailError = await emailInvite({ to: email, name, inviter: admin.name, url });

    return NextResponse.json({ inviteUrl: url, emailed: !emailError, emailError }, { status: 201 });
}
