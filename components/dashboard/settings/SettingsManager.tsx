"use client"

import * as React from "react"
import { Bell, Globe, Plug, Shield, User, Users } from "lucide-react"
import type { Media } from "@prisma/client"

import type { SiteSettingsWithMedia } from "@/lib/settings"
import ProfileTab from "./ProfileTab"
import WebsiteTab from "./WebsiteTab"
import TeamTab from "./TeamTab"
import NotificationsTab from "./NotificationsTab"
import IntegrationsTab from "./IntegrationsTab"
import SecurityTab from "./SecurityTab"

export type SettingsTab = "profile" | "website" | "team" | "notifications" | "integrations" | "security"

export type Me = { id: number; name: string; email: string; avatar: Media | null; totpEnabled: boolean }

export type Member = {
    id: number
    name: string
    email: string
    createdAt: Date
    lastLoginAt: Date | null
    totpEnabled: boolean
    inviteExpiresAt: Date | null
    invitedById: number | null
    accepted: boolean
    avatar: { secureUrl: string } | null
}

export type SessionRow = {
    id: string
    userAgent: string | null
    ipAddress: string | null
    createdAt: Date
    expiresAt: Date
    current: boolean
}

export type Integrations = {
    youtube: { status: "ok" | "error" | "off"; detail: string }
    cloudinary: boolean
    gmail: { configured: boolean; sender: string | null; recipients: string[] }
    cron: { secretSet: boolean; lastRunAt: Date | null }
}

export type TestEmailAction = () => Promise<{ ok: true } | { ok: false; error: string }>

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "website", label: "Website", icon: Globe },
    { id: "team", label: "Team & Access", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Plug },
    { id: "security", label: "Security", icon: Shield },
]


export default function SettingsManager({
    initialTab,
    me,
    settings,
    members,
    sessions,
    integrations,
    onSendTestEmail,
}: {
    initialTab: SettingsTab
    me: Me
    settings: SiteSettingsWithMedia
    members: Member[]
    sessions: SessionRow[]
    integrations: Integrations
    onSendTestEmail: TestEmailAction
}) {
    const [tab, setTab] = React.useState(initialTab)

    function open(next: SettingsTab) {
        setTab(next)
        // Keep the tab in the URL so a reload (or a shared link) lands on it
        window.history.replaceState(null, "", next === "profile" ? "?" : `?tab=${next}`)
    }

    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            <header className="sticky top-0 z-30 flex h-16 items-center border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">Settings</p>
                    <h1 className="text-lg font-semibold">{tabs.find((t) => t.id === tab)?.label}</h1>
                </div>
            </header>

            <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[240px_1fr]">

                <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto border-b border-zinc-200 bg-white p-3 lg:block lg:border-b-0 lg:border-r dark:border-zinc-800 dark:bg-zinc-950">
                    {tabs.map((t) => {
                        const Icon = t.icon
                        const active = tab === t.id
                        return (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => open(t.id)}
                                aria-current={active ? "page" : undefined}
                                className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg border px-3 py-2.5 text-left text-sm transition lg:mb-1 lg:w-full ${active
                                    ? "border-red-500/30 bg-red-500/5 font-medium text-red-500"
                                    : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                    }`}
                            >
                                <Icon size={16} className={active ? "" : "text-zinc-400"} />
                                {t.label}
                            </button>
                        )
                    })}
                </nav>

                <main className="bg-white dark:bg-zinc-950">
                    <div className="mx-auto max-w-3xl p-6">
                        {tab === "profile" && <ProfileTab me={me} />}
                        {tab === "website" && <WebsiteTab settings={settings} />}
                        {tab === "team" && <TeamTab members={members} meId={me.id} />}
                        {tab === "notifications" && <NotificationsTab settings={settings} gmailConfigured={integrations.gmail.configured} recipients={integrations.gmail.recipients} />}
                        {tab === "integrations" && <IntegrationsTab integrations={integrations} settings={settings} onSendTestEmail={onSendTestEmail} onOpenTab={open} />}
                        {tab === "security" && <SecurityTab me={me} sessions={sessions} />}
                    </div>
                </main>
            </div>
        </div>
    )
}
