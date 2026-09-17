// app/api/hero/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const hero = await prisma.homeHero.findUnique({
        where: { id: params.id },
        include: { media: { include: { media: true } } },
    });

    if (!hero) return NextResponse.json({ error: "Hero not found" }, { status: 404 });
    return NextResponse.json({ hero });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();

        const hero = await prisma.homeHero.update({
            where: { id: params.id },
            data: {
                headline: body.headline,
                description: body.description,
                primaryButtonName: body.primaryButtonName,
                primaryButtonUrl: body.primaryButtonUrl,
                secondaryButtonName: body.secondaryButtonName,
                secondaryButtonUrl: body.secondaryButtonUrl,
                backgroundType: body.backgroundType,
                darkOverlay: body.darkOverlay,
            },
        });

        return NextResponse.json({ hero });
    } catch (err) {
        console.error("Update hero error:", err);
        return NextResponse.json({ error: "Failed to update hero" }, { status: 500 });
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.homeHero.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete hero error:", err);
        return NextResponse.json({ error: "Failed to delete hero" }, { status: 500 });
    }
}