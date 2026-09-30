"use client"

import * as React from "react"

import {
    Search,
    MessageCircle,
    Reply,
    Heart,
    Flag,
    Pin,
    Trash2,
    Send,
    Inbox,
    CheckCircle2,
    HelpCircle,
    RefreshCw,
} from "lucide-react"


type Filter = "all" | "unreplied" | "questions" | "flagged"


type Comment = {
    id: number
    user: string
    comment: string
    video: string
    time: string
    likes: number
    replied: boolean
    reply?: string
    isQuestion: boolean
    flagged: boolean
    pinned: boolean
}


const initialComments: Comment[] = [
    {
        id: 1,
        user: "Rahul Sharma",
        comment: "This explained the E20 issue really well. Would love a follow-up on mileage impact for older bikes.",
        video: "The Truth Behind India's E20 Fuel",
        time: "12 min ago",
        likes: 48,
        replied: false,
        isQuestion: false,
        flagged: false,
        pinned: false,
    },
    {
        id: 2,
        user: "Aman Verma",
        comment: "Can you make a video about EV battery recycling? Nobody talks about where the old batteries go.",
        video: "Why Mumbai Floods Every Monsoon",
        time: "38 min ago",
        likes: 112,
        replied: false,
        isQuestion: true,
        flagged: false,
        pinned: false,
    },
    {
        id: 3,
        user: "Priya Singh",
        comment: "The data sources were very helpful. Where can I find the full CAG report you referenced?",
        video: "Can India Handle Another Himalayan Flood?",
        time: "1 hr ago",
        likes: 23,
        replied: true,
        reply: "Thanks Priya! The link is in the description under Sources.",
        isQuestion: true,
        flagged: false,
        pinned: true,
    },
    {
        id: 4,
        user: "spam_account_991",
        comment: "Earn ₹50,000 daily from home!!! Click the link in my profile",
        video: "Why Paper Leaks Keep Happening in India",
        time: "2 hrs ago",
        likes: 0,
        replied: false,
        isQuestion: false,
        flagged: true,
        pinned: false,
    },
    {
        id: 5,
        user: "Neha Kulkarni",
        comment: "I live in Andheri and this is exactly what happens every year. Thank you for covering it properly.",
        video: "Why Mumbai Floods Every Monsoon",
        time: "5 hrs ago",
        likes: 76,
        replied: false,
        isQuestion: false,
        flagged: false,
        pinned: false,
    },
]


export default function CommentsPage() {

    const [comments, setComments] =
        React.useState<Comment[]>(initialComments)

    const [filter, setFilter] =
        React.useState<Filter>("all")

    const [search, setSearch] =
        React.useState("")

    const [replyingTo, setReplyingTo] =
        React.useState<number | null>(null)

    const [replyText, setReplyText] =
        React.useState("")


    const counts = {
        all: comments.length,
        unreplied: comments.filter((c) => !c.replied && !c.flagged).length,
        questions: comments.filter((c) => c.isQuestion).length,
        flagged: comments.filter((c) => c.flagged).length,
    }


    const filtered = comments
        .filter((c) => {
            if (filter === "unreplied") return !c.replied && !c.flagged
            if (filter === "questions") return c.isQuestion
            if (filter === "flagged") return c.flagged
            return true
        })
        .filter((c) =>
            (c.comment + c.user + c.video)
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .sort((a, b) => Number(b.pinned) - Number(a.pinned))


    function updateComment(id: number, updates: Partial<Comment>) {
        setComments((current) =>
            current.map((c) => c.id === id ? { ...c, ...updates } : c)
        )
    }


    function sendReply(id: number) {
        if (!replyText.trim()) return
        updateComment(id, { replied: true, reply: replyText })
        setReplyText("")
        setReplyingTo(null)
    }


    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                        Community
                    </p>

                    <h1 className="text-lg font-semibold">
                        Comments
                    </h1>
                </div>

                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                    <RefreshCw size={15} />
                    Refresh
                </button>

            </header>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="min-h-[calc(100vh-64px)]">

                <div className="mx-auto max-w-5xl px-6 py-8">

                    {/* STATS */}

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard icon={<MessageCircle size={17} />} label="Total Comments" value={counts.all} />
                        <StatCard icon={<Inbox size={17} />} label="Awaiting Reply" value={counts.unreplied} />
                        <StatCard icon={<HelpCircle size={17} />} label="Questions" value={counts.questions} />
                        <StatCard icon={<Flag size={17} />} label="Flagged" value={counts.flagged} />
                    </div>


                    {/* TOOLBAR */}

                    <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
                            {(["all", "unreplied", "questions", "flagged"] as Filter[]).map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setFilter(f)}
                                    className={`whitespace-nowrap rounded-md px-4 py-2 text-xs font-medium capitalize transition ${filter === f
                                        ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                        }`}
                                >
                                    {f} ({counts[f]})
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full lg:w-72">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search comments..."
                                className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-zinc-800 dark:bg-zinc-950"
                            />
                        </div>

                    </div>


                    {/* LIST */}

                    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

                            {filtered.map((c) => (

                                <div key={c.id} className="px-5 py-5">

                                    <div className="flex items-start gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-900">
                                            {c.user.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">

                                            <div className="flex flex-wrap items-center gap-2">

                                                <p className="text-sm font-medium">
                                                    {c.user}
                                                </p>

                                                <span className="text-[10px] text-zinc-400">
                                                    {c.time}
                                                </span>

                                                {c.pinned && (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-500">
                                                        <Pin size={10} /> Pinned
                                                    </span>
                                                )}

                                                {c.isQuestion && (
                                                    <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                                                        Question
                                                    </span>
                                                )}

                                                {c.flagged && (
                                                    <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                                                        Flagged
                                                    </span>
                                                )}

                                                {c.replied && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600">
                                                        <CheckCircle2 size={10} /> Replied
                                                    </span>
                                                )}

                                            </div>

                                            <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                                                {c.comment}
                                            </p>

                                            <p className="mt-2 truncate text-[11px] text-red-500">
                                                on {c.video}
                                            </p>


                                            {c.reply && (
                                                <div className="mt-3 rounded-lg border-l-2 border-red-500 bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                                                    <p className="text-[10px] font-semibold text-zinc-500">
                                                        Your reply
                                                    </p>
                                                    <p className="mt-1 text-xs leading-5">
                                                        {c.reply}
                                                    </p>
                                                </div>
                                            )}


                                            {/* ACTIONS */}

                                            <div className="mt-3 flex flex-wrap items-center gap-1">

                                                <ActionButton
                                                    onClick={() => {
                                                        setReplyingTo(replyingTo === c.id ? null : c.id)
                                                        setReplyText("")
                                                    }}
                                                >
                                                    <Reply size={13} /> Reply
                                                </ActionButton>

                                                <ActionButton>
                                                    <Heart size={13} /> {c.likes}
                                                </ActionButton>

                                                <ActionButton
                                                    active={c.pinned}
                                                    onClick={() => updateComment(c.id, { pinned: !c.pinned })}
                                                >
                                                    <Pin size={13} /> {c.pinned ? "Unpin" : "Pin"}
                                                </ActionButton>

                                                <ActionButton
                                                    active={c.flagged}
                                                    onClick={() => updateComment(c.id, { flagged: !c.flagged })}
                                                >
                                                    <Flag size={13} /> {c.flagged ? "Unflag" : "Flag"}
                                                </ActionButton>

                                                <ActionButton
                                                    onClick={() => setComments((current) => current.filter((x) => x.id !== c.id))}
                                                >
                                                    <Trash2 size={13} /> Delete
                                                </ActionButton>

                                            </div>


                                            {replyingTo === c.id && (
                                                <div className="mt-3 flex items-end gap-2">
                                                    <textarea
                                                        rows={2}
                                                        autoFocus
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder={`Reply to ${c.user}...`}
                                                        className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-zinc-800 dark:bg-zinc-900"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => sendReply(c.id)}
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700"
                                                    >
                                                        <Send size={15} />
                                                    </button>
                                                </div>
                                            )}

                                        </div>

                                    </div>

                                </div>

                            ))}

                            {filtered.length === 0 && (
                                <div className="px-6 py-16 text-center">
                                    <MessageCircle size={28} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                                    <p className="mt-3 text-sm font-medium">
                                        No comments found
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Try another filter or search.
                                    </p>
                                </div>
                            )}

                        </div>

                    </div>

                </div>

            </main>

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
}: {
    icon: React.ReactNode
    label: string
    value: number | string
}) {

    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">

            <div className="text-zinc-400">
                {icon}
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight">
                {value}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
                {label}
            </p>

        </div>
    )
}


/* =============================================================
   ACTION BUTTON
============================================================= */

function ActionButton({
    active = false,
    onClick,
    children,
}: {
    active?: boolean
    onClick?: () => void
    children: React.ReactNode
}) {

    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition ${active
                ? "text-red-500"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white"
                }`}
        >
            {children}
        </button>
    )
}
