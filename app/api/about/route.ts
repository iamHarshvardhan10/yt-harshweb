import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { defaultAboutPage } from "@/lib/about/defaults";
import { ABOUT_PAGE_ID, getAboutAdminData, getAboutPage, getAboutPageData } from "@/lib/about/queries";
import { parseBody, readJson, type Spec } from "@/lib/home/validation";
import { prismaErrorResponse } from "@/lib/home/collections";
import { revalidateAbout } from "@/lib/home/revalidate";
import { getAdminUser, unauthorized, withAdmin } from "@/lib/auth/dal";

/**
 * The About page is a singleton.
 *
 *   GET    /api/about               → public content (visible steps + defaults)
 *   GET    /api/about?scope=admin   → raw content for the dashboard
 *   PUT    /api/about               → create or update the page
 *   DELETE /api/about               → reset the page copy to the defaults (steps are kept)
 */

const aboutSpec: Spec = {
    heroTag: { type: "string", required: true, max: 40 },
    heroTitle: { type: "string", required: true, max: 120 },
    heroDesc: { type: "string", required: true, max: 400 },
    heroMediaId: { type: "string" },

    processTag: { type: "string", required: true, max: 40 },
    processTitle: { type: "string", required: true, max: 120 },
    processDesc: { type: "string", required: true, max: 400 },
    processVisible: { type: "boolean" },

    ctaTag: { type: "string", required: true, max: 40 },
    ctaTitle: { type: "string", required: true, max: 120 },
    ctaDesc: { type: "string", required: true, max: 400 },
    ctaBtn1: { type: "string", required: true, max: 40 },
    ctaBtn1Link: { type: "string", required: true, max: 500 },
    ctaBtn2: { type: "string", required: true, max: 40 },
    ctaBtn2Link: { type: "string", required: true, max: 500 },
    ctaVisible: { type: "boolean" },

    showAbout: { type: "boolean" },
    showMetrics: { type: "boolean" },
};

export async function GET(req: NextRequest) {
    if (req.nextUrl.searchParams.get("scope") !== "admin") {
        return NextResponse.json(await getAboutPageData());
    }

    if (!(await getAdminUser())) return unauthorized();
    return NextResponse.json(await getAboutAdminData());
}

export const PUT = withAdmin(updateAboutPage);
export const DELETE = withAdmin(resetAboutPage);

async function updateAboutPage(req: NextRequest) {
    const existing = await getAboutPage();
    // Full validation on create, partial on update
    const parsed = parseBody(await readJson(req), aboutSpec, { partial: !!existing });
    if (parsed.error !== undefined) return NextResponse.json({ error: parsed.error }, { status: 400 });

    try {
        const data = parsed.data as Partial<typeof defaultAboutPage> & { heroMediaId?: string | null };
        const page = await prisma.aboutPage.upsert({
            where: { id: ABOUT_PAGE_ID },
            update: data,
            create: { ...defaultAboutPage, ...data, id: ABOUT_PAGE_ID },
            include: { heroMedia: true },
        });

        revalidateAbout();
        return NextResponse.json({ page });
    } catch (err) {
        return prismaErrorResponse(err, "about page");
    }
}

async function resetAboutPage() {
    // Keep the row (and its id) but restore the original copy
    const page = await prisma.aboutPage.upsert({
        where: { id: ABOUT_PAGE_ID },
        update: { ...defaultAboutPage, heroMediaId: null },
        create: { ...defaultAboutPage, id: ABOUT_PAGE_ID },
        include: { heroMedia: true },
    });

    revalidateAbout();
    return NextResponse.json({ page });
}
