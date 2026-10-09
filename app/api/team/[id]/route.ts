import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminUser, unauthorized } from "@/lib/auth/dal";
import { emailInvite, issueInvite } from "@/lib/auth/invites";
import { getSiteUrl } from "@/lib/settings";

type IdContext = { params: Promise<{ id: string }> };

async function findMember(params: IdContext["params"]) {
    const id = Number((await params).id);
    return Number.isInteger(id) ? prisma.user.findUnique({ where: { id } }) : null;
}

/** POST /api/team/{id} — resend a pending invite with a fresh link. */
export async function POST(req: NextRequest, { params }: IdContext) {
    const admin = await getAdminUser();
    if (!admin) return unauthorized();

    const member = await findMember(params);
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    if (member.passwordHash) return NextResponse.json({ error: "They've already accepted the invite" }, { status: 409 });

    const url = await issueInvite(member.id, await getSiteUrl(req.nextUrl.origin));
    const emailError = await emailInvite({ to: member.email, name: member.name, inviter: admin.name, url });
    return NextResponse.json({ inviteUrl: url, emailed: !emailError, emailError });
}

/** DELETE /api/team/{id} — revoke an invite or remove a member (signs them out). */
export async function DELETE(_req: NextRequest, { params }: IdContext) {
    const admin = await getAdminUser();
    if (!admin) return unauthorized();

    const member = await findMember(params);
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    if (member.id === admin.id) {
        return NextResponse.json({ error: "You can't remove yourself — ask another admin" }, { status: 400 });
    }

    // Sessions are deleted with the user (onDelete: Cascade)
    await prisma.user.delete({ where: { id: member.id } });
    return NextResponse.json({ ok: true });
}
