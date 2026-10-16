"use client"

import * as React from "react"

import {
    RefreshCw,
    Save,
    ExternalLink,
    Users,
    Eye,
    Video,
    Clock3,
    Upload,
    Link2,
    Play,
    CheckCircle2,
    Unplug,
} from "lucide-react"


const channelStats = [
    { label: "Subscribers", value: "12.4K", icon: Users },
    { label: "Lifetime Views", value: "3.8M", icon: Eye },
    { label: "Videos", value: "24", icon: Video },
    { label: "Watch Hours", value: "182K", icon: Clock3 },
]


const socialLinks = [
    { label: "Instagram", placeholder: "https://instagram.com/..." },
    { label: "X / Twitter", placeholder: "https://x.com/..." },
    { label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
    { label: "Website", placeholder: "https://..." },
]


export default function ChannelPage() {

    const [connected, setConnected] =
        React.useState(true)

    const [syncing, setSyncing] =
        React.useState(false)

    const [channelName, setChannelName] =
        React.useState("Harshwardhan Bhosale")

    const [handle, setHandle] =
        React.useState("@harshbhosale")

    const [description, setDescription] =
        React.useState(
            "Investigative explainers on policy, climate and the systems that shape India. New stories every week."
        )

    const [links, setLinks] =
        React.useState<Record<string, string>>({
            Instagram: "https://instagram.com/harshbhosale",
            "X / Twitter": "",
            LinkedIn: "",
            Website: "https://harshbhosale.com",
        })

    const [autoSync, setAutoSync] =
        React.useState(true)

    const [importShorts, setImportShorts] =
        React.useState(true)


    function sync() {
        setSyncing(true)
        setTimeout(() => setSyncing(false), 1200)
    }


    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                        Channel
                    </p>

                    <h1 className="text-lg font-semibold">
                        YouTube Channel
                    </h1>
                </div>

                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        onClick={sync}
                        disabled={syncing || !connected}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    >
                        <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
                        {syncing ? "Syncing..." : "Sync"}
                    </button>

                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        <Save size={16} />
                        Save Changes
                    </button>

                </div>

            </header>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="min-h-[calc(100vh-64px)]">

                <div className="mx-auto max-w-5xl px-6 py-8">

                    {/* CHANNEL CARD */}

                    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

                        <div className="relative h-32 bg-zinc-900">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/40 to-transparent" />
                            <button
                                type="button"
                                className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur hover:bg-black/70"
                            >
                                <Upload size={12} />
                                Change banner
                            </button>
                        </div>

                        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between">

                            <div className="flex items-end gap-4">

                                <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-red-600 text-2xl font-semibold text-white dark:border-zinc-950">
                                    {channelName.charAt(0)}
                                </div>

                                <div className="pb-1">
                                    <p className="font-semibold">
                                        {channelName}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {handle}
                                    </p>
                                </div>

                            </div>

                            <div className="flex items-center gap-3">

                                {connected ? (
                                    <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] font-medium text-green-600">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                        Connected
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-500 dark:bg-zinc-900">
                                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                        Not connected
                                    </span>
                                )}

                                <a
                                    href="https://youtube.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-400"
                                >
                                    View channel
                                    <ExternalLink size={12} />
                                </a>

                            </div>

                        </div>

                        <div className="grid grid-cols-2 border-t border-zinc-200 sm:grid-cols-4 dark:border-zinc-800">
                            {channelStats.map((stat) => {
                                const Icon = stat.icon
                                return (
                                    <div
                                        key={stat.label}
                                        className="border-r border-zinc-200 p-4 last:border-r-0 dark:border-zinc-800"
                                    >
                                        <Icon size={15} className="text-zinc-400" />
                                        <p className="mt-3 text-xl font-semibold tracking-tight">
                                            {stat.value}
                                        </p>
                                        <p className="mt-0.5 text-xs text-zinc-500">
                                            {stat.label}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>

                    </section>


                    {/* PROFILE */}

                    <EditorSection number="01" title="Channel Profile">

                        <div className="grid gap-4 sm:grid-cols-2">

                            <Field label="Channel Name">
                                <input
                                    value={channelName}
                                    onChange={(e) => setChannelName(e.target.value)}
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="Handle">
                                <input
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    className={inputClass}
                                />
                            </Field>

                        </div>

                        <div className="mt-4">
                            <Field label="Channel Description">
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`${inputClass} resize-none leading-6`}
                                />
                            </Field>
                            <p className="mt-1 text-right text-[11px] text-zinc-400">
                                {description.length}/1000
                            </p>
                        </div>

                    </EditorSection>


                    {/* LINKS */}

                    <EditorSection number="02" title="Social Links">

                        <div className="grid gap-4 sm:grid-cols-2">
                            {socialLinks.map((link) => (
                                <Field key={link.label} label={link.label}>
                                    <div className="relative">
                                        <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                        <input
                                            value={links[link.label]}
                                            onChange={(e) => setLinks({ ...links, [link.label]: e.target.value })}
                                            placeholder={link.placeholder}
                                            className={`${inputClass} pl-9`}
                                        />
                                    </div>
                                </Field>
                            ))}
                        </div>

                    </EditorSection>


                    {/* CHANNEL TRAILER */}

                    <EditorSection number="03" title="Channel Trailer">

                        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">

                            <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-zinc-900">
                                <Play size={16} className="text-white" fill="white" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium">
                                    The Truth Behind India&apos;s E20 Fuel
                                </p>
                                <p className="mt-1 text-[10px] text-zinc-500">
                                    Shown to non-subscribers
                                </p>
                            </div>

                            <button
                                type="button"
                                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                            >
                                Change
                            </button>

                        </div>

                    </EditorSection>


                    {/* SYNC */}

                    <EditorSection number="04" title="Sync Settings">

                        <div className="space-y-3">

                            <SettingRow
                                title="Automatic Sync"
                                description="Import new uploads from YouTube every hour"
                            >
                                <Toggle checked={autoSync} onChange={setAutoSync} />
                            </SettingRow>

                            <SettingRow
                                title="Import Shorts"
                                description="Include YouTube Shorts when syncing videos"
                            >
                                <Toggle checked={importShorts} onChange={setImportShorts} />
                            </SettingRow>

                        </div>

                        <p className="mt-4 flex items-center gap-2 text-[11px] text-zinc-500">
                            <CheckCircle2 size={13} className="text-green-600" />
                            Last synced 14 minutes ago
                        </p>

                    </EditorSection>


                    {/* CONNECTION */}

                    <EditorSection number="05" title="Connection">

                        <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">

                            <div>
                                <p className="text-sm font-medium">
                                    {connected ? "YouTube account connected" : "Connect your YouTube account"}
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {connected
                                        ? "Videos, stats and comments are pulled from the YouTube Data API."
                                        : "Connect to import videos, analytics and comments."}
                                </p>
                            </div>

                            {connected ? (
                                <button
                                    type="button"
                                    onClick={() => setConnected(false)}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-500 hover:border-red-500/30 hover:text-red-500 dark:border-zinc-800"
                                >
                                    <Unplug size={14} />
                                    Disconnect
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setConnected(true)}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                                >
                                    <Play size={14} />
                                    Connect YouTube
                                </button>
                            )}

                        </div>

                    </EditorSection>

                </div>

            </main>

        </div>
    )
}


/* =============================================================
   EDITOR SECTION
============================================================= */

function EditorSection({
    number,
    title,
    children,
}: {
    number: string
    title: string
    children: React.ReactNode
}) {

    return (
        <section className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">

            <div className="mb-5 flex items-center gap-3">

                <span className="text-[10px] font-semibold tracking-widest text-red-500">
                    {number}
                </span>

                <h2 className="text-sm font-semibold">
                    {title}
                </h2>

            </div>

            {children}

        </section>
    )
}


/* =============================================================
   FIELD
============================================================= */

function Field({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {

    return (
        <div className="space-y-2">

            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {label}
            </label>

            {children}

        </div>
    )
}


/* =============================================================
   SETTING ROW
============================================================= */

function SettingRow({
    title,
    description,
    children,
}: {
    title: string
    description: string
    children: React.ReactNode
}) {

    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">

            <div>
                <p className="text-sm font-medium">
                    {title}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                    {description}
                </p>
            </div>

            {children}

        </div>
    )
}


/* =============================================================
   TOGGLE
============================================================= */

function Toggle({
    checked,
    onChange,
}: {
    checked: boolean
    onChange: (value: boolean) => void
}) {

    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked
                ? "bg-red-600"
                : "bg-zinc-300 dark:bg-zinc-700"
                }`}
        >
            <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${checked
                    ? "left-[18px]"
                    : "left-0.5"
                    }`}
            />
        </button>
    )
}


const inputClass = `
    w-full
    rounded-lg
    border
    border-zinc-200
    bg-white
    px-3
    py-2.5
    text-sm
    outline-none
    focus:border-red-500
    focus:ring-2
    focus:ring-red-500/10
    dark:border-zinc-800
    dark:bg-zinc-900
`
