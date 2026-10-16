import { randomBytes } from "node:crypto";
import type { Campaign, Prisma, Subscriber } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getReminderRecipients, isMailConfigured, mailErrorMessage, sendMail } from "@/lib/mail";
import { bodyParagraphs } from "@/lib/newsletter/shared";

/**
 * Newsletter email — server only.
 *
 * Env (besides the Gmail settings in lib/mail.ts):
 *   NEWSLETTER_FROM_NAME   sender name readers see (default "Harshwardhan Bhosale")
 *   SITE_URL               public site address for links in emails (else Settings → Website → Site URL, else the request's)
 *
 * Gmail allows roughly 500 recipients a day on a personal account — fine for a
 * small list; move to a bulk provider (e.g. Resend) as the list grows.
 */

const fromName = () => process.env.NEWSLETTER_FROM_NAME || "Harshwardhan Bhosale";

export const newToken = () => randomBytes(24).toString("base64url");

export { getSiteUrl as siteUrl } from "@/lib/settings";

const escapeHtml = (text: string) =>
    text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Shared light email layout; table-free styles that Gmail and Outlook keep */
function layout({ preview, content, footer }: { preview?: string | null; content: string; footer: string }) {
    return `<!doctype html><html><body style="margin:0;background:#f4f4f5">
${preview ? `<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preview)}</div>` : ""}
<div style="max-width:560px;margin:0 auto;padding:32px 24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#18181b">
  <p style="margin:0 0 24px;font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#0284c7">${escapeHtml(fromName())}</p>
  <div style="background:#fff;border-radius:12px;padding:28px 24px">${content}</div>
  <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#71717a">${footer}</p>
</div></body></html>`;
}

const button = (href: string, label: string) =>
    `<a href="${escapeHtml(href)}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500">${escapeHtml(label)}</a>`;

/* =============================================================
   CONFIRMATION (double opt-in)
============================================================= */

export async function sendConfirmation(subscriber: Pick<Subscriber, "email" | "name" | "token">, site: string) {
    const url = `${site}/api/newsletter/confirm?token=${subscriber.token}`;
    const hello = subscriber.name ? `Hi ${subscriber.name},` : "Hi,";

    await sendMail({
        to: [subscriber.email],
        fromName: fromName(),
        subject: "Confirm your newsletter subscription",
        text: `${hello}\n\nPlease confirm you want the newsletter by opening this link:\n${url}\n\nIf you didn't sign up, ignore this email and you won't hear from us.`,
        html: layout({
            preview: "One click to confirm your subscription",
            content: `<h1 style="margin:0 0 12px;font-size:22px">Confirm your subscription</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6">${escapeHtml(hello)} please confirm you want new investigations and behind-the-scenes research in your inbox.</p>
${button(url, "Yes, subscribe me")}`,
            footer: "If you didn't sign up, ignore this email — you won't be added to the list.",
        }),
    });
}

/* =============================================================
   CAMPAIGNS
============================================================= */

function campaignEmail(campaign: Pick<Campaign, "id" | "subject" | "preview" | "body">, token: string, site: string) {
    const unsubscribeUrl = `${site}/newsletter/unsubscribe?token=${token}`;
    const webUrl = `${site}/newsletter/issues/${campaign.id}`;
    const paragraphs = bodyParagraphs(campaign.body);

    const html = layout({
        preview: campaign.preview,
        content: `<h1 style="margin:0 0 20px;font-size:22px;line-height:1.3">${escapeHtml(campaign.subject)}</h1>
${paragraphs
            .map(
                (segments) =>
                    `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;white-space:pre-line">${segments
                        .map((s) => (s.href ? `<a href="${escapeHtml(s.href)}" style="color:#0284c7">${escapeHtml(s.text)}</a>` : escapeHtml(s.text)))
                        .join("")}</p>`
            )
            .join("\n")}`,
        footer: `You're getting this because you subscribed on ${escapeHtml(site.replace(/^https?:\/\//, ""))}.<br>
<a href="${escapeHtml(webUrl)}" style="color:#71717a">View in browser</a> · <a href="${escapeHtml(unsubscribeUrl)}" style="color:#71717a">Unsubscribe</a>`,
    });

    const text = `${campaign.subject}\n\n${campaign.body}\n\n—\nView in browser: ${webUrl}\nUnsubscribe: ${unsubscribeUrl}`;

    return {
        subject: campaign.subject,
        html,
        text,
        headers: {
            // One-click unsubscribe in Gmail / Apple Mail (RFC 8058)
            "List-Unsubscribe": `<${site}/api/newsletter/unsubscribe?token=${token}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
    };
}

/** Active subscribers a campaign goes to: everyone, or anyone with a matching topic */
export function campaignAudience(topics: string[]): Prisma.SubscriberWhereInput {
    return { status: "ACTIVE", ...(topics.length ? { topics: { hasSome: topics } } : {}) };
}

/** Sends a preview to the dashboard admins (or REMINDER_EMAIL_TO). */
export async function sendCampaignTest(campaign: Pick<Campaign, "id" | "subject" | "preview" | "body">, site: string) {
    const email = campaignEmail(campaign, "test-preview", site);
    await sendMail({ to: await getReminderRecipients(), fromName: fromName(), ...email, subject: `[Test] ${email.subject}` });
}

export type SendResult = { sent: number; failed: number; error?: string };

/**
 * Sends a draft or scheduled campaign to its audience, one email per reader so
 * each gets their own unsubscribe link. Claims the campaign first so it can't
 * go out twice.
 */
export async function sendCampaign(id: string, site: string): Promise<SendResult> {
    if (!isMailConfigured()) return { sent: 0, failed: 0, error: "Email isn't set up: add GMAIL_USER and GMAIL_APP_PASSWORD to .env" };

    const claimed = await prisma.campaign.updateMany({
        where: { id, status: { in: ["DRAFT", "SCHEDULED"] } },
        data: { status: "SENDING" },
    });
    if (claimed.count === 0) return { sent: 0, failed: 0, error: "This campaign was already sent" };

    const campaign = await prisma.campaign.findUniqueOrThrow({ where: { id } });
    const readers = await prisma.subscriber.findMany({
        where: campaignAudience(campaign.topics),
        select: { email: true, token: true },
    });

    let sent = 0;
    let failed = 0;
    let lastError: string | undefined;

    for (const reader of readers) {
        try {
            await sendMail({ to: [reader.email], fromName: fromName(), ...campaignEmail(campaign, reader.token, site) });
            sent += 1;
        } catch (err) {
            failed += 1;
            lastError = mailErrorMessage(err);
            console.error(`[newsletter] send to ${reader.email} failed:`, err);
        }
    }

    await prisma.campaign.update({
        where: { id },
        data: { status: "SENT", sentAt: new Date(), recipientCount: sent, failedCount: failed },
    });

    return { sent, failed, error: failed ? lastError : undefined };
}

/** Sends scheduled campaigns whose time has come (called by the hourly cron). */
export async function sendDueCampaigns(site: string, now = new Date()) {
    const due = await prisma.campaign.findMany({
        where: { status: "SCHEDULED", scheduledAt: { lte: now } },
        select: { id: true, subject: true },
    });

    const results: (SendResult & { subject: string })[] = [];
    for (const campaign of due) {
        results.push({ subject: campaign.subject, ...(await sendCampaign(campaign.id, site)) });
    }
    return results;
}
