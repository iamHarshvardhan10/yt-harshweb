import { NextRequest, NextResponse } from "next/server";
import type { SubscriberStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/auth/dal";
import { prismaErrorResponse } from "@/lib/home/collections";
import { readJson } from "@/lib/home/validation";

type IdContext = { params: Promise<{ id: string }> };

/** PATCH { status: "ACTIVE" | "UNSUBSCRIBED" } — e.g. confirm someone by hand, or remove them from sends. */
export const PATCH = withAdmin(async (req: NextRequest, { params }: IdContext) => {
    const { status } = ((await readJson(req)) ?? {}) as { status?: SubscriberStatus };
    if (status !== "ACTIVE" && status !== "UNSUBSCRIBED") {
        return NextResponse.json({ error: 'status must be "ACTIVE" or "UNSUBSCRIBED"' }, { status: 400 });
    }

    const now = new Date();
    try {
        const item = await prisma.subscriber.update({
            where: { id: (await params).id },
            data: status === "ACTIVE"
                ? { status, confirmedAt: now, unsubscribedAt: null }
                : { status, unsubscribedAt: now },
        });
        return NextResponse.json({ item });
    } catch (err) {
        return prismaErrorResponse(err, "subscriber");
    }
});

/** DELETE — removes the person and their email entirely (e.g. on request). */
export const DELETE = withAdmin(async (_req: NextRequest, { params }: IdContext) => {
    try {
        await prisma.subscriber.delete({ where: { id: (await params).id } });
        return NextResponse.json({ success: true });
    } catch (err) {
        return prismaErrorResponse(err, "subscriber");
    }
});
