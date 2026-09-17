// app/api/hero/[id]/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HomeHeroMediaRole, MediaResourceType } from "@prisma/client";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { mediaId, role } = await req.json();

        if (!mediaId || !role || !(role in HomeHeroMediaRole)) {
            return NextResponse.json(
                { error: "mediaId and a valid role (BACKGROUND_IMAGE | BACKGROUND_VIDEO) are required" },
                { status: 400 }
            );
        }

        const media = await prisma.media.findUnique({ where: { id: mediaId } });
        if (!media) {
            return NextResponse.json({ error: "Media not found" }, { status: 404 });
        }

        // Guard: image role must be an image, video role must be a video
        const expectedType =
            role === HomeHeroMediaRole.BACKGROUND_IMAGE
                ? MediaResourceType.IMAGE
                : MediaResourceType.VIDEO;

        if (media.resourceType !== expectedType) {
            return NextResponse.json(
                { error: `${role} requires a ${expectedType.toLowerCase()} media file` },
                { status: 400 }
            );
        }

        // Upsert: replaces existing image/video for this hero (unique on [homeHeroId, role])
        const heroMedia = await prisma.homeHeroMedia.upsert({
            where: { homeHeroId_role: { homeHeroId: params.id, role } },
            update: { mediaId },
            create: { homeHeroId: params.id, mediaId, role },
            include: { media: true },
        });

        return NextResponse.json({ heroMedia }, { status: 201 });
    } catch (err) {
        console.error("Attach media error:", err);
        return NextResponse.json({ error: "Failed to attach media" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const role = req.nextUrl.searchParams.get("role") as HomeHeroMediaRole | null;

        if (!role || !(role in HomeHeroMediaRole)) {
            return NextResponse.json({ error: "Valid role query param required" }, { status: 400 });
        }

        await prisma.homeHeroMedia.delete({
            where: { homeHeroId_role: { homeHeroId: params.id, role } },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Remove hero media error:", err);
        return NextResponse.json({ error: "Failed to remove media" }, { status: 500 });
    }
}