import { redirect } from "next/navigation"

import { getAdminUser } from "@/lib/auth/dal"
import { currentSessionId } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { getReminderRecipients, isMailConfigured } from "@/lib/mail"
import { getSiteSettings } from "@/lib/settings"
import { getYouTubeOverview } from "@/lib/youtube"
import { sendTestEmail } from "@/app/dashboard/(content)/schedule/actions"
import SettingsManager, { type SettingsTab } from "@/components/dashboard/settings/SettingsManager"

const tabs: SettingsTab[] = ["profile", "website", "team", "notifications", "integrations", "security"]

export default async function SettingsPage({ searchParams }: PageProps<"/dashboard/settings">) {
    // proxy.ts only checks that a cookie exists — confirm the session here
    const admin = await getAdminUser()
    if (!admin) redirect("/login?next=/dashboard/settings")

    const { tab } = await searchParams
    const initialTab = tabs.find((t) => t === tab) ?? "profile"

    const [me, settings, members, sessions, currentId, youtube, recipients] = await Promise.all([
        prisma.user.findUniqueOrThrow({
            where: { id: admin.id },
            select: { id: true, name: true, email: true, avatar: true, totpEnabled: true },
        }),
        getSiteSettings(),
        // Never send password hashes, TOTP secrets or invite tokens to the browser
        prisma.user.findMany({
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                lastLoginAt: true,
                totpEnabled: true,
                inviteExpiresAt: true,
                invitedById: true,
                passwordHash: true, // only to derive `accepted` below
                avatar: { select: { secureUrl: true } },
            },
        }),
        prisma.session.findMany({
            where: { userId: admin.id, stage: "ACTIVE", expiresAt: { gt: new Date() } },
            orderBy: { createdAt: "desc" },
            select: { id: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true },
        }),
        currentSessionId(),
        getYouTubeOverview(),
        getReminderRecipients(),
    ])

    return (
        <SettingsManager
            initialTab={initialTab}
            me={me}
            settings={settings}
            members={members.map(({ passwordHash, ...member }) => ({ ...member, accepted: passwordHash !== null }))}
            sessions={sessions.map((s) => ({ ...s, current: s.id === currentId }))}
            integrations={{
                youtube:
                    youtube.status === "ok"
                        ? { status: "ok", detail: `${youtube.data.channel.title}${youtube.data.channel.handle ? ` (${youtube.data.channel.handle})` : ""}` }
                        : youtube.status === "error"
                            ? { status: "error", detail: youtube.message }
                            : { status: "off", detail: "Add YOUTUBE_API_KEY and YOUTUBE_CHANNEL to .env" },
                cloudinary: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
                gmail: { configured: isMailConfigured(), sender: process.env.GMAIL_USER || null, recipients },
                cron: { secretSet: Boolean(process.env.CRON_SECRET), lastRunAt: settings.lastCronRunAt },
            }}
            onSendTestEmail={sendTestEmail}
        />
    )
}
