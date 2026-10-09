"use client"

import * as React from "react"
import { BarChart3, Clock3, Cloud, Loader2, Mail, Send, Video } from "lucide-react"

import { EditorSection } from "@/components/dashboard/home/ui"
import { relativeTime } from "@/lib/format"
import type { SiteSettingsWithMedia } from "@/lib/settings"
import type { Integrations, SettingsTab, TestEmailAction } from "./SettingsManager"

type State = "ok" | "warn" | "off"

const badge: Record<State, { label: string; className: string; dot: string }> = {
    ok: { label: "Connected", className: "bg-green-500/10 text-green-600", dot: "bg-green-500" },
    warn: { label: "Needs attention", className: "bg-amber-500/10 text-amber-600", dot: "bg-amber-500" },
    off: { label: "Not set up", className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900", dot: "bg-zinc-400" },
}

const HOUR = 60 * 60 * 1000

export default function IntegrationsTab({
    integrations,
    settings,
    onSendTestEmail,
    onOpenTab,
}: {
    integrations: Integrations
    settings: SiteSettingsWithMedia
    onSendTestEmail: TestEmailAction
    onOpenTab: (tab: SettingsTab) => void
}) {
    const { youtube, cloudinary, gmail, cron } = integrations
    const [now] = React.useState(() => Date.now())

    const cronState: State = !cron.secretSet
        ? "off"
        : cron.lastRunAt && now - cron.lastRunAt.getTime() < 2 * HOUR
            ? "ok"
            : "warn"

    return (
        <EditorSection
            number="01"
            title="Connected Services"
            description="Keys and passwords live in .env (and your host's environment settings) — never in the database. Restart the server after changing .env."
        >
            <div className="space-y-3">
                <Service
                    icon={Video}
                    name="YouTube Data API"
                    use="Videos, Shorts, comments and channel stats"
                    state={youtube.status === "ok" ? "ok" : youtube.status === "error" ? "warn" : "off"}
                    detail={youtube.detail}
                />

                <Service
                    icon={Cloud}
                    name="Cloudinary"
                    use="Image and video uploads for the website"
                    state={cloudinary ? "ok" : "off"}
                    detail={cloudinary ? "Uploads are enabled" : "Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env"}
                />

                <Service
                    icon={Mail}
                    name="Gmail (email)"
                    use="Newsletter, reminders, invites and notifications"
                    state={gmail.configured ? "ok" : "off"}
                    detail={
                        gmail.configured
                            ? `Sending as ${gmail.sender} · admin emails go to ${gmail.recipients.join(", ") || "nobody yet"}`
                            : "Turn on 2-Step Verification, create an App Password, then set GMAIL_USER and GMAIL_APP_PASSWORD in .env"
                    }
                >
                    {gmail.configured && <TestEmailButton onSend={onSendTestEmail} />}
                </Service>

                <Service
                    icon={Clock3}
                    name="Hourly job (GitHub Actions)"
                    use="Sends reminders, scheduled newsletters and notifications"
                    state={cronState}
                    detail={
                        !cron.secretSet
                            ? "Set CRON_SECRET in .env and on your host, plus the SITE_URL and CRON_SECRET repository secrets on GitHub"
                            : cron.lastRunAt
                                ? `Last ran ${relativeTime(cron.lastRunAt.toISOString())}${cronState === "warn" ? " — it should run every hour; check the Actions tab on GitHub" : ""}`
                                : "Hasn't run yet — it starts once the site is deployed and the workflow is on GitHub"
                    }
                />

                <Service
                    icon={BarChart3}
                    name="Google Analytics"
                    use="Website traffic"
                    state={settings.googleAnalyticsId ? "ok" : "off"}
                    detail={settings.googleAnalyticsId ? `Tracking with ${settings.googleAnalyticsId}` : "Add your Measurement ID under Website"}
                >
                    <button
                        type="button"
                        onClick={() => onOpenTab("website")}
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                        {settings.googleAnalyticsId ? "Change" : "Set up"}
                    </button>
                </Service>
            </div>
        </EditorSection>
    )
}

function Service({
    icon: Icon,
    name,
    use,
    state,
    detail,
    children,
}: {
    icon: React.ElementType
    name: string
    use: string
    state: State
    detail: string
    children?: React.ReactNode
}) {
    const b = badge[state]
    return (
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                        <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium">{name}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{use}</p>
                    </div>
                </div>
                <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${b.className}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${b.dot}`} />
                    {b.label}
                </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pl-12">
                <p className="min-w-0 flex-1 break-words text-[11px] leading-5 text-zinc-500">{detail}</p>
                {children}
            </div>
        </div>
    )
}

function TestEmailButton({ onSend }: { onSend: TestEmailAction }) {
    const [pending, startTransition] = React.useTransition()
    const [result, setResult] = React.useState<{ ok: boolean; text: string } | null>(null)

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                type="button"
                disabled={pending}
                onClick={() =>
                    startTransition(async () => {
                        const res = await onSend()
                        setResult(res.ok ? { ok: true, text: "Sent — check your inbox" } : { ok: false, text: res.error })
                    })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
                {pending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Send test email
            </button>
            {result && <p className={`max-w-xs text-right text-[11px] ${result.ok ? "text-green-600" : "text-red-500"}`}>{result.text}</p>}
        </div>
    )
}
