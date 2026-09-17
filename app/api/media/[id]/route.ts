// app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const media = await prisma.media.findUnique({ where: { id: params.id } });

        if (!media) {
            return NextResponse.json({ error: "Media not found" }, { status: 404 });
        }

        await destroyCloudinaryAsset(
            media.publicId,
            media.resourceType === "VIDEO" ? "video" : "image"
        );

        await prisma.media.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true });
    } catch (err) {
        // onDelete: Restrict on HomeHeroMedia means this throws if media is in use
        console.error("Delete error:", err);
        return NextResponse.json(
            { error: "Failed to delete media. It may still be in use." },
            { status: 409 }
        );
    }
}