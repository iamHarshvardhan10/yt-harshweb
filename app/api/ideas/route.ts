import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/auth/dal";
import { prismaErrorResponse } from "@/lib/home/collections";
import { parseBody, readJson } from "@/lib/home/validation";
import { ideaSpec } from "@/lib/ideas/input";
import { normalizeVideoLink } from "@/lib/ideas/queries";

/**
 * Dashboard-only API for content ideas.
 *
 *   GET    /api/ideas         list
 *   POST   /api/ideas         create
 *   PATCH  /api/ideas/{id}    partial update
 *   DELETE /api/ideas/{id}    delete
 */

export const GET = withAdmin(async () => {
    return NextResponse.json({ items: await prisma.contentIdea.findMany({ orderBy: { createdAt: "desc" } }) });
});

export const POST = withAdmin(async (req: NextRequest) => {
    const parsed = parseBody(normalizeVideoLink(await readJson(req)), ideaSpec);
    if (parsed.error !== undefined) return NextResponse.json({ error: parsed.error }, { status: 400 });

    try {
        const item = await prisma.contentIdea.create({ data: parsed.data as Prisma.ContentIdeaCreateInput });
        return NextResponse.json({ item }, { status: 201 });
    } catch (err) {
        return prismaErrorResponse(err, "idea");
    }
});
