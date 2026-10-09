"use client"

import * as React from "react"
import Image from "next/image"
import {
    BarChart3,
    Eye,
    ExternalLink,
    Heart,
    Lock,
    MessageCircle,
    Smartphone,
    Users,
    Video,
} from "lucide-react"

import type { YouTubeComments, YouTubeResult, YouTubeUpload, YouTubeUploads } from "@/lib/youtube"
import { compact, shortDate } from "@/lib/format"
import YouTubeSetup from "@/components/dashboard/YouTubeSetup"
import ColumnChart, { type Column } from "@/components/dashboard/community/ColumnChart"

const ranges = [
    { id: "28", label: "Last 28 days", days: 28 },
    { id: "90", label: "Last 90 days", days: 90 },
    { id: "365", label: "Last 365 days", days: 365 },
    { id: "all", label: "All time", days: null },
] as const

type RangeId = (typeof ranges)[number]["id"]

const full = new Intl.NumberFormat("en")
const percent = new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 })

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const slots = ["12–3 AM", "3–6 AM", "6–9 AM", "9 AM–12", "12–3 PM", "3–6 PM", "6–9 PM", "9 PM–12"]

/** Publish moment in IST (the audience is mostly in India) */
function istParts(iso: string) {
    const d = new Date(Date.parse(iso) + (5 * 60 + 30) * 60_000)
    return { weekday: d.getUTCDay(), hour: d.getUTCHours() }
}

const sum = (values: (number | null)[]) => values.reduce<number>((total, v) => total + (v ?? 0), 0)
const engagement = (items: YouTubeUpload[]) => {
    const views = sum(items.map((u) => u.views))
    return views ? (sum(items.map((u) => u.likes)) + sum(items.map((u) => u.comments))) / views : 0
}

/** Average views per upload for each bucket; null where nothing was published */
function averageBy(items: YouTubeUpload[], buckets: string[], bucketOf: (u: YouTubeUpload) => number): Column[] {
    return buckets.map((label, index) => {
        const inBucket = items.filter((u) => bucketOf(u) === index)
        return {
            label,
            value: inBucket.length ? sum(inBucket.map((u) => u.views)) / inBucket.length : null,
            detail: `${inBucket.length} upload${inBucket.length === 1 ? "" : "s"}`,
        }
    })
}


export default function AudienceInsights({
    uploads: result,
    comments,
}: {
    uploads: YouTubeResult<YouTubeUploads>
    comments: YouTubeComments | null
}) {
    const [rangeId, setRangeId] = React.useState<RangeId>("all")
    const [now] = React.useState(() => Date.now())

    if (result.status !== "ok") {
        return (
            <Shell>
                <YouTubeSetup
                    error={result.status === "error" ? result.message : null}
                    description="Channel and upload stats appear here once an API key is set."
                    className="rounded-xl"
                />
            </Shell>
        )
    }

    const { channel, uploads, truncated } = result.data
    const range = ranges.find((r) => r.id === rangeId)!
    const inRange = range.days === null
        ? uploads
        : uploads.filter((u) => now - Date.parse(u.publishedAt) <= range.days * 86_400_000)

    const videos = inRange.filter((u) => u.type === "video")
    const shorts = inRange.filter((u) => u.type === "short")
    const rangeViews = sum(inRange.map((u) => u.views))

    const byDay = averageBy(inRange, weekdays, (u) => istParts(u.publishedAt).weekday)
    const bySlot = averageBy(inRange, slots, (u) => Math.floor(istParts(u.publishedAt).hour / 3))
    const bestDay = bestOf(byDay)
    const bestSlot = bestOf(bySlot)

    const top = [...inRange].sort((a, b) => b.views - a.views).slice(0, 10)
    const fans = topCommenters(comments)

    const analyticsUrl = `https://studio.youtube.com/channel/${channel.id}/analytics/tab-overview/period-default`

    return (
        <Shell
            actions={
                <select
                    value={rangeId}
                    onChange={(e) => setRangeId(e.target.value as RangeId)}
                    aria-label="Uploads published in"
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                    {ranges.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                </select>
            }
        >
            {/* STATS */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat icon={Users} label="Subscribers" value={channel.subscribers === null ? "Hidden" : compact(channel.subscribers)} note="all time" />
                <Stat icon={Eye} label="Channel views" value={compact(channel.views)} note="all time" />
                <Stat icon={BarChart3} label="Views on uploads" value={compact(rangeViews)} note={`${inRange.length} uploads published · ${range.label.toLowerCase()}`} />
                <Stat icon={Heart} label="Engagement rate" value={percent.format(engagement(inRange))} note="(likes + comments) ÷ views" />
            </div>

            {inRange.length === 0 ? (
                <p className="mt-6 rounded-xl border border-zinc-200 bg-white px-5 py-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
                    Nothing published in this period. Try a longer range.
                </p>
            ) : (
                <>
                    {/* VIDEOS VS SHORTS */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <FormatCard icon={Video} title="Long videos" items={videos} />
                        <FormatCard icon={Smartphone} title="Shorts" items={shorts} />
                    </div>

                    {/* WHEN TO PUBLISH */}
                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <Panel title="Best day to publish" subtitle="Average views per upload, by the day it went live (IST)">
                            <ColumnChart columns={byDay} valueLabel="avg views" caption="Average views per upload by weekday" />
                            {bestDay && <Insight>{bestDay.label} uploads average {compact(bestDay.value!)} views — {bestDay.detail}.</Insight>}
                        </Panel>

                        <Panel title="Best time to publish" subtitle="Average views per upload, by the time it went live (IST)">
                            <ColumnChart columns={bySlot} valueLabel="avg views" caption="Average views per upload by time of day" />
                            {bestSlot && <Insight>Uploads at {bestSlot.label} average {compact(bestSlot.value!)} views — {bestSlot.detail}.</Insight>}
                        </Panel>
                    </div>
                    <p className="mt-2 text-[11px] text-zinc-500">
                        Based on {inRange.length} of your uploads. Older uploads have had longer to collect views, so treat small differences with care.
                    </p>

                    {/* TOP UPLOADS */}
                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                            <h2 className="font-semibold">What your audience watches most</h2>
                            <p className="mt-1 text-xs text-zinc-500">Top uploads published in this period</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Upload</th>
                                        <th className="px-5 py-3 font-medium">Published</th>
                                        <th className="px-5 py-3 text-right font-medium">Views</th>
                                        <th className="px-5 py-3 text-right font-medium">Likes</th>
                                        <th className="px-5 py-3 text-right font-medium">Comments</th>
                                        <th className="px-5 py-3 text-right font-medium">Engagement</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {top.map((upload, index) => (
                                        <tr key={upload.id} className="transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                            <td className="px-5 py-3">
                                                <a href={upload.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3">
                                                    <span className="w-5 text-[10px] font-semibold tracking-widest text-red-500">{String(index + 1).padStart(2, "0")}</span>
                                                    <span className="relative h-9 w-16 shrink-0 overflow-hidden rounded bg-zinc-900">
                                                        {upload.thumbnail && <Image src={upload.thumbnail} alt="" fill sizes="64px" className="object-cover" />}
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block max-w-[280px] truncate font-medium group-hover:text-red-500">{upload.title}</span>
                                                        <span className="text-[10px] text-zinc-500">{upload.type === "short" ? "Short" : "Video"}</span>
                                                    </span>
                                                </a>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3 text-xs text-zinc-500">{shortDate.format(new Date(upload.publishedAt))}</td>
                                            <td className="px-5 py-3 text-right font-medium tabular-nums">{full.format(upload.views)}</td>
                                            <td className="px-5 py-3 text-right tabular-nums text-zinc-500">{upload.likes === null ? "hidden" : full.format(upload.likes)}</td>
                                            <td className="px-5 py-3 text-right tabular-nums text-zinc-500">{upload.comments === null ? "off" : full.format(upload.comments)}</td>
                                            <td className="px-5 py-3 text-right tabular-nums text-zinc-500">{percent.format(engagement([upload]))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}

            {/* COMMUNITY + ANALYTICS NOTE */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
                <Panel
                    title="Your most active commenters"
                    subtitle={comments ? `Across your latest ${comments.threads.length} comments` : "Comments unavailable"}
                >
                    {fans.length === 0 ? (
                        <p className="text-xs text-zinc-500">No comments from viewers yet.</p>
                    ) : (
                        <ol className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                            {fans.map((fan, index) => (
                                <li key={fan.key} className="flex items-center gap-3">
                                    <span className="w-5 text-[10px] font-semibold tracking-widest text-red-500">{String(index + 1).padStart(2, "0")}</span>
                                    {fan.avatar ? (
                                        <Image src={fan.avatar} alt="" width={28} height={28} className="h-7 w-7 rounded-full" />
                                    ) : (
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-semibold dark:bg-zinc-900">
                                            {fan.name.replace(/^@/, "").charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                    <span className="min-w-0 flex-1">
                                        {fan.url ? (
                                            <a href={fan.url} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-medium hover:text-red-500">{fan.name}</a>
                                        ) : (
                                            <span className="block truncate text-sm font-medium">{fan.name}</span>
                                        )}
                                        <span className="text-[11px] text-zinc-500">
                                            <MessageCircle size={10} className="mr-1 inline" />
                                            {fan.count} comment{fan.count === 1 ? "" : "s"} · {compact(fan.likes)} likes
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ol>
                    )}
                </Panel>

                <section className="rounded-xl border border-dashed border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
                    <div className="flex items-center gap-2">
                        <Lock size={15} className="text-zinc-400" />
                        <h2 className="text-sm font-semibold">Demographics</h2>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                        Age, gender, countries, devices, traffic sources and watch time come from YouTube Analytics,
                        which needs you to sign in with the Google account that owns the channel. They&apos;re in YouTube Studio for now.
                    </p>
                    <a
                        href={analyticsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-400"
                    >
                        Open Studio Analytics
                        <ExternalLink size={12} />
                    </a>
                </section>
            </div>

            <p className="mt-6 text-[11px] text-zinc-500">
                Public YouTube data, refreshed every 10 minutes{truncated ? ` · covers your latest ${uploads.length} uploads` : ""}.
            </p>
        </Shell>
    )
}


function bestOf(columns: Column[]) {
    const withData = columns.filter((c) => c.value !== null)
    return withData.length < 2 ? null : withData.reduce((best, c) => (c.value! > best.value! ? c : best))
}

function topCommenters(comments: YouTubeComments | null) {
    const fans = new Map<string, { key: string; name: string; avatar: string | null; url: string | null; count: number; likes: number }>()
    for (const t of comments?.threads ?? []) {
        if (t.isOwner) continue
        const key = t.authorChannelUrl ?? t.author
        const fan = fans.get(key) ?? { key, name: t.author, avatar: t.authorAvatar, url: t.authorChannelUrl, count: 0, likes: 0 }
        fan.count += 1
        fan.likes += t.likes
        fans.set(key, fan)
    }
    return [...fans.values()].sort((a, b) => b.count - a.count || b.likes - a.likes).slice(0, 8)
}


/* =============================================================
   PIECES
============================================================= */

function Shell({ actions, children }: { actions?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">Community</p>
                    <h1 className="text-lg font-semibold">Audience</h1>
                </div>
                {actions}
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </div>
    )
}

function Stat({ icon: Icon, label, value, note }: { icon: React.ElementType; label: string; value: string; note: string }) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500">{label}</p>
                <Icon size={17} className="text-zinc-400" />
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{note}</p>
        </div>
    )
}

function FormatCard({ icon: Icon, title, items }: { icon: React.ElementType; title: string; items: YouTubeUpload[] }) {
    const views = sum(items.map((u) => u.views))
    const rows = [
        ["Uploads", full.format(items.length)],
        ["Total views", items.length ? compact(views) : "—"],
        ["Avg views per upload", items.length ? compact(views / items.length) : "—"],
        ["Engagement rate", items.length ? percent.format(engagement(items)) : "—"],
    ]

    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
                <Icon size={16} className="text-red-500" />
                <h2 className="font-semibold">{title}</h2>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4">
                {rows.map(([label, value]) => (
                    <div key={label}>
                        <dt className="text-[11px] text-zinc-500">{label}</dt>
                        <dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    )
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
            </div>
            <div className="p-5">{children}</div>
        </section>
    )
}

function Insight({ children }: { children: React.ReactNode }) {
    return (
        <p className="mt-5 rounded-lg bg-red-500/5 p-3 text-[11px] leading-5 text-zinc-600 dark:text-zinc-400">
            {children}
        </p>
    )
}
