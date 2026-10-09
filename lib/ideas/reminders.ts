import type { ContentIdea } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getReminderRecipients, isMailConfigured, mailErrorMessage, sendMail } from "@/lib/mail";
import { formatUpload, stageLabels, typeLabels, uploadCountdown } from "@/lib/ideas/shared";
import { getSiteSettings } from "@/lib/settings";

/** A reminder goes out once a scheduled upload is this close. */
export const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;

export type ReminderRun = {
    sent: string[];
    failed: { title: string; error: string }[];
    skipped?: string;
    /** turned off in Settings → Notifications */
    off?: boolean;
};

/**
 * Emails every upcoming upload that's within 24 hours and hasn't had its
 * reminder yet. Safe to run as often as you like — each idea is claimed in the
 * DB before sending, so overlapping runs never send twice.
 */
export async function sendDueReminders({ siteUrl, now = new Date() }: { siteUrl: string; now?: Date }): Promise<ReminderRun> {
    if (!isMailConfigured()) return { sent: [], failed: [], skipped: "GMAIL_USER / GMAIL_APP_PASSWORD not set" };
    if (!(await getSiteSettings()).notifyUploadReminders) return { sent: [], failed: [], off: true };

    const due = await prisma.contentIdea.findMany({
        where: {
            stage: { not: "UPLOADED" },
            reminderSentAt: null,
            uploadAt: { gt: now, lte: new Date(now.getTime() + REMINDER_WINDOW_MS) },
        },
        orderBy: { uploadAt: "asc" },
    });
    if (due.length === 0) return { sent: [], failed: [] };

    const to = await getReminderRecipients();
    const run: ReminderRun = { sent: [], failed: [] };

    for (const idea of due) {
        // Claim it; the uploadAt match skips ideas rescheduled since we read them
        const claimed = await prisma.contentIdea.updateMany({
            where: { id: idea.id, reminderSentAt: null, uploadAt: idea.uploadAt },
            data: { reminderSentAt: now },
        });
        if (claimed.count === 0) continue;

        try {
            await sendMail({ to, ...reminderEmail(idea, siteUrl, now) });
            run.sent.push(idea.title);
        } catch (err) {
            // Release the claim so the next run tries again
            await prisma.contentIdea.updateMany({
                where: { id: idea.id, reminderSentAt: now },
                data: { reminderSentAt: null },
            });
            run.failed.push({ title: idea.title, error: mailErrorMessage(err) });
        }
    }

    if (run.failed.length) console.error("[reminders] some emails failed:", run.failed);
    return run;
}

/** Sends a sample reminder so the Gmail setup can be checked from the dashboard. */
export async function sendTestReminder(siteUrl: string) {
    const uploadAt = new Date(Date.now() + REMINDER_WINDOW_MS);
    const sample = {
        title: "Test reminder: your email setup works",
        type: "VIDEO",
        stage: "READY",
        category: null,
        notes: "This is a test from the Schedule page. Real reminders arrive about a day before each scheduled upload.",
        uploadAt,
    } as ContentIdea;

    await sendMail({ to: await getReminderRecipients(), ...reminderEmail(sample, siteUrl, new Date()) });
}

const escapeHtml = (text: string) =>
    text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function reminderEmail(idea: ContentIdea, siteUrl: string, now: Date) {
    const when = formatUpload(idea.uploadAt!);
    const countdown = uploadCountdown(idea.uploadAt!, now);
    const type = typeLabels[idea.type];
    const notReady = idea.stage !== "READY";
    const scheduleUrl = `${siteUrl.replace(/\/$/, "")}/dashboard/schedule`;

    const subject = `${countdown}: “${idea.title}” goes live ${when} IST`;

    const lines = [
        `${type} scheduled: ${idea.title}`,
        `Goes live: ${when} IST (${countdown.toLowerCase()})`,
        `Stage: ${stageLabels[idea.stage]}${notReady ? " — not marked ready yet" : ""}`,
        idea.category ? `Category: ${idea.category}` : null,
        idea.notes ? `\nNotes:\n${idea.notes}` : null,
        `\nOpen the schedule: ${scheduleUrl}`,
    ].filter((line) => line !== null);

    const row = (label: string, value: string, highlight = false) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#71717a;font-size:13px;white-space:nowrap">${label}</td>` +
        `<td style="padding:6px 0;font-size:14px;${highlight ? "color:#dc2626;font-weight:600" : "color:#18181b"}">${escapeHtml(value)}</td></tr>`;

    const html = `
<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#18181b">
  <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#dc2626">Upload reminder · ${escapeHtml(countdown)}</p>
  <h1 style="margin:8px 0 20px;font-size:20px;line-height:1.3">${escapeHtml(idea.title)}</h1>
  <table style="border-collapse:collapse">
    ${row("Format", type)}
    ${row("Goes live", `${when} IST`)}
    ${row("Stage", stageLabels[idea.stage] + (notReady ? " — not marked ready yet" : ""), notReady)}
    ${idea.category ? row("Category", idea.category) : ""}
  </table>
  ${idea.notes ? `<p style="margin:20px 0 0;padding:12px 14px;background:#f4f4f5;border-radius:8px;font-size:13px;line-height:1.6;white-space:pre-line">${escapeHtml(idea.notes)}</p>` : ""}
  <p style="margin:24px 0 0"><a href="${escapeHtml(scheduleUrl)}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:14px;font-weight:500">Open the schedule</a></p>
  <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa">Sent by your creator dashboard about a day before each scheduled upload.</p>
</div>`;

    return { subject, text: lines.join("\n"), html };
}
