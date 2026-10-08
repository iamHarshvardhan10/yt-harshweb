import { NextRequest, NextResponse } from "next/server";
import { HomeSectionKey } from "@prisma/client";
import { revalidateHome } from "@/lib/home/revalidate";
import { prisma } from "@/lib/prisma";
import { defaultSections } from "@/lib/home/defaults";
import { parseBody, readJson, type Spec } from "@/lib/home/validation";
import { prismaErrorResponse } from "@/lib/home/collections";
import { withAdmin } from "@/lib/auth/dal";

/**
 * Section headers are keyed by HomeSectionKey (FEATURED_VIDEOS, METRICS, ...).
 *
 *   GET    /api/home/sections/{key}   → saved header, or the default copy
 *   PUT    /api/home/sections/{key}   → create or update
 *   DELETE /api/home/sections/{key}   → reset to the default copy
 */

const sectionSpec: Spec = {
    eyebrow: { type: "string", max: 40 },
    title: { type: "string", required: true, max: 120 },
    description: { type: "string", max: 400 },
    mediaId: { type: "string" },
    isVisible: { type: "boolean" },
};

type KeyContext = { params: Promise<{ key: string }> };

async function resolveKey(params: KeyContext["params"]) {
    const { key } = await params;
    const upper = key.toUpperCase().replace(/-/g, "_");
    return upper in HomeSectionKey ? (upper as HomeSectionKey) : null;
}

const invalidKey = () =>
    NextResponse.json(
        { error: `Unknown section. Use one of ${Object.values(HomeSectionKey).join(", ")}` },
        { status: 404 }
    );

export const GET = withAdmin(getSection);
export const PUT = withAdmin(saveSection);
export const DELETE = withAdmin(resetSection);

async function getSection(_req: NextRequest, { params }: KeyContext) {
    const key = await resolveKey(params);
    if (!key) return invalidKey();

    const section = await prisma.homeSection.findUnique({ where: { key }, include: { media: true } });
    return NextResponse.json({
        section: section ?? { key, ...defaultSections[key], media: null, mediaId: null, isVisible: true },
        isDefault: !section,
    });
}

async function saveSection(req: NextRequest, { params }: KeyContext) {
    const key = await resolveKey(params);
    if (!key) return invalidKey();

    const existing = await prisma.homeSection.findUnique({ where: { key } });
    const parsed = parseBody(await readJson(req), sectionSpec, { partial: !!existing });
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });

    try {
        const data = parsed.data as { title: string };
        const section = await prisma.homeSection.upsert({
            where: { key },
            update: data,
            create: { key, ...data },
            include: { media: true },
        });

        revalidateHome();
        return NextResponse.json({ section });
    } catch (err) {
        return prismaErrorResponse(err, "section");
    }
}

async function resetSection(_req: NextRequest, { params }: KeyContext) {
    const key = await resolveKey(params);
    if (!key) return invalidKey();

    await prisma.homeSection.deleteMany({ where: { key } });
    revalidateHome();
    return NextResponse.json({ success: true });
}
