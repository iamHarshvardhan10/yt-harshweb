import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getAdminUser, unauthorized } from "@/lib/auth/dal";
import { requirePassword } from "@/lib/auth/account";
import { readJson } from "@/lib/home/validation";
import { EMAIL_PATTERN } from "@/lib/newsletter/shared";

/**
 * PATCH /api/account  { name?, avatarId?, email?, currentPassword? }
 * The signed-in admin's own profile. Changing the sign-in email needs the password.
 */
export async function PATCH(req: NextRequest) {
    const admin = await getAdminUser();
    if (!admin) return unauthorized();

    const body = ((await readJson(req)) ?? {}) as Record<string, unknown>;
    const data: Prisma.UserUncheckedUpdateInput = {};

    if (body.name !== undefined) {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name || name.length > 80) return NextResponse.json({ error: "Name must be 1–80 characters" }, { status: 400 });
        data.name = name;
    }

    if (body.avatarId !== undefined) {
        if (body.avatarId !== null && typeof body.avatarId !== "string") {
            return NextResponse.json({ error: "avatarId must be a string or null" }, { status: 400 });
        }
        data.avatarId = body.avatarId;
    }

    if (body.email !== undefined) {
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });

        if (email !== admin.email) {
            const denied = await requirePassword(admin.id, body.currentPassword);
            if (denied) return denied;
            data.email = email;
        }
    }

    try {
        const user = await prisma.user.update({
            where: { id: admin.id },
            data,
            select: { id: true, name: true, email: true, avatar: { select: { secureUrl: true } } },
        });
        return NextResponse.json({ user });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") return NextResponse.json({ error: "Another admin already uses that email" }, { status: 409 });
            if (err.code === "P2003") return NextResponse.json({ error: "That photo no longer exists — upload it again" }, { status: 400 });
        }
        console.error("[account] update failed:", err);
        return NextResponse.json({ error: "Failed to save your profile" }, { status: 500 });
    }
}
