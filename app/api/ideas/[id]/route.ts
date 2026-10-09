import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/auth/dal";
import { prismaErrorResponse } from "@/lib/home/collections";
import { parseBody, readJson } from "@/lib/home/validation";
import { ideaSpec } from "@/lib/ideas/input";
import { normalizeVideoLink } from "@/lib/ideas/queries";

type IdContext = { params: Promise<{ id: string }> };

export const PATCH = withAdmin(async (req: NextRequest, { params }: IdContext) => {
    const parsed = parseBody(normalizeVideoLink(await readJson(req)), ideaSpec, { partial: true });
    if (parsed.error !== undefined) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { id } = await params;
    const data = parsed.data;

    try {
        // A new upload time gets a new reminder
        if ("uploadAt" in data) {
            const existing = await prisma.contentIdea.findUnique({ where: { id }, select: { uploadAt: true } });
            if (existing && existing.uploadAt?.getTime() !== (data.uploadAt as Date | null)?.getTime()) {
                data.reminderSentAt = null;
            }
        }

        const item = await prisma.contentIdea.update({ where: { id }, data });
        return NextResponse.json({ item });
    } catch (err) {
        return prismaErrorResponse(err, "idea");
    }
});

export const DELETE = withAdmin(async (_req: NextRequest, { params }: IdContext) => {
    try {
        await prisma.contentIdea.delete({ where: { id: (await params).id } });
        return NextResponse.json({ success: true });
    } catch (err) {
        return prismaErrorResponse(err, "idea");
    }
});
