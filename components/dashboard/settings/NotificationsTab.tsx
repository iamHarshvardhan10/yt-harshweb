"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

import { useAction } from "@/components/dashboard/home/api"
import { EditorSection, StatusText, ToggleRow } from "@/components/dashboard/home/ui"
import type { SiteSettingsWithMedia } from "@/lib/settings"
import { patchSettings } from "./WebsiteTab"

type Key = "notifyNewSubscriber" | "notifyUploadReminders" | "notifyNewComments" | "notifyWeeklySummary"

const options: { key: Key; title: string; description: string }[] = [
    {
        key: "notifyUploadReminders",
        title: "Upload reminders",
        description: "About a day before each upload scheduled in Content Ideas / Schedule.",
    },
    {
        key: "notifyNewComments",
        title: "New YouTube comments",
        description: "An hourly digest of new comments on your videos (only when there are some).",
    },
    {
        key: "notifyNewSubscriber",
        title: "New newsletter subscribers",
        description: "When someone confirms their newsletter subscription.",
    },
    {
        key: "notifyWeeklySummary",
        title: "Weekly summary",
        description: "Monday morning: channel stats, the week's uploads and comments, new subscribers and what's scheduled next.",
    },
]

export default function NotificationsTab({
    settings,
    gmailConfigured,
    recipients,
}: {
    settings: SiteSettingsWithMedia
    gmailConfigured: boolean
    recipients: string[]
}) {
    const router = useRouter()
    const [values, setValues] = React.useState<Record<Key, boolean>>(() => ({
        notifyNewSubscriber: settings.notifyNewSubscriber,
        notifyUploadReminders: settings.notifyUploadReminders,
        notifyNewComments: settings.notifyNewComments,
        notifyWeeklySummary: settings.notifyWeeklySummary,
    }))
    const save = useAction()

    function toggle(key: Key, value: boolean) {
        setValues((v) => ({ ...v, [key]: value }))
        save.run(async () => {
            try {
                await patchSettings({ [key]: value })
                router.refresh()
            } catch (err) {
                setValues((v) => ({ ...v, [key]: !value }))
                throw err
            }
        })
    }

    return (
        <EditorSection
            number="01"
            title="Email Notifications"
            description={`Sent to ${recipients.join(", ") || "the dashboard admins"}. Checked every hour by the reminder job.`}
            actions={<StatusText status={save.status} />}
        >
            {!gmailConfigured && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
                    Email isn&apos;t set up yet, so nothing is sent. Add <code>GMAIL_USER</code> and <code>GMAIL_APP_PASSWORD</code> to <code>.env</code> (see Integrations).
                </div>
            )}

            <div className="space-y-3">
                {options.map((option) => (
                    <ToggleRow
                        key={option.key}
                        title={option.title}
                        description={option.description}
                        checked={values[option.key]}
                        onChange={(value) => toggle(option.key, value)}
                    />
                ))}
            </div>

            <p className="mt-4 text-[11px] leading-5 text-zinc-500">
                To send these to different addresses, set <code>REMINDER_EMAIL_TO</code> (comma-separated) in <code>.env</code>.
            </p>
        </EditorSection>
    )
}
