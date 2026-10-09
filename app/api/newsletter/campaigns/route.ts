import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/auth/dal";
import { prismaErrorResponse } from "@/lib/home/collections";
import { readJson } from "@/lib/home/validation";
import { parseCampaign } from "@/lib/newsletter/input";

/**
 * Dashboard-only newsletter campaigns.
 *
 *   GET    /api/newsletter/campaigns              list
 *   POST   /api/newsletter/campaigns              create (draft or scheduled)
 *   PATCH  /api/newsletter/campaigns/{id}         edit a draft / scheduled campaign
 *   DELETE /api/newsletter/campaigns/{id}         delete
 *   POST   /api/newsletter/campaigns/{id}/send    { mode: "now" | "test" }
 */

export const GET = withAdmin(async () => {
    return NextResponse.json({ items: await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } }) });
});

export const POST = withAdmin(async (req: NextRequest) => {
    const parsed = parseCampaign(await readJson(req), { partial: false });
    if (parsed.error !== undefined) return NextResponse.json({ error: parsed.error }, { status: 400 });

    try {
        const item = await prisma.campaign.create({ data: parsed.data as Prisma.CampaignCreateInput });
        return NextResponse.json({ item }, { status: 201 });
    } catch (err) {
        return prismaErrorResponse(err, "campaign");
    }
});
