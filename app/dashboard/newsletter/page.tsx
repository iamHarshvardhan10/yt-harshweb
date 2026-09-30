"use client"

import * as React from "react"

import {
    Plus,
    Search,
    Mail,
    Users,
    MousePointerClick,
    Send,
    Eye,
    X,
    Clock3,
    FileText,
    Download,
    MoreHorizontal,
    UserMinus,
} from "lucide-react"


type CampaignStatus = "sent" | "scheduled" | "draft"


type Campaign = {
    id: number
    subject: string
    preview: string
    status: CampaignStatus
    date: string
    recipients: number
    openRate?: string
    clickRate?: string
}


type Subscriber = {
    email: string
    name: string
    joined: string
    source: string
}


const statusClass: Record<CampaignStatus, string> = {
    sent: "bg-green-500/10 text-green-600",
    scheduled: "bg-red-500/10 text-red-500",
    draft: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900",
}


const initialCampaigns: Campaign[] = [
    {
        id: 1,
        subject: "New investigation: The Truth Behind India's E20 Fuel",
        preview: "What the government roadmap doesn't tell you about your vehicle...",
        status: "sent",
        date: "Sep 08, 2026",
        recipients: 4218,
        openRate: "52.4%",
        clickRate: "18.1%",
    },
    {
        id: 2,
        subject: "Why Mumbai floods every monsoon — and who's responsible",
        preview: "A 1993 masterplan, a 25 mm/hr design limit, and 30 years of delays.",
        status: "sent",
        date: "Sep 03, 2026",
        recipients: 4102,
        openRate: "49.8%",
        clickRate: "15.6%",
    },
    {
        id: 3,
        subject: "Coming Friday: North Korea's Hidden Economy",
        preview: "Sanctions, crypto heists and the ships that go dark at sea.",
        status: "scheduled",
        date: "Oct 03, 2026",
        recipients: 4386,
    },
    {
        id: 4,
        subject: "Behind the scenes: how we research a story",
        preview: "Sources, verification and the documents we read so you don't have to.",
        status: "draft",
        date: "Sep 29, 2026",
        recipients: 0,
    },
]


const subscribers: Subscriber[] = [
    { email: "rahul.sharma@gmail.com", name: "Rahul Sharma", joined: "Sep 30, 2026", source: "Website" },
    { email: "priya.s@outlook.com", name: "Priya Singh", joined: "Sep 29, 2026", source: "YouTube description" },
    { email: "aman.verma@gmail.com", name: "Aman Verma", joined: "Sep 28, 2026", source: "Website" },
    { email: "neha.k@yahoo.com", name: "Neha Kulkarni", joined: "Sep 26, 2026", source: "Instagram" },
    { email: "vikram.r@gmail.com", name: "Vikram Rao", joined: "Sep 24, 2026", source: "Website" },
]


export default function NewsletterPage() {

    const [campaigns, setCampaigns] =
        React.useState<Campaign[]>(initialCampaigns)

    const [tab, setTab] =
        React.useState<"campaigns" | "subscribers">("campaigns")

    const [search, setSearch] =
        React.useState("")

    const [composing, setComposing] =
        React.useState(false)

    const [subject, setSubject] =
        React.useState("")

    const [body, setBody] =
        React.useState("")


    function saveCampaign(status: CampaignStatus) {

        if (!subject.trim()) return

        setCampaigns((current) => [
            {
                id: Date.now(),
                subject,
                preview: body.slice(0, 90),
                status,
                date: new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                }),
                recipients: status === "sent" ? 4386 : 0,
                openRate: status === "sent" ? "—" : undefined,
                clickRate: status === "sent" ? "—" : undefined,
            },
            ...current,
        ])

        setSubject("")
        setBody("")
        setComposing(false)
    }


    const filteredCampaigns = campaigns.filter((c) =>
        c.subject.toLowerCase().includes(search.toLowerCase())
    )

    const filteredSubscribers = subscribers.filter((s) =>
        (s.email + s.name).toLowerCase().includes(search.toLowerCase())
    )


    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                        Audience
                    </p>

                    <h1 className="text-lg font-semibold">
                        Newsletter
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={() => setComposing(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                    <Plus size={16} />
                    New Campaign
                </button>

            </header>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="min-h-[calc(100vh-64px)]">

                <div className="mx-auto max-w-7xl px-6 py-8">

                    {/* STATS */}

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard icon={<Users size={17} />} label="Subscribers" value="4,386" change="+284 this month" />
                        <StatCard icon={<Eye size={17} />} label="Avg. Open Rate" value="51.1%" change="+3.2%" />
                        <StatCard icon={<MousePointerClick size={17} />} label="Avg. Click Rate" value="16.9%" change="+1.8%" />
                        <StatCard icon={<UserMinus size={17} />} label="Unsubscribes" value="0.4%" change="Last 30 days" />
                    </div>


                    {/* TOOLBAR */}

                    <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
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
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">

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
                                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                                >
                                    <Download size={15} />
                                    Export
                                </button>
                            )}

                        </div>

                    </div>


                    {/* CAMPAIGNS */}

                    {tab === "campaigns" && (

                        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

                            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

                                {filteredCampaigns.map((c) => (

                                    <div
                                        key={c.id}
                                        className="grid gap-4 px-5 py-4 transition hover:bg-zinc-50 md:grid-cols-[minmax(0,1fr)_100px_110px_140px_40px] md:items-center dark:hover:bg-zinc-900/50"
                                    >

                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                                                {c.status === "draft" ? <FileText size={16} /> : <Mail size={16} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {c.subject}
                                                </p>
                                                <p className="mt-0.5 truncate text-xs text-zinc-500">
                                                    {c.preview}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <span className={`rounded-md px-2 py-1 text-[10px] font-medium capitalize ${statusClass[c.status]}`}>
                                                {c.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                            <Clock3 size={12} />
                                            {c.date}
                                        </div>

                                        <div className="text-xs">
                                            {c.status === "sent" ? (
                                                <div className="flex gap-4">
                                                    <div>
                                                        <p className="font-medium">{c.openRate}</p>
                                                        <p className="text-[10px] text-zinc-500">Opens</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{c.clickRate}</p>
                                                        <p className="text-[10px] text-zinc-500">Clicks</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400">—</span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            className="hidden rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 md:block dark:hover:bg-zinc-800 dark:hover:text-white"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>

                                    </div>

                                ))}

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
                                            <th className="px-5 py-3">Source</th>
                                            <th className="px-5 py-3">Joined</th>
                                            <th className="px-5 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                        {filteredSubscribers.map((s) => (
                                            <tr key={s.email} className="transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-900">
                                                            {s.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{s.name}</p>
                                                            <p className="text-xs text-zinc-500">{s.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-xs text-zinc-500">{s.source}</td>
                                                <td className="px-5 py-4 text-xs text-zinc-500">{s.joined}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <button type="button" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white">
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>

                    )}

                </div>

            </main>


            {/* =====================================================
                COMPOSE PANEL
            ===================================================== */}

            {composing && (

                <div className="fixed inset-0 z-50">

                    <button
                        type="button"
                        aria-label="Close"
                        onClick={() => setComposing(false)}
                        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
                    />

                    <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

                        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">

                            <div>
                                <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                                    Newsletter
                                </p>
                                <h2 className="mt-1 text-sm font-semibold">
                                    New Campaign
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setComposing(false)}
                                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white"
                            >
                                <X size={17} />
                            </button>

                        </div>


                        <div className="flex-1 space-y-5 overflow-y-auto p-5">

                            <div className="rounded-lg bg-zinc-50 px-3 py-2.5 text-xs text-zinc-500 dark:bg-zinc-900">
                                To: <span className="font-medium text-zinc-900 dark:text-white">All subscribers (4,386)</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Subject
                                </label>
                                <input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="New investigation: ..."
                                    className={inputClass}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Message
                                </label>
                                <textarea
                                    rows={14}
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Write your newsletter..."
                                    className={`${inputClass} resize-none leading-6`}
                                />
                            </div>

                        </div>


                        <div className="flex gap-2 border-t border-zinc-200 p-5 dark:border-zinc-800">

                            <button
                                type="button"
                                onClick={() => saveCampaign("draft")}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                            >
                                <FileText size={15} />
                                Save Draft
                            </button>

                            <button
                                type="button"
                                onClick={() => saveCampaign("sent")}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                            >
                                <Send size={15} />
                                Send Now
                            </button>

                        </div>

                    </aside>

                </div>

            )}

        </div>
    )
}


/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
    icon,
    label,
    value,
    change,
}: {
    icon: React.ReactNode
    label: string
    value: string
    change: string
}) {

    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">

            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500">
                    {label}
                </p>
                <div className="text-zinc-400">
                    {icon}
                </div>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight">
                {value}
            </p>

            <p className="mt-1 text-xs font-medium text-red-500">
                {change}
            </p>

        </div>
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
