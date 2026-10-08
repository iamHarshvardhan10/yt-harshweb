import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/auth/dal";

/** GET /api/home/sections → all saved section headers */
export const GET = withAdmin(async () => {
    const sections = await prisma.homeSection.findMany({ include: { media: true } });
    return NextResponse.json({ sections });
});
