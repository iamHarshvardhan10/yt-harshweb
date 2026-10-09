import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isMailConfigured, mailErrorMessage } from "@/lib/mail";
import { readJson } from "@/lib/home/validation";
import { newToken, sendConfirmation, siteUrl } from "@/lib/newsletter/email";
import { EMAIL_PATTERN, NEWSLETTER_TOPICS } from "@/lib/newsletter/shared";

/**
 * POST /api/newsletter/subscribe  { email, name?, topics?, website? }   (public)
 *
 * Double opt-in: new sign-ups get a confirmation email and stay PENDING until
 * they click it. The response is the same whether or not the email was already
 * on the list, so the form can't be used to look up subscribers.
 * If Gmail isn't configured yet, sign-ups are accepted as ACTIVE so none are lost.
 */

const RESEND_AFTER_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
    const body = (await readJson(req)) as Record<string, unknown> | undefined;
    if (!body || typeof body !== "object") return bad("Invalid request");

    // Honeypot: real visitors never see or fill this field
    if (typeof body.website === "string" && body.website.trim()) return ok(true);

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!EMAIL_PATTERN.test(email) || email.length > 254) return bad("Enter a valid email address.");

    const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) || null : null;
    const topics = Array.isArray(body.topics)
        ? NEWSLETTER_TOPICS.filter((topic) => (body.topics as unknown[]).includes(topic))
        : [];
    if (topics.length === 0) return bad("Pick at least one topic.");

    const confirmByEmail = isMailConfigured();
    const existing = await prisma.subscriber.findUnique({ where: { email } });

    // Already subscribed: nothing to do (don't let strangers change their topics)
    if (existing?.status === "ACTIVE") return ok(confirmByEmail);

    const now = new Date();
    const subscriber = existing
        ? await prisma.subscriber.update({
            where: { id: existing.id },
            data: { name: name ?? existing.name, topics, status: "PENDING", unsubscribedAt: null },
        })
        : await prisma.subscriber.create({
            data: { email, name, topics, source: "website", token: newToken(), status: "PENDING" },
        });

    if (!confirmByEmail) {
        await prisma.subscriber.update({ where: { id: subscriber.id }, data: { status: "ACTIVE", confirmedAt: now } });
        return ok(false);
    }

    // Don't resend confirmations more than once every 10 minutes
    if (subscriber.confirmationSentAt && now.getTime() - subscriber.confirmationSentAt.getTime() < RESEND_AFTER_MS) {
        return ok(true);
    }

    try {
        await sendConfirmation(subscriber, await siteUrl(req.nextUrl.origin));
        await prisma.subscriber.update({ where: { id: subscriber.id }, data: { confirmationSentAt: now } });
        return ok(true);
    } catch (err) {
        console.error("[newsletter] confirmation email failed:", mailErrorMessage(err));
        return NextResponse.json({ error: "We couldn't send the confirmation email. Please try again in a few minutes." }, { status: 502 });
    }
}

const ok = (confirmationRequired: boolean) => NextResponse.json({ ok: true, confirmationRequired });
const bad = (error: string) => NextResponse.json({ error }, { status: 400 });
