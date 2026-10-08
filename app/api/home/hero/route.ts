import { NextRequest, NextResponse } from "next/server";
import { HeroBackgroundType } from "@prisma/client";
import { revalidateHome } from "@/lib/home/revalidate";
import { prisma } from "@/lib/prisma";
import { getHero, heroInclude } from "@/lib/home/queries";
import { parseBody, readJson, type Spec } from "@/lib/home/validation";
import { prismaErrorResponse } from "@/lib/home/collections";
import { withAdmin } from "@/lib/auth/dal";

/**
 * The home hero is a singleton.
 *
 *   GET    /api/home/hero   → saved hero (or null)
 *   PUT    /api/home/hero   → create or update the hero
 *   DELETE /api/home/hero   → remove it (site falls back to default copy)
 */

const heroSpec: Spec = {
    eyebrow: { type: "string", max: 40 },
    headline: { type: "string", required: true, max: 100 },
    description: { type: "string", required: true, max: 400 },
    primaryButtonName: { type: "string", max: 40 },
    primaryButtonUrl: { type: "string", max: 500 },
    secondaryButtonName: { type: "string", max: 40 },
    secondaryButtonUrl: { type: "string", max: 500 },
    backgroundType: { type: "enum", values: Object.values(HeroBackgroundType) },
    darkOverlay: { type: "boolean" },
    overlayOpacity: { type: "int", min: 0, max: 100 },
    isVisible: { type: "boolean" },
    autoplay: { type: "boolean" },
    loop: { type: "boolean" },
};

export const GET = withAdmin(getHomeHero);
export const PUT = withAdmin(saveHomeHero);
export const DELETE = withAdmin(deleteHomeHero);

async function getHomeHero() {
    return NextResponse.json({ hero: await getHero() });
}

async function saveHomeHero(req: NextRequest) {
    const existing = await getHero();
    // Full validation on create, partial on update
    const parsed = parseBody(await readJson(req), heroSpec, { partial: !!existing });
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });

    try {
        const data = parsed.data as Parameters<typeof prisma.homeHero.create>[0]["data"];
        const hero = existing
            ? await prisma.homeHero.update({ where: { id: existing.id }, data, include: heroInclude })
            : await prisma.homeHero.create({ data, include: heroInclude });

        revalidateHome();
        return NextResponse.json({ hero }, { status: existing ? 200 : 201 });
    } catch (err) {
        return prismaErrorResponse(err, "hero");
    }
}

async function deleteHomeHero() {
    const existing = await getHero();
    if (!existing) return NextResponse.json({ error: "hero not found" }, { status: 404 });

    await prisma.homeHero.delete({ where: { id: existing.id } });
    revalidateHome();
    return NextResponse.json({ success: true });
}
