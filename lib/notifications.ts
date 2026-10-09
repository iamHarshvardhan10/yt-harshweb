import type { Subscriber } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getReminderRecipients, isMailConfigured, mailErrorMessage, sendMail } from "@/lib/mail";
import { getSiteSettings, SITE_SETTINGS_ID } from "@/lib/settings";
import { getChannelComments, getChannelUploads } from "@/lib/youtube";
import { formatUpload, typeLabels } from "@/lib/ideas/shared";

/**
 * Email notifications for the dashboard admins, switched on and off in
 * Settings → Notifications. All of them go through Gmail (lib/mail.ts).
 */

const escapeHtml = (text: string) =>
    text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type Block = { heading: string; lines: string[] };

/** Small, consistent admin email: a title, sections of lines, one button. */
function adminEmail({ eyebrow, title, blocks, cta }: { eyebrow: string; title: string; blocks: Block[]; cta: { url: string; label: string } }) {
    const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b">
  <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#dc2626">${escapeHtml(eyebrow)}</p>
  <h1 style="margin:8px 0 20px;font-size:20px;line-height:1.3">${escapeHtml(title)}</h1>
  ${blocks
            .map(
                (b) => `<h2 style="margin:20px 0 8px;font-size:13px;color:#71717a;font-weight:600">${escapeHtml(b.heading)}</h2>
  <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.7">${b.lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`
            )
            .join("\n")}
  <p style="margin:24px 0 0"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:14px;font-weight:500">${escapeHtml(cta.label)}</a></p>
  <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa">Change which emails you get in Settings → Notifications.</p>
</div>`;

    const text = [title, ...blocks.flatMap((b) => ["", `${b.heading}:`, ...b.lines.map((l) => `- ${l}`)]), "", `${cta.label}: ${cta.url}`].join("\n");
    return { html, text };
}

async function notifyAdmins(subject: string, email: { html: string; text: string }) {
    await sendMail({ to: await getReminderRecipients(), subject, ...email });
}

/* =============================================================
   NEW SUBSCRIBER (when someone confirms)
============================================================= */

export async function notifyNewSubscriber(subscriber: Pick<Subscriber, "email" | "name" | "topics">, site: string) {
    if (!isMailConfigured() || !(await getSiteSettings()).notifyNewSubscriber) return;

    const active = await prisma.subscriber.count({ where: { status: "ACTIVE" } });
    const who = subscriber.name ? `${subscriber.name} (${subscriber.email})` : subscriber.email;

    try {
        await notifyAdmins(
            `New newsletter subscriber: ${subscriber.email}`,
            adminEmail({
                eyebrow: "Newsletter",
                title: `${who} subscribed`,
                blocks: [{ heading: "Details", lines: [`Topics: ${subscriber.topics.join(", ") || "—"}`, `You now have ${active} active subscribers`] }],
                cta: { url: `${site}/dashboard/newsletter`, label: "Open the newsletter" },
            })
        );
    } catch (err) {
        // Never block the subscriber's confirmation on our notification
        console.error("[notifications] new subscriber email failed:", mailErrorMessage(err));
    }
}

/* =============================================================
   NEW COMMENTS (hourly digest)
============================================================= */

export async function sendCommentDigest(site: string, now = new Date()): Promise<string> {
    const settings = await getSiteSettings();
    if (!settings.notifyNewComments) return "off";
    if (!isMailConfigured()) return "email not set up";

    const since = settings.commentsCheckedAt;
    const result = await getChannelComments();
    if (result.status !== "ok") return `skipped: ${result.status === "error" ? result.message : "YouTube not set up"}`;

    // First run: start counting from now instead of emailing old comments
    const fresh = since
        ? result.data.threads.filter((t) => !t.isOwner && new Date(t.publishedAt) > since)
        : [];

    if (fresh.length) {
        const lines = fresh.slice(0, 15).map((t) => {
            const video = result.data.videos[t.videoId]?.title ?? "a video";
            const text = t.text.length > 140 ? `${t.text.slice(0, 140)}…` : t.text;
            return `${t.author} on “${video}”: ${text}`;
        });
        if (fresh.length > 15) lines.push(`…and ${fresh.length - 15} more`);

        await notifyAdmins(
            `${fresh.length} new comment${fresh.length === 1 ? "" : "s"} on your channel`,
            adminEmail({
                eyebrow: "YouTube comments",
                title: `${fresh.length} new comment${fresh.length === 1 ? "" : "s"} since ${formatUpload(since!)} IST`,
                blocks: [{ heading: "Newest first", lines }],
                cta: { url: `${site}/dashboard/comments`, label: "Reply to comments" },
            })
        );
    }

    await prisma.siteSettings.update({ where: { id: SITE_SETTINGS_ID }, data: { commentsCheckedAt: now } });
    return fresh.length ? `sent (${fresh.length})` : "no new comments";
}

/* =============================================================
   WEEKLY SUMMARY (Mondays from 9 AM IST)
============================================================= */

const IST_OFFSET_MS = (5 * 60 + 30) * 60_000;
const DAY = 86_400_000;

export async function sendWeeklySummary(site: string, now = new Date()): Promise<string> {
    const settings = await getSiteSettings();
    if (!settings.notifyWeeklySummary) return "off";
    if (!isMailConfigured()) return "email not set up";

    const ist = new Date(now.getTime() + IST_OFFSET_MS);
    const isMondayMorning = ist.getUTCDay() === 1 && ist.getUTCHours() >= 9;
    const sentRecently = settings.weeklySummarySentAt && now.getTime() - settings.weeklySummarySentAt.getTime() < 6 * DAY;
    if (!isMondayMorning || sentRecently) return "not due";

    const weekAgo = new Date(now.getTime() - 7 * DAY);
    const nextWeek = new Date(now.getTime() + 7 * DAY);

    const [uploads, comments, newReaders, totalReaders, upcoming] = await Promise.all([
        getChannelUploads(),
        getChannelComments(),
        prisma.subscriber.count({ where: { status: "ACTIVE", confirmedAt: { gte: weekAgo } } }),
        prisma.subscriber.count({ where: { status: "ACTIVE" } }),
        prisma.contentIdea.findMany({
            where: { stage: { not: "UPLOADED" }, uploadAt: { gte: now, lte: nextWeek } },
            orderBy: { uploadAt: "asc" },
        }),
    ]);

    const blocks: Block[] = [];

    if (uploads.status === "ok") {
        const { channel } = uploads.data;
        const recent = uploads.data.uploads.filter((u) => new Date(u.publishedAt) >= weekAgo);
        blocks.push({
            heading: "Channel",
            lines: [
                `${channel.subscribers === null ? "Hidden" : channel.subscribers.toLocaleString("en-IN")} subscribers · ${channel.views.toLocaleString("en-IN")} total views`,
                recent.length
                    ? `${recent.length} upload${recent.length === 1 ? "" : "s"} this week`
                    : "No uploads this week",
                ...recent.map((u) => `“${u.title}” — ${u.views.toLocaleString("en-IN")} views`),
            ],
        });
    }

    if (comments.status === "ok") {
        const weekComments = comments.data.threads.filter((t) => !t.isOwner && new Date(t.publishedAt) >= weekAgo);
        const unanswered = weekComments.filter((t) => !t.ownerReply).length;
        blocks.push({
            heading: "Comments",
            lines: [`${weekComments.length} new this week, ${unanswered} still waiting for your reply`],
        });
    }

    blocks.push({
        heading: "Newsletter",
        lines: [`${newReaders} new subscriber${newReaders === 1 ? "" : "s"} this week · ${totalReaders} active in total`],
    });

    blocks.push({
        heading: "Coming up in the next 7 days",
        lines: upcoming.length
            ? upcoming.map((idea) => `${formatUpload(idea.uploadAt!)} — ${typeLabels[idea.type]}: ${idea.title}`)
            : ["Nothing scheduled — plan the next upload in Content Ideas"],
    });

    await notifyAdmins(
        "Your weekly channel summary",
        adminEmail({
            eyebrow: "Weekly summary",
            title: `Your week, up to ${formatUpload(now)} IST`,
            blocks,
            cta: { url: `${site}/dashboard`, label: "Open the dashboard" },
        })
    );

    await prisma.siteSettings.update({ where: { id: SITE_SETTINGS_ID }, data: { weeklySummarySentAt: now } });
    return "sent";
}
