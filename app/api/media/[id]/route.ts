import { NextRequest, NextResponse } from "next/server";
import { revalidateHome } from "@/lib/home/revalidate";
import { prisma } from "@/lib/prisma";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { withAdmin } from "@/lib/auth/dal";

/** DELETE /api/media/{id} → removes the Cloudinary asset and its Media row */
export const DELETE = withAdmin(deleteMedia);

async function deleteMedia(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const media = await prisma.media.findUnique({
        where: { id },
        include: { _count: { select: { homeHeroMedia: true } } },
    });

    if (!media) return NextResponse.json({ error: "Media not found" }, { status: 404 });

    // HomeHeroMedia uses onDelete: Restrict — detach the hero background first
    if (media._count.homeHeroMedia > 0) {
        return NextResponse.json(
            { error: "Media is used as a hero background. Remove it from the hero first." },
            { status: 409 }
        );
    }

    try {
        await prisma.media.delete({ where: { id } });
        await destroyCloudinaryAsset(media.publicId, media.resourceType === "VIDEO" ? "video" : "image");
        revalidateHome();
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete media error:", err);
        return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
    }
}
