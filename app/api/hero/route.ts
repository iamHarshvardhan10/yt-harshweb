
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const heroes = await prisma.homeHero.findMany({
        include: { media: { include: { media: true } } },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ heroes });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            headline,
            description,
            primaryButtonName,
            primaryButtonUrl,
            secondaryButtonName,
            secondaryButtonUrl,
            backgroundType,
            darkOverlay,
        } = body;

        if (!headline || !description) {
            return NextResponse.json(
                { error: "headline and description are required" },
                { status: 400 }
            );
        }

        const hero = await prisma.homeHero.create({
            data: {
                headline,
                description,
                primaryButtonName,
                primaryButtonUrl,
                secondaryButtonName,
                secondaryButtonUrl,
                backgroundType,
                darkOverlay,
            },
        });

        return NextResponse.json({ hero }, { status: 201 });
    } catch (err) {
        console.error("Create hero error:", err);
        return NextResponse.json({ error: "Failed to create hero" }, { status: 500 });
    }
}