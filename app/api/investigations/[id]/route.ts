import { NextRequest, NextResponse } from "next/server";
import type { InvestigationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/auth/dal";
import { readJson } from "@/lib/home/validation";
import { parseInvestigation } from "@/lib/investigations/input";
import { getInvestigationAdmin, revalidateInvestigations } from "@/lib/investigations/queries";
import { investigationErrorResponse, publishDate } from "@/lib/investigations/routes";

type IdContext = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ error: "investigation not found" }, { status: 404 });

export const GET = withAdmin(async (_req: NextRequest, { params }: IdContext) => {
    const item = await getInvestigationAdmin((await params).id);
    return item ? NextResponse.json({ item }) : notFound();
});

export const PATCH = withAdmin(async (req: NextRequest, { params }: IdContext) => {
    const { id } = await params;
    const parsed = parseInvestigation(await readJson(req), { partial: true });
    if (parsed.error !== undefined) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const existing = await prisma.investigation.findUnique({ where: { id }, select: { status: true, publishedAt: true } });
    if (!existing) return notFound();

    const { data, documents } = parsed;
    const status = (data.status as InvestigationStatus | undefined) ?? existing.status;
    const publishedAt = publishDate(status, data.publishedAt as Date | null | undefined, existing.publishedAt);

    try {
        const item = await prisma.$transaction(async (tx) => {
            await tx.investigation.update({ where: { id }, data: { ...data, publishedAt } });

            if (documents) {
                // Languages left out of the request are removed
                await tx.investigationDocument.deleteMany({
                    where: { investigationId: id, language: { notIn: documents.map((d) => d.language) } },
                });
                for (const doc of documents) {
                    await tx.investigationDocument.upsert({
                        where: { investigationId_language: { investigationId: id, language: doc.language } },
                        create: { ...doc, investigationId: id },
                        update: doc,
                    });
                }
            }

            return tx.investigation.findUniqueOrThrow({ where: { id }, include: { documents: true } });
        });

        revalidateInvestigations();
        return NextResponse.json({ item });
    } catch (err) {
        return investigationErrorResponse(err);
    }
});

export const DELETE = withAdmin(async (_req: NextRequest, { params }: IdContext) => {
    try {
        await prisma.investigation.delete({ where: { id: (await params).id } });
        revalidateInvestigations();
        return NextResponse.json({ success: true });
    } catch (err) {
        return investigationErrorResponse(err);
    }
});
