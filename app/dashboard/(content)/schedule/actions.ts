"use server"

import { headers } from "next/headers"

import { getAdminUser } from "@/lib/auth/dal"
import { mailErrorMessage } from "@/lib/mail"
import { sendTestReminder } from "@/lib/ideas/reminders"
import { getSiteUrl } from "@/lib/settings"

/** Sends a sample reminder to the reminder recipients. */
export async function sendTestEmail(): Promise<{ ok: true } | { ok: false; error: string }> {
    if (!(await getAdminUser())) return { ok: false, error: "Unauthorized" }

    const requestHeaders = await headers()
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "https"
    const siteUrl = await getSiteUrl(`${protocol}://${host}`)

    try {
        await sendTestReminder(siteUrl)
        return { ok: true }
    } catch (err) {
        console.error("[reminders] test email failed:", err)
        return { ok: false, error: mailErrorMessage(err) }
    }
}
