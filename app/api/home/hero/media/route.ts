import { NextRequest, NextResponse } from "next/server";
import { HomeHeroMediaRole, MediaResourceType } from "@prisma/client";
import { revalidateHome } from "@/lib/home/revalidate";
import { prisma } from "@/lib/prisma";
import { getHero, heroInclude } from "@/lib/home/queries";
import { defaultHero } from "@/lib/home/defaults";
import { readJson } from "@/lib/home/validation";
import { withAdmin } from "@/lib/auth/dal";

/**
 *   POST   /api/home/hero/media           { mediaId, role }  attach / replace background
 *   DELETE /api/home/hero/media?role=...                     detach background
 */

function isRole(value: unknown): value is HomeHeroMediaRole {
    return typeof value === "string" && value in HomeHeroMediaRole;
}

export const POST = withAdmin(attachHeroMedia);
export const DELETE = withAdmin(detachHeroMedia);

async function attachHeroMedia(req: NextRequest) {
    const { mediaId, role } = ((await readJson(req)) ?? {}) as { mediaId?: unknown; role?: unknown };

    if (typeof mediaId !== "string" || !isRole(role)) {
        return NextResponse.json(
            { error: "mediaId and a valid role (BACKGROUND_IMAGE | BACKGROUND_VIDEO) are required" },
            { status: 400 }
        );
    }

    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) return NextResponse.json({ error: "Media not found" }, { status: 404 });

    const expectedType =
        role === HomeHeroMediaRole.BACKGROUND_IMAGE ? MediaResourceType.IMAGE : MediaResourceType.VIDEO;

    if (media.resourceType !== expectedType) {
        return NextResponse.json(
            { error: `${role} requires a ${expectedType.toLowerCase()} file` },
            { status: 400 }
        );
    }

    // Media can be attached before the hero copy is first saved
    const hero = (await getHero()) ?? (await prisma.homeHero.create({ data: defaultHero, include: heroInclude }));

    await prisma.homeHeroMedia.upsert({
        where: { homeHeroId_role: { homeHeroId: hero.id, role } },
        update: { mediaId },
        create: { homeHeroId: hero.id, mediaId, role },
    });

    revalidateHome();
    return NextResponse.json({ hero: await getHero() }, { status: 201 });
}

async function detachHeroMedia(req: NextRequest) {
    const role = req.nextUrl.searchParams.get("role");
    if (!isRole(role)) {
        return NextResponse.json({ error: "Valid role query param required" }, { status: 400 });
    }

    const hero = await getHero();
    if (!hero) return NextResponse.json({ error: "hero not found" }, { status: 404 });

    await prisma.homeHeroMedia.deleteMany({ where: { homeHeroId: hero.id, role } });

    revalidateHome();
    return NextResponse.json({ hero: await getHero() });
}
