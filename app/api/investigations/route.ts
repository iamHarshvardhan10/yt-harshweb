import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/auth/dal";
import { readJson } from "@/lib/home/validation";
import { parseInvestigation } from "@/lib/investigations/input";
import { getInvestigationsAdmin, revalidateInvestigations } from "@/lib/investigations/queries";
import { investigationErrorResponse, publishDate } from "@/lib/investigations/routes";

/**
 * Dashboard-only API (the public pages read the DB directly).
 *
 *   GET    /api/investigations          list, every status
 *   POST   /api/investigations          create, with optional documents
 *   GET    /api/investigations/{id}     read one
 *   PATCH  /api/investigations/{id}     partial update; `documents` replaces the set
 *   DELETE /api/investigations/{id}     delete (documents are removed with it)
 */

export const GET = withAdmin(async () => {
    return NextResponse.json({ items: await getInvestigationsAdmin() });
});

export const POST = withAdmin(async (req: NextRequest) => {
    const parsed = parseInvestigation(await readJson(req), { partial: false });
    if (parsed.error !== undefined) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const data = parsed.data as Prisma.InvestigationUncheckedCreateInput;

    try {
        const item = await prisma.investigation.create({
            data: {
                ...data,
                publishedAt: publishDate(data.status, data.publishedAt as Date | null | undefined, null),
                documents: parsed.documents?.length ? { create: parsed.documents } : undefined,
            },
            include: { documents: true },
        });

        revalidateInvestigations();
        return NextResponse.json({ item }, { status: 201 });
    } catch (err) {
        return investigationErrorResponse(err);
    }
});
