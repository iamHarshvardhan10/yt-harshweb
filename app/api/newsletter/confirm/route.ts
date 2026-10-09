import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { revalidateNewsletter } from "@/lib/newsletter/revalidate";
import { notifyNewSubscriber } from "@/lib/notifications";
import { getSiteUrl } from "@/lib/settings";

/** GET /api/newsletter/confirm?token=…  — the link in the confirmation email. */
export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token") ?? "";
    const done = (state: string) => NextResponse.redirect(new URL(`/newsletter/status?state=${state}`, req.url));

    const subscriber = token ? await prisma.subscriber.findUnique({ where: { token } }) : null;
    if (!subscriber) return done("invalid");

    if (subscriber.status !== "ACTIVE") {
        await prisma.subscriber.update({
            where: { id: subscriber.id },
            data: { status: "ACTIVE", confirmedAt: new Date(), unsubscribedAt: null },
        });
        revalidateNewsletter(); // reader count on /newsletter
        await notifyNewSubscriber(subscriber, await getSiteUrl(req.nextUrl.origin));
    }
    return done("confirmed");
}
