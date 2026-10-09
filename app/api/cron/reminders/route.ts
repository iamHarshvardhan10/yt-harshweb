import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { mailErrorMessage } from "@/lib/mail";
import { sendDueReminders } from "@/lib/ideas/reminders";
import { sendDueCampaigns, siteUrl } from "@/lib/newsletter/email";
import { revalidateNewsletter } from "@/lib/newsletter/revalidate";
import { sendCommentDigest, sendWeeklySummary } from "@/lib/notifications";
import { getSiteSettings, SITE_SETTINGS_ID } from "@/lib/settings";

/**
 * GET /api/cron/reminders — the hourly job:
 *   1. emails you about uploads scheduled within the next 24 hours
 *   2. sends newsletter campaigns whose scheduled time has passed
 *   3. emails a digest of new YouTube comments (if turned on)
 *   4. emails the weekly summary on Monday mornings (if turned on)
 *
 * Called by .github/workflows/upload-reminders.yml with
 * `Authorization: Bearer <CRON_SECRET>`. Running it more often never sends twice.
 */

function authorized(req: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret) return false;

    const given = Buffer.from(req.headers.get("authorization") ?? "");
    const expected = Buffer.from(`Bearer ${secret}`);
    return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Runs one optional job; its failure is reported but doesn't stop the others */
async function attempt(job: () => Promise<string>) {
    try {
        return { status: await job() };
    } catch (err) {
        return { status: "failed", error: mailErrorMessage(err) };
    }
}

export async function GET(req: NextRequest) {
    if (!process.env.CRON_SECRET) {
        return NextResponse.json({ error: "CRON_SECRET is not set on the server" }, { status: 500 });
    }
    if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const site = await siteUrl(req.nextUrl.origin);

    const reminders = await sendDueReminders({ siteUrl: site, now });
    const newsletters = await sendDueCampaigns(site, now);
    if (newsletters.length) revalidateNewsletter();
    const comments = await attempt(() => sendCommentDigest(site, now));
    const weeklySummary = await attempt(() => sendWeeklySummary(site, now));

    // Shown under Settings → Integrations
    await getSiteSettings();
    await prisma.siteSettings.update({ where: { id: SITE_SETTINGS_ID }, data: { lastCronRunAt: now } });

    // Any failure fails the workflow run, so GitHub shows it
    const failed =
        reminders.failed.length > 0 ||
        newsletters.some((n) => n.failed > 0 || (n.sent === 0 && n.error)) ||
        comments.status === "failed" ||
        weeklySummary.status === "failed";
    const status = reminders.skipped ? 503 : failed ? 502 : 200;

    return NextResponse.json({ reminders, newsletters, comments, weeklySummary }, { status });
}
