import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/auth/dal";
import { prismaErrorResponse } from "@/lib/home/collections";
import { parseBody, readJson, type Spec } from "@/lib/home/validation";
import { revalidateVideoPages } from "@/lib/videos/queries";

type IdContext = { params: Promise<{ id: string }> };

const videoSettingSpec: Spec = {
    isVisible: { type: "boolean" },
    showOnHome: { type: "boolean" },
    featured: { type: "boolean" },
    displayOrder: { type: "int", min: 1, max: 9999, nullable: true },
    category: { type: "string", max: 40 },
};

/** Saves how one YouTube upload appears on the website. */
export const PATCH = withAdmin(async (req: NextRequest, { params }: IdContext) => {
    const { id } = await params;
    if (!/^[\w-]{11}$/.test(id)) return NextResponse.json({ error: "Not a YouTube video id" }, { status: 400 });

    const parsed = parseBody(await readJson(req), videoSettingSpec, { partial: true });
    if (parsed.error !== undefined) return NextResponse.json({ error: parsed.error }, { status: 400 });

    try {
        const setting = await prisma.videoSetting.upsert({
            where: { videoId: id },
            create: { videoId: id, ...parsed.data },
            update: parsed.data,
            omit: { updatedAt: true },
        });
        revalidateVideoPages();
        return NextResponse.json({ setting });
    } catch (err) {
        return prismaErrorResponse(err, "video");
    }
});
