import { NextResponse } from "next/server";
import { Prisma, type InvestigationStatus } from "@prisma/client";

import { prismaErrorResponse } from "@/lib/home/collections";

/** Prisma errors → API responses, with a readable message for a duplicate slug. */
export function investigationErrorResponse(err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return NextResponse.json({ error: "Another investigation already uses this slug" }, { status: 409 });
    }
    return prismaErrorResponse(err, "investigation");
}

/**
 * Publishing without a date stamps today's date, so the website always has one to show.
 * `sent` is the date in the request (undefined = not sent), `current` the stored one.
 */
export function publishDate(
    status: InvestigationStatus | undefined,
    sent: Date | null | undefined,
    current: Date | null
): Date | null | undefined {
    const date = sent === undefined ? current : sent;
    if (status === "PUBLISHED" && !date) return new Date(new Date().toISOString().slice(0, 10));
    return sent;
}
