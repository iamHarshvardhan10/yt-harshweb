import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/auth/dal";
import { prismaErrorResponse } from "@/lib/home/collections";
import { readJson } from "@/lib/home/validation";
import { parseCampaign } from "@/lib/newsletter/input";
import { revalidateNewsletter } from "@/lib/newsletter/revalidate";

type IdContext = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ error: "campaign not found" }, { status: 404 });

export const PATCH = withAdmin(async (req: NextRequest, { params }: IdContext) => {
    const { id } = await params;
    const current = await prisma.campaign.findUnique({ where: { id } });
    if (!current) return notFound();

    const body = await readJson(req);

    // After sending, only the website listing can change
    if (current.status === "SENT" || current.status === "SENDING") {
        const showOnWebsite = (body as { showOnWebsite?: unknown } | undefined)?.showOnWebsite;
        if (typeof showOnWebsite !== "boolean") {
            return NextResponse.json({ error: "A sent campaign can't be edited" }, { status: 409 });
        }
        const item = await prisma.campaign.update({ where: { id }, data: { showOnWebsite } });
        revalidateNewsletter();
        return NextResponse.json({ item });
    }

    const parsed = parseCampaign(body, { partial: true, current });
    if (parsed.error !== undefined) return NextResponse.json({ error: parsed.error }, { status: 400 });

    try {
        const item = await prisma.campaign.update({ where: { id }, data: parsed.data });
        return NextResponse.json({ item });
    } catch (err) {
        return prismaErrorResponse(err, "campaign");
    }
});

export const DELETE = withAdmin(async (_req: NextRequest, { params }: IdContext) => {
    const { id } = await params;
    const current = await prisma.campaign.findUnique({ where: { id }, select: { status: true } });
    if (!current) return notFound();
    if (current.status === "SENDING") {
        return NextResponse.json({ error: "This campaign is being sent right now" }, { status: 409 });
    }

    await prisma.campaign.delete({ where: { id } });
    revalidateNewsletter();
    return NextResponse.json({ success: true });
});
