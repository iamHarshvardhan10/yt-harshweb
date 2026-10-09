"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    AlertTriangle,
    CalendarClock,
    Check,
    Clock3,
    Download,
    ExternalLink,
    FileText,
    Loader2,
    Mail,
    MailCheck,
    Plus,
    Search,
    Send,
    Trash2,
    UserCheck,
    UserMinus,
    UserPlus,
    Users,
    X,
} from "lucide-react"
import type { Campaign, CampaignStatus, Subscriber, SubscriberStatus } from "@prisma/client"

import { api } from "@/components/dashboard/home/api"
import { inputClass, labelClass } from "@/components/dashboard/home/ui"
import { formatUpload, fromUploadInput, toUploadInput } from "@/lib/ideas/shared"
import {
    NEWSLETTER_TOPICS,
    campaignStatusLabels,
    excerpt,
    subscriberStatusLabels,
} from "@/lib/newsletter/shared"

type Reader = Omit<Subscriber, "token">
type MailStatus = { configured: boolean; testRecipients: string[] }

const campaignStatusClass: Record<CampaignStatus, string> = {
    DRAFT: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900",
    SCHEDULED: "bg-amber-500/10 text-amber-600",
    SENDING: "bg-blue-500/10 text-blue-600",
    SENT: "bg-green-500/10 text-green-600",
}

const subscriberStatusClass: Record<SubscriberStatus, string> = {
    ACTIVE: "bg-green-500/10 text-green-600",
    PENDING: "bg-amber-500/10 text-amber-600",
    UNSUBSCRIBED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900",
}

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })
const full = new Intl.NumberFormat("en")
const DAY = 86_400_000

/** Active readers a campaign with these topics goes to */
const audienceOf = (readers: Reader[], topics: string[]) =>
    readers.filter((r) => r.status === "ACTIVE" && (topics.length === 0 || r.topics.some((t) => topics.includes(t))))


export default function NewsletterManager({
    subscribers,
    campaigns,
    mail,
}: {
    subscribers: Reader[]
    campaigns: Campaign[]
    mail: MailStatus
}) {
    const router = useRouter()
    const [now] = React.useState(() => Date.now())

    const [tab, setTab] = React.useState<"campaigns" | "subscribers">("campaigns")
    const [search, setSearch] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<"ALL" | SubscriberStatus>("ALL")
    const [editing, setEditing] = React.useState<Campaign | "new" | null>(null)
    const [rowError, setRowError] = React.useState<string | null>(null)
    const [pending, startTransition] = React.useTransition()

    const active = subscribers.filter((s) => s.status === "ACTIVE")
    const stats = [
        { label: "Active subscribers", value: active.length, icon: Users, note: "confirmed and receiving" },
        { label: "New in 30 days", value: active.filter((s) => s.confirmedAt && now - s.confirmedAt.getTime() < 30 * DAY).length, icon: UserPlus, note: "confirmed recently" },
        { label: "Awaiting confirmation", value: subscribers.filter((s) => s.status === "PENDING").length, icon: Clock3, note: "haven't clicked the email link" },
        { label: "Unsubscribed in 30 days", value: subscribers.filter((s) => s.unsubscribedAt && now - s.unsubscribedAt.getTime() < 30 * DAY).length, icon: UserMinus, note: `${subscribers.filter((s) => s.status === "UNSUBSCRIBED").length} all time` },
    ]

    const query = search.trim().toLowerCase()
    const filteredCampaigns = campaigns.filter((c) => !query || `${c.subject} ${c.body}`.toLowerCase().includes(query))
    const filteredSubscribers = subscribers
        .filter((s) => statusFilter === "ALL" || s.status === statusFilter)
        .filter((s) => !query || `${s.email} ${s.name ?? ""}`.toLowerCase().includes(query))

    function mutate(request: () => Promise<unknown>) {
        setRowError(null)
        startTransition(async () => {
            try {
                await request()
                router.refresh()
            } catch (err) {
                setRowError(err instanceof Error ? err.message : "Something went wrong")
            }
        })
    }

    function setSubscriberStatus(reader: Reader, status: "ACTIVE" | "UNSUBSCRIBED") {
        mutate(() => api(`/api/newsletter/subscribers/${reader.id}`, { method: "PATCH", json: { status } }))
    }

    function deleteSubscriber(reader: Reader) {
        if (!window.confirm(`Delete ${reader.email} permanently? Use this when someone asks for their data to be removed.`)) return
        mutate(() => api(`/api/newsletter/subscribers/${reader.id}`, { method: "DELETE" }))
    }

    function exportCsv() {
        const cell = (value: string) => `"${value.replace(/"/g, '""')}"`
        const rows = [
            ["email", "name", "status", "topics", "source", "signed_up", "confirmed"],
            ...filteredSubscribers.map((s) => [
                s.email,
                s.name ?? "",
                s.status.toLowerCase(),
                s.topics.join("; "),
                s.source ?? "",
                s.createdAt.toISOString(),
                s.confirmedAt?.toISOString() ?? "",
            ]),
        ]
        const blob = new Blob([rows.map((row) => row.map(cell).join(",")).join("\n")], { type: "text/csv" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
    }

    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* HEADER */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">Audience</p>
                    <h1 className="text-lg font-semibold">Newsletter</h1>
                </div>

                <button
                    type="button"
                    onClick={() => setEditing("new")}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                    <Plus size={16} />
                    New Campaign
                </button>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">

                {!mail.configured && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs leading-5">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                        <p className="text-zinc-600 dark:text-zinc-400">
                            <span className="font-medium text-zinc-900 dark:text-white">Email isn&apos;t set up yet.</span>{" "}
                            Sign-ups are saved (and accepted without a confirmation email until then), but nothing can be sent.
                            Add <code>GMAIL_USER</code> and <code>GMAIL_APP_PASSWORD</code> to <code>.env</code> and restart the server.
                        </p>
                    </div>
                )}

                {/* STATS */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
                                    <Icon size={17} className="text-zinc-400" />
                                </div>
                                <p className="mt-4 text-2xl font-semibold tracking-tight">{full.format(stat.value)}</p>
                                <p className="mt-1 text-xs text-zinc-500">{stat.note}</p>
                            </div>
                        )
                    })}
                </div>

                {/* TOOLBAR */}
                <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-fit items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
                        {(["campaigns", "subscribers"] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTab(t)}
                                className={`rounded-md px-4 py-2 text-xs font-medium capitalize transition ${tab === t
                                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                    }`}
                            >
                                {t} <span className="opacity-60">{t === "campaigns" ? campaigns.length : subscribers.length}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {tab === "subscribers" && (
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                                className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                            >
                                <option value="ALL">All statuses</option>
                                {(Object.keys(subscriberStatusLabels) as SubscriberStatus[]).map((s) => (
                                    <option key={s} value={s}>{subscriberStatusLabels[s]}</option>
                                ))}
                            </select>
                        )}

                        <div className="relative w-full lg:w-72">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={`Search ${tab}...`}
                                className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-zinc-800 dark:bg-zinc-950"
                            />
                        </div>

                        {tab === "subscribers" && (
                            <button
                                type="button"
                                onClick={exportCsv}
                                disabled={filteredSubscribers.length === 0}
                                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                            >
                                <Download size={15} />
                                Export CSV
                            </button>
                        )}
                    </div>
                </div>

                {(pending || rowError) && (
                    <p className={`mt-3 text-xs ${rowError ? "text-red-500" : "text-zinc-500"}`}>{rowError ?? "Saving…"}</p>
                )}

                {/* CAMPAIGNS */}
                {tab === "campaigns" && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filteredCampaigns.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setEditing(c)}
                                    className="grid w-full gap-4 px-5 py-4 text-left transition hover:bg-zinc-50 md:grid-cols-[minmax(0,1fr)_100px_170px_140px] md:items-center dark:hover:bg-zinc-900/50"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                                            {c.status === "SENT" ? <MailCheck size={16} /> : c.status === "SCHEDULED" ? <CalendarClock size={16} /> : <FileText size={16} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{c.subject}</p>
                                            <p className="mt-0.5 truncate text-xs text-zinc-500">{c.preview || excerpt(c.body, 90)}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <span className={`rounded-md px-2 py-1 text-[10px] font-medium ${campaignStatusClass[c.status]}`}>
                                            {campaignStatusLabels[c.status]}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                        <Clock3 size={12} />
                                        {c.status === "SENT" && c.sentAt
                                            ? `Sent ${dateFormat.format(c.sentAt)}`
                                            : c.status === "SCHEDULED" && c.scheduledAt
                                                ? formatUpload(c.scheduledAt)
                                                : `Created ${dateFormat.format(c.createdAt)}`}
                                    </div>

                                    <div className="text-xs">
                                        {c.status === "SENT" ? (
                                            <span>
                                                <span className="font-medium">{full.format(c.recipientCount)}</span>
                                                <span className="text-zinc-500"> delivered</span>
                                                {c.failedCount > 0 && <span className="text-red-500"> · {c.failedCount} failed</span>}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-500">
                                                {full.format(audienceOf(subscribers, c.topics).length)} readers
                                                {c.topics.length > 0 && " (topics)"}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}

                            {filteredCampaigns.length === 0 && (
                                <div className="px-6 py-16 text-center">
                                    <Mail size={28} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                                    <p className="mt-3 text-sm font-medium">{campaigns.length ? "No campaigns found" : "No campaigns yet"}</p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {campaigns.length ? "Try another search." : "Write your first issue with New Campaign."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SUBSCRIBERS */}
                {tab === "subscribers" && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-zinc-200 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-5 py-3">Subscriber</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Topics</th>
                                        <th className="px-5 py-3">Signed up</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {filteredSubscribers.map((s) => (
                                        <tr key={s.id} className="transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-900">
                                                        {(s.name || s.email).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">{s.name || s.email}</p>
                                                        {s.name && <p className="truncate text-xs text-zinc-500">{s.email}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`rounded-md px-2 py-1 text-[10px] font-medium ${subscriberStatusClass[s.status]}`}>
                                                    {subscriberStatusLabels[s.status]}
                                                </span>
                                            </td>
                                            <td className="max-w-[220px] px-5 py-4 text-xs text-zinc-500">{s.topics.join(", ") || "—"}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-xs text-zinc-500">
                                                {dateFormat.format(s.createdAt)}
                                                {s.source && <span className="block text-[10px] text-zinc-400">via {s.source}</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-1">
                                                    {s.status !== "ACTIVE" && (
                                                        <RowAction label="Mark as active (confirmed)" onClick={() => setSubscriberStatus(s, "ACTIVE")}>
                                                            <UserCheck size={15} />
                                                        </RowAction>
                                                    )}
                                                    {s.status !== "UNSUBSCRIBED" && (
                                                        <RowAction label="Unsubscribe" onClick={() => setSubscriberStatus(s, "UNSUBSCRIBED")}>
                                                            <UserMinus size={15} />
                                                        </RowAction>
                                                    )}
                                                    <RowAction label="Delete permanently" danger onClick={() => deleteSubscriber(s)}>
                                                        <Trash2 size={15} />
                                                    </RowAction>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredSubscribers.length === 0 && (
                                <div className="px-6 py-16 text-center">
                                    <Users size={28} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                                    <p className="mt-3 text-sm font-medium">{subscribers.length ? "No subscribers found" : "No subscribers yet"}</p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {subscribers.length ? "Try another filter or search." : "Sign-ups from the website's /newsletter page appear here."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {editing && (
                <CampaignDrawer
                    key={editing === "new" ? "new" : editing.id}
                    campaign={editing === "new" ? null : editing}
                    subscribers={subscribers}
                    mail={mail}
                    onClose={() => setEditing(null)}
                    onChanged={() => router.refresh()}
                />
            )}
        </div>
    )
}


function RowAction({ label, danger, onClick, children }: { label: string; danger?: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 ${danger ? "hover:text-red-500" : "hover:text-zinc-900 dark:hover:text-white"}`}
        >
            {children}
        </button>
    )
}


/* =============================================================
   CAMPAIGN DRAWER
============================================================= */

type Draft = {
    subject: string
    preview: string
    body: string
    topics: string[]
    scheduledAt: string // IST datetime-local
}

function CampaignDrawer({
    campaign,
    subscribers,
    mail,
    onClose,
    onChanged,
}: {
    campaign: Campaign | null
    subscribers: Reader[]
    mail: MailStatus
    onClose: () => void
    onChanged: () => void
}) {
    const [current, setCurrent] = React.useState(campaign)
    const [draft, setDraft] = React.useState<Draft>({
        subject: campaign?.subject ?? "",
        preview: campaign?.preview ?? "",
        body: campaign?.body ?? "",
        topics: campaign?.topics ?? [],
        scheduledAt: toUploadInput(campaign?.scheduledAt),
    })
    const [busy, setBusy] = React.useState<string | null>(null)
    const [message, setMessage] = React.useState<{ ok: boolean; text: string } | null>(null)

    const locked = current?.status === "SENT" || current?.status === "SENDING"
    const audience = audienceOf(subscribers, draft.topics).length
    const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

    async function run(label: string, fn: () => Promise<string | void>) {
        setBusy(label)
        setMessage(null)
        try {
            const text = await fn()
            if (text) setMessage({ ok: true, text })
            onChanged()
        } catch (err) {
            setMessage({ ok: false, text: err instanceof Error ? err.message : "Something went wrong" })
        } finally {
            setBusy(null)
        }
    }

    /** Creates or updates the campaign, returning its id */
    async function save(status: "DRAFT" | "SCHEDULED") {
        if (!draft.subject.trim() || !draft.body.trim()) throw new Error("Add a subject and a message first")

        const json = {
            subject: draft.subject,
            preview: draft.preview,
            body: draft.body,
            topics: draft.topics,
            status,
            scheduledAt: status === "SCHEDULED" ? fromUploadInput(draft.scheduledAt) : null,
        }
        const { item } = current
            ? await api<{ item: Campaign }>(`/api/newsletter/campaigns/${current.id}`, { method: "PATCH", json })
            : await api<{ item: Campaign }>("/api/newsletter/campaigns", { method: "POST", json })

        setCurrent({ ...item, scheduledAt: item.scheduledAt ? new Date(item.scheduledAt) : null } as Campaign)
        return item.id
    }

    const saveDraft = () => run("draft", async () => {
        await save("DRAFT")
        return "Draft saved"
    })

    const schedule = () => run("schedule", async () => {
        if (!draft.scheduledAt) throw new Error("Pick a date and time to schedule it")
        await save("SCHEDULED")
        return `Scheduled for ${formatUpload(fromUploadInput(draft.scheduledAt)!)} IST — the hourly job sends it`
    })

    const sendTest = () => run("test", async () => {
        const id = await save(current?.status === "SCHEDULED" ? "SCHEDULED" : "DRAFT")
        await api(`/api/newsletter/campaigns/${id}/send`, { method: "POST", json: { mode: "test" } })
        return `Test sent to ${mail.testRecipients.join(", ")}`
    })

    const sendNow = () => run("send", async () => {
        if (!window.confirm(`Send "${draft.subject}" to ${audience} reader${audience === 1 ? "" : "s"} now? This can't be undone.`)) return
        const id = await save("DRAFT")
        const result = await api<{ sent: number; failed: number; error?: string }>(`/api/newsletter/campaigns/${id}/send`, {
            method: "POST",
            json: { mode: "now" },
        })
        setCurrent((c) => (c ? { ...c, status: "SENT", recipientCount: result.sent, failedCount: result.failed, sentAt: new Date() } : c))
        return `Sent to ${result.sent} reader${result.sent === 1 ? "" : "s"}${result.failed ? ` · ${result.failed} failed (${result.error})` : ""}`
    })

    const toggleWebsite = () => run("website", async () => {
        if (!current) return
        const { item } = await api<{ item: Campaign }>(`/api/newsletter/campaigns/${current.id}`, {
            method: "PATCH",
            json: { showOnWebsite: !current.showOnWebsite },
        })
        setCurrent((c) => (c ? { ...c, showOnWebsite: item.showOnWebsite } : c))
    })

    const remove = () => run("delete", async () => {
        if (!current || !window.confirm(`Delete "${current.subject}"?`)) return
        await api(`/api/newsletter/campaigns/${current.id}`, { method: "DELETE" })
        onClose()
    })

    return (
        <div className="fixed inset-0 z-50">
            <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm" />

            <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-red-500">Newsletter</p>
                        <h2 className="mt-1 text-sm font-semibold">
                            {!current ? "New Campaign" : locked ? "Sent Campaign" : "Edit Campaign"}
                        </h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white">
                        <X size={17} />
                    </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-5">
                    {locked && current ? (
                        <>
                            <div className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
                                <p className="font-medium">{current.subject}</p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {current.status === "SENDING"
                                        ? "Sending now…"
                                        : `Sent ${current.sentAt ? dateFormat.format(current.sentAt) : ""} to ${full.format(current.recipientCount)} readers`}
                                    {current.failedCount > 0 && <span className="text-red-500"> · {current.failedCount} failed</span>}
                                </p>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                                <div>
                                    <p className="text-sm font-medium">Show on website</p>
                                    <p className="mt-1 text-xs text-zinc-500">List it under Recent issues on /newsletter</p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={current.showOnWebsite}
                                    disabled={busy !== null}
                                    onClick={toggleWebsite}
                                    className={`relative h-5 w-9 shrink-0 rounded-full transition disabled:opacity-50 ${current.showOnWebsite ? "bg-red-600" : "bg-zinc-300 dark:bg-zinc-700"}`}
                                >
                                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${current.showOnWebsite ? "left-4.5" : "left-0.5"}`} />
                                </button>
                            </div>

                            {current.showOnWebsite && current.status === "SENT" && (
                                <a
                                    href={`/newsletter/issues/${current.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-400"
                                >
                                    View on website <ExternalLink size={12} />
                                </a>
                            )}

                            <div className="whitespace-pre-line rounded-lg bg-zinc-50 p-4 text-sm leading-6 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                                {current.body}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <p className={labelClass}>Send to</p>
                                <div className="flex flex-wrap gap-1.5">
                                    <TopicChip active={draft.topics.length === 0} onClick={() => set("topics", [])}>
                                        Everyone
                                    </TopicChip>
                                    {NEWSLETTER_TOPICS.map((topic) => (
                                        <TopicChip
                                            key={topic}
                                            active={draft.topics.includes(topic)}
                                            onClick={() =>
                                                set("topics", draft.topics.includes(topic) ? draft.topics.filter((t) => t !== topic) : [...draft.topics, topic])
                                            }
                                        >
                                            {topic}
                                        </TopicChip>
                                    ))}
                                </div>
                                <p className="text-[11px] text-zinc-500">
                                    {full.format(audience)} active reader{audience === 1 ? "" : "s"}
                                    {draft.topics.length > 0 && " who picked any of these topics"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className={labelClass} htmlFor="campaign-subject">Subject</label>
                                <input id="campaign-subject" value={draft.subject} onChange={(e) => set("subject", e.target.value)} maxLength={200} placeholder="New investigation: ..." className={inputClass} />
                            </div>

                            <div className="space-y-2">
                                <label className={labelClass} htmlFor="campaign-preview">Preview text <span className="text-zinc-400">(optional)</span></label>
                                <input id="campaign-preview" value={draft.preview} onChange={(e) => set("preview", e.target.value)} maxLength={200} placeholder="The line shown after the subject in the inbox" className={inputClass} />
                            </div>

                            <div className="space-y-2">
                                <label className={labelClass} htmlFor="campaign-body">Message</label>
                                <textarea
                                    id="campaign-body"
                                    rows={14}
                                    value={draft.body}
                                    onChange={(e) => set("body", e.target.value)}
                                    placeholder={"Write your newsletter...\n\nLeave a blank line between paragraphs. Links like https://… become clickable."}
                                    className={`${inputClass} resize-y leading-6`}
                                />
                                <p className="text-[11px] text-zinc-500">An unsubscribe link and a &ldquo;view in browser&rdquo; link are added to every email.</p>
                            </div>

                            <div className="space-y-2">
                                <label className={labelClass} htmlFor="campaign-schedule">Schedule for later (IST) <span className="text-zinc-400">(optional)</span></label>
                                <input id="campaign-schedule" type="datetime-local" value={draft.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} className={inputClass} />
                                {current?.status === "SCHEDULED" && current.scheduledAt && (
                                    <p className="text-[11px] text-amber-600">Scheduled for {formatUpload(current.scheduledAt)} IST. Save as draft to unschedule.</p>
                                )}
                            </div>
                        </>
                    )}

                    {message && (
                        <p className={`rounded-lg px-3 py-2 text-xs ${message.ok ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-600"}`}>
                            {message.text}
                        </p>
                    )}
                </div>

                <div className="space-y-2 border-t border-zinc-200 p-5 dark:border-zinc-800">
                    {!locked && (
                        <>
                            <div className="grid grid-cols-3 gap-2">
                                <FooterButton onClick={saveDraft} busy={busy === "draft"} disabled={busy !== null} icon={FileText}>Save draft</FooterButton>
                                <FooterButton onClick={sendTest} busy={busy === "test"} disabled={busy !== null || !mail.configured} icon={Mail}>Send test</FooterButton>
                                <FooterButton onClick={schedule} busy={busy === "schedule"} disabled={busy !== null || !draft.scheduledAt} icon={CalendarClock}>Schedule</FooterButton>
                            </div>
                            <button
                                type="button"
                                onClick={sendNow}
                                disabled={busy !== null || !mail.configured || audience === 0}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {busy === "send" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                {busy === "send" ? "Sending…" : `Send now to ${full.format(audience)} reader${audience === 1 ? "" : "s"}`}
                            </button>
                        </>
                    )}

                    {current && current.status !== "SENDING" && (
                        <button
                            type="button"
                            onClick={remove}
                            disabled={busy !== null}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-500 hover:border-red-500/30 hover:text-red-500 disabled:opacity-50 dark:border-zinc-800"
                        >
                            <Trash2 size={14} />
                            Delete campaign
                        </button>
                    )}
                </div>
            </aside>
        </div>
    )
}

function TopicChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${active
                ? "border-red-500 bg-red-500/5 text-red-500"
                : "border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                }`}
        >
            {active && <Check size={10} className="mr-1 inline" />}
            {children}
        </button>
    )
}

function FooterButton({
    onClick,
    busy,
    disabled,
    icon: Icon,
    children,
}: {
    onClick: () => void
    busy: boolean
    disabled: boolean
    icon: React.ElementType
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-2 py-2.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
            {children}
        </button>
    )
}
