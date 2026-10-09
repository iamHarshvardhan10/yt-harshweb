"use client"

import * as React from "react"
import Image from "next/image"
import {
    ArrowUpDown,
    CheckCircle2,
    ExternalLink,
    HelpCircle,
    Inbox,
    MessageCircle,
    MessagesSquare,
    RefreshCw,
    Reply,
    Search,
    ThumbsUp,
} from "lucide-react"

import type { YouTubeComments, YouTubeResult, YouTubeThread } from "@/lib/youtube"
import { compact, relativeTime } from "@/lib/format"
import YouTubeSetup from "@/components/dashboard/YouTubeSetup"

type Filter = "all" | "unreplied" | "questions" | "replied"
type Sort = "newest" | "liked"

const PAGE = 40

const filterLabels: Record<Filter, string> = {
    all: "All",
    unreplied: "Awaiting reply",
    questions: "Questions",
    replied: "Replied",
}

const isQuestion = (t: YouTubeThread) => !t.isOwner && t.text.includes("?")
const needsReply = (t: YouTubeThread) => !t.isOwner && !t.ownerReply

const matches: Record<Filter, (t: YouTubeThread) => boolean> = {
    all: () => true,
    unreplied: needsReply,
    questions: isQuestion,
    replied: (t) => t.ownerReply !== null,
}


export default function CommentInbox({
    result,
    onRefresh,
}: {
    result: YouTubeResult<YouTubeComments>
    onRefresh: () => Promise<void>
}) {
    const [refreshing, startRefresh] = React.useTransition()

    const [filter, setFilter] = React.useState<Filter>("unreplied")
    const [video, setVideo] = React.useState("all")
    const [sort, setSort] = React.useState<Sort>("newest")
    const [search, setSearch] = React.useState("")
    const [shown, setShown] = React.useState(PAGE)

    const data = result.status === "ok" ? result.data : null
    const threads = data?.threads ?? []

    const counts = Object.fromEntries(
        (Object.keys(matches) as Filter[]).map((f) => [f, threads.filter(matches[f]).length])
    ) as Record<Filter, number>

    // Videos that have comments, most-commented first
    const perVideo = new Map<string, number>()
    for (const t of threads) perVideo.set(t.videoId, (perVideo.get(t.videoId) ?? 0) + 1)
    const videoOptions = [...perVideo].sort((a, b) => b[1] - a[1])

    const query = search.trim().toLowerCase()
    const filtered = threads
        .filter(matches[filter])
        .filter((t) => video === "all" || t.videoId === video)
        .filter((t) => !query || `${t.text} ${t.author}`.toLowerCase().includes(query))
    if (sort === "liked") filtered.sort((a, b) => b.likes - a.likes)

    const studioUrl = data ? `https://studio.youtube.com/channel/${data.channel.id}/comments/inbox` : "https://studio.youtube.com"

    function changeFilter(update: () => void) {
        update()
        setShown(PAGE)
    }

    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* HEADER */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">Community</p>
                    <h1 className="text-lg font-semibold">Comments</h1>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={studioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 sm:inline-flex dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    >
                        <ExternalLink size={15} />
                        YouTube Studio
                    </a>

                    <button
                        type="button"
                        onClick={() => startRefresh(onRefresh)}
                        disabled={refreshing || result.status === "unconfigured"}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    >
                        <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-8">
                {!data ? (
                    <YouTubeSetup
                        error={result.status === "error" ? result.message : null}
                        description="Your latest YouTube comments appear here once an API key is set."
                        className="rounded-xl"
                    />
                ) : (
                    <>
                        {/* STATS */}
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard icon={<MessageCircle size={17} />} label={data.truncated ? `Latest ${threads.length} comments` : "Comments"} value={threads.length} />
                            <StatCard icon={<Inbox size={17} />} label="Awaiting your reply" value={counts.unreplied} highlight={counts.unreplied > 0} />
                            <StatCard icon={<HelpCircle size={17} />} label="Questions" value={counts.questions} />
                            <StatCard icon={<CheckCircle2 size={17} />} label="You replied" value={counts.replied} />
                        </div>

                        {/* TOOLBAR */}
                        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex w-fit items-center gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
                                {(Object.keys(filterLabels) as Filter[]).map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => changeFilter(() => setFilter(f))}
                                        className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition ${filter === f
                                            ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                            }`}
                                    >
                                        {filterLabels[f]} <span className="opacity-60">{counts[f]}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full lg:w-64">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    value={search}
                                    onChange={(e) => changeFilter(() => setSearch(e.target.value))}
                                    placeholder="Search comments..."
                                    className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-zinc-800 dark:bg-zinc-950"
                                />
                            </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <select
                                value={video}
                                onChange={(e) => changeFilter(() => setVideo(e.target.value))}
                                className="w-full truncate rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-red-500 sm:max-w-md dark:border-zinc-800 dark:bg-zinc-950"
                            >
                                <option value="all">All videos</option>
                                {videoOptions.map(([id, count]) => (
                                    <option key={id} value={id}>
                                        {data.videos[id]?.title ?? id} ({count})
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={() => setSort(sort === "newest" ? "liked" : "newest")}
                                className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                            >
                                <ArrowUpDown size={14} />
                                {sort === "newest" ? "Newest first" : "Most liked"}
                            </button>
                        </div>

                        {/* LIST */}
                        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filtered.slice(0, shown).map((thread) => (
                                    <CommentRow key={thread.id} thread={thread} video={data.videos[thread.videoId]} />
                                ))}

                                {filtered.length === 0 && (
                                    <div className="px-6 py-16 text-center">
                                        <MessageCircle size={28} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                                        <p className="mt-3 text-sm font-medium">
                                            {filter === "unreplied" && !query && video === "all" ? "You're all caught up" : "No comments found"}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            {threads.length ? "Try another filter or search." : "Your videos don't have any public comments yet."}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {filtered.length > shown && (
                                <button
                                    type="button"
                                    onClick={() => setShown(shown + PAGE)}
                                    className="w-full border-t border-zinc-200 py-3 text-xs font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white"
                                >
                                    Show more ({filtered.length - shown} left)
                                </button>
                            )}
                        </div>

                        <p className="mt-4 text-[11px] leading-5 text-zinc-500">
                            {data.truncated ? `Showing your newest ${threads.length} comment threads. ` : ""}
                            Public comments only, refreshed every 10 minutes. Replying, hiding and held-for-review comments are in YouTube Studio.
                            &ldquo;Replied&rdquo; checks the first 5 replies of each thread.
                        </p>
                    </>
                )}
            </main>
        </div>
    )
}


function CommentRow({ thread, video }: { thread: YouTubeThread; video?: { title: string; url: string } }) {
    const commentUrl = `https://www.youtube.com/watch?v=${thread.videoId}&lc=${thread.id}`

    return (
        <article className="px-5 py-5">
            <div className="flex items-start gap-3">
                {thread.authorAvatar ? (
                    <Image src={thread.authorAvatar} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full" />
                ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-900">
                        {thread.author.replace(/^@/, "").charAt(0).toUpperCase()}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        {thread.authorChannelUrl ? (
                            <a href={thread.authorChannelUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-red-500">
                                {thread.author}
                            </a>
                        ) : (
                            <p className="text-sm font-medium">{thread.author}</p>
                        )}

                        <span className="text-[10px] text-zinc-400" title={new Date(thread.publishedAt).toLocaleString("en-IN")}>
                            {relativeTime(thread.publishedAt)}
                        </span>

                        {thread.isOwner && (
                            <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-500">You</span>
                        )}
                        {isQuestion(thread) && (
                            <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">Question</span>
                        )}
                        {thread.ownerReply && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600">
                                <CheckCircle2 size={10} /> Replied
                            </span>
                        )}
                    </div>

                    <p className="mt-2 whitespace-pre-line wrap-break-word text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                        {thread.text}
                    </p>

                    <a
                        href={video?.url ?? `https://www.youtube.com/watch?v=${thread.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block truncate text-[11px] text-red-500 hover:text-red-400"
                    >
                        on {video?.title ?? "a video"}
                    </a>

                    {thread.ownerReply && (
                        <div className="mt-3 rounded-lg border-l-2 border-red-500 bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                            <p className="text-[10px] font-semibold text-zinc-500">
                                Your reply · {relativeTime(thread.ownerReply.publishedAt)}
                            </p>
                            <p className="mt-1 whitespace-pre-line wrap-break-word text-xs leading-5">{thread.ownerReply.text}</p>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="mt-3 flex flex-wrap items-center gap-1 text-[11px] font-medium text-zinc-500">
                        {!thread.isOwner && (
                            <a
                                href={commentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white"
                            >
                                <Reply size={13} /> Reply on YouTube
                            </a>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-2 py-1">
                            <ThumbsUp size={13} /> {compact(thread.likes)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1">
                            <MessagesSquare size={13} /> {thread.replyCount} {thread.replyCount === 1 ? "reply" : "replies"}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    )
}


function StatCard({
    icon,
    label,
    value,
    highlight = false,
}: {
    icon: React.ReactNode
    label: string
    value: number
    highlight?: boolean
}) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className={highlight ? "text-red-500" : "text-zinc-400"}>{icon}</div>
            <p className="mt-4 text-2xl font-semibold tracking-tight">{compact(value)}</p>
            <p className="mt-1 text-xs text-zinc-500">{label}</p>
        </div>
    )
}
