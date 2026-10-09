import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { isMailConfigured, mailErrorMessage, sendMail } from "@/lib/mail";

/**
 * Team invites. The emailed link carries a random token; only its SHA-256 is
 * stored, on a User row with no password yet. Accepting sets the password, and
 * the first sign-in then sets up the authenticator as usual.
 */

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const hashInviteToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Issues a fresh invite link for a pending member (replaces any older link). */
export async function issueInvite(userId: number, site: string) {
    const token = randomBytes(32).toString("base64url");
    await prisma.user.update({
        where: { id: userId },
        data: { inviteTokenHash: hashInviteToken(token), inviteExpiresAt: new Date(Date.now() + INVITE_TTL_MS) },
    });
    return `${site}/invite?token=${token}`;
}

/** Emails the invite link. Returns an error message instead of throwing. */
export async function emailInvite({ to, name, inviter, url }: { to: string; name: string; inviter: string; url: string }) {
    if (!isMailConfigured()) return "Email isn't set up, so copy the link and send it yourself.";

    try {
        await sendMail({
            to: [to],
            subject: `${inviter} invited you to the creator dashboard`,
            text: `Hi ${name},\n\n${inviter} invited you to help manage the creator dashboard.\n\nSet your password here (the link works for 7 days):\n${url}\n\nAfter that you'll sign in with your email, password and Google Authenticator.`,
            html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#18181b">
  <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#dc2626">Dashboard invite</p>
  <h1 style="margin:8px 0 16px;font-size:20px">${escapeHtml(inviter)} invited you</h1>
  <p style="margin:0 0 20px;font-size:14px;line-height:1.6">Hi ${escapeHtml(name)}, you've been invited to help manage the creator dashboard. Set a password to get started — this link works for 7 days.</p>
  <p style="margin:0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:14px;font-weight:500">Accept invite</a></p>
  <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa">After that you'll sign in with your email, password and Google Authenticator.</p>
</div>`,
        });
        return null;
    } catch (err) {
        return mailErrorMessage(err);
    }
}

const escapeHtml = (text: string) =>
    text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** The pending member for an invite token, or null when it's unknown or expired. */
export async function findInvite(token: string) {
    if (!token) return null;
    const user = await prisma.user.findUnique({ where: { inviteTokenHash: hashInviteToken(token) } });
    if (!user || user.passwordHash || !user.inviteExpiresAt || user.inviteExpiresAt < new Date()) return null;
    return user;
}
