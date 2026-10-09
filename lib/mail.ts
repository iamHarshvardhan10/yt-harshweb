import nodemailer from "nodemailer";

import { prisma } from "@/lib/prisma";

/**
 * Email through Gmail SMTP — server only.
 *
 * Env:
 *   GMAIL_USER           the Gmail address that sends (e.g. you@gmail.com)
 *   GMAIL_APP_PASSWORD   a 16-character App Password (Google Account → Security →
 *                        2-Step Verification → App passwords), not your normal password
 *   REMINDER_EMAIL_TO    optional, comma-separated recipients; defaults to every
 *                        dashboard admin's email
 */

export const isMailConfigured = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    transporter ??= nodemailer.createTransport({
        service: "gmail",
        // Reuse connections when sending a newsletter to many people
        pool: true,
        maxConnections: 3,
        auth: {
            user: process.env.GMAIL_USER,
            // Google shows App Passwords in groups of four — spaces aren't part of it
            pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ""),
        },
    });
    return transporter;
}

/** Who gets dashboard emails: REMINDER_EMAIL_TO, or every admin. */
export async function getReminderRecipients() {
    const configured = process.env.REMINDER_EMAIL_TO?.split(",").map((email) => email.trim()).filter(Boolean);
    if (configured?.length) return configured;

    // Members who have accepted their invite (pending invites have no password yet)
    const admins = await prisma.user.findMany({ where: { passwordHash: { not: null } }, select: { email: true } });
    return admins.map((admin) => admin.email);
}

export async function sendMail({
    to,
    subject,
    text,
    html,
    fromName = "Creator Dashboard",
    headers,
}: {
    to: string[];
    subject: string;
    text: string;
    html: string;
    fromName?: string;
    headers?: Record<string, string>;
}) {
    if (!isMailConfigured()) throw new Error("Email isn't set up: add GMAIL_USER and GMAIL_APP_PASSWORD to .env");
    if (to.length === 0) throw new Error("No one to email: set REMINDER_EMAIL_TO or create a dashboard admin");

    await getTransporter().sendMail({
        from: { name: fromName, address: process.env.GMAIL_USER! },
        to,
        subject,
        text,
        html,
        headers,
    });
}

/** Gmail's error for a wrong / normal password → what to change */
export function mailErrorMessage(err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (/Username and Password not accepted|Invalid login|535/i.test(message)) {
        return "Gmail rejected the login. GMAIL_APP_PASSWORD must be an App Password (Google Account → Security → App passwords), not your Gmail password.";
    }
    return message;
}
