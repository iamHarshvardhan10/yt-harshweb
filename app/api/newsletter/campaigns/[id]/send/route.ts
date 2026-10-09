import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/auth/dal";
import { mailErrorMessage } from "@/lib/mail";
import { readJson } from "@/lib/home/validation";
import { sendCampaign, sendCampaignTest, siteUrl } from "@/lib/newsletter/email";
import { revalidateNewsletter } from "@/lib/newsletter/revalidate";

type IdContext = { params: Promise<{ id: string }> };

/** POST { mode: "test" } emails a preview to you; { mode: "now" } sends to every reader. */
export const POST = withAdmin(async (req: NextRequest, { params }: IdContext) => {
    const { id } = await params;
    const { mode } = ((await readJson(req)) ?? {}) as { mode?: string };
    const site = await siteUrl(req.nextUrl.origin);

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return NextResponse.json({ error: "campaign not found" }, { status: 404 });

    if (mode === "test") {
        try {
            await sendCampaignTest(campaign, site);
            return NextResponse.json({ ok: true });
        } catch (err) {
            return NextResponse.json({ error: mailErrorMessage(err) }, { status: 502 });
        }
    }

    if (mode !== "now") return NextResponse.json({ error: 'mode must be "now" or "test"' }, { status: 400 });

    const result = await sendCampaign(id, site);
    revalidateNewsletter();

    if (result.sent === 0 && result.error) return NextResponse.json({ ...result }, { status: result.failed ? 502 : 409 });
    return NextResponse.json(result);
});
