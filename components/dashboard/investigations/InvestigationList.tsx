"use client"

import {
    CalendarDays,
    Check,
    ChevronDown,
    Clock3,
    Edit3,
    ExternalLink,
    FileText,
    FolderOpen,
    Languages,
    MoreHorizontal,
    Plus,
    Search,
    Star,
    Trash2,
    Video,
    X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import type { InvestigationStatus } from "@prisma/client"

import { api } from "@/components/dashboard/home/api"
import type { InvestigationWithDocuments } from "@/lib/investigations/queries"
import {
    LANGUAGES,
    languageLabels,
    statusLabels,
    youtubeThumbnail,
    youtubeWatchUrl,
} from "@/lib/investigations/shared"

type Tab = "all" | InvestigationStatus

export default function InvestigationList({
    items,
    videoTitles,
}: {
    items: InvestigationWithDocuments[]
    videoTitles: Record<string, string>
}) {
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [activeTab, setActiveTab] = useState<Tab>("all")
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("all")
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const categories = useMemo(
        () => [...new Set(items.map((item) => item.category))].sort(),
        [items]
    )

    const filtered = useMemo(() => {
        const query = search.toLowerCase().trim()

        return items.filter((item) => {
            const videoTitle = item.youtubeVideoId ? videoTitles[item.youtubeVideoId] ?? "" : ""

            const matchesTab = activeTab === "all" || item.status === activeTab
            const matchesCategory = category === "all" || item.category === category
            const matchesSearch =
                !query ||
                item.title.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                videoTitle.toLowerCase().includes(query) ||
                item.documents.some((doc) => doc.title?.toLowerCase().includes(query))

            return matchesTab && matchesSearch && matchesCategory
        })
    }, [items, videoTitles, activeTab, search, category])

    const stats = {
        total: items.length,
        published: items.filter((item) => item.status === "PUBLISHED").length,
        drafts: items.filter((item) => item.status === "DRAFT").length,
        bilingual: items.filter((item) => LANGUAGES.every((lang) => hasDocument(item, lang))).length,
    }

    /** Runs a change against the API, then re-renders the page with fresh data. */
    function mutate(request: () => Promise<unknown>) {
        setError(null)
        startTransition(async () => {
            try {
                await request()
                router.refresh()
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong")
            }
        })
    }

    function toggleFeatured(item: InvestigationWithDocuments) {
        mutate(() =>
            api(`/api/investigations/${item.id}`, { method: "PATCH", json: { featured: !item.featured } })
        )
    }

    function deleteInvestigation(item: InvestigationWithDocuments) {
        if (!window.confirm(`Delete "${item.title}" and its documents? This can't be undone.`)) return

        setSelectedId(null)
        mutate(() => api(`/api/investigations/${item.id}`, { method: "DELETE" }))
    }

    const selected = items.find((item) => item.id === selectedId) ?? null

    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                        Website
                    </p>

                    <h1 className="text-lg font-semibold">
                        Investigations
                    </h1>
                </div>

                <Link
                    href="/dashboard/investigations/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                    <Plus className="h-4 w-4" />
                    New Investigation
                </Link>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={<FolderOpen className="h-4.25 w-4.25" />} label="Total Investigations" value={stats.total} />
                    <StatCard icon={<Check className="h-4.25 w-4.25" />} label="Published" value={stats.published} />
                    <StatCard icon={<Clock3 className="h-4.25 w-4.25" />} label="Drafts" value={stats.drafts} />
                    <StatCard icon={<Languages className="h-4.25 w-4.25" />} label="English + Hindi docs" value={stats.bilingual} />
                </div>

                {/* Toolbar */}
                <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-fit items-center gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
                        <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")}>
                            All
                        </TabButton>
                        <TabButton active={activeTab === "PUBLISHED"} onClick={() => setActiveTab("PUBLISHED")}>
                            Published
                        </TabButton>
                        <TabButton active={activeTab === "DRAFT"} onClick={() => setActiveTab("DRAFT")}>
                            Drafts
                        </TabButton>
                        <TabButton active={activeTab === "ARCHIVED"} onClick={() => setActiveTab("ARCHIVED")}>
                            Archived
                        </TabButton>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search investigations..."
                                className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 sm:w-64 dark:border-zinc-800 dark:bg-zinc-950"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full appearance-none rounded-lg border border-zinc-200 bg-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-zinc-800 dark:bg-zinc-950"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>

                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                    <p className="text-zinc-500">
                        {filtered.length} investigations
                    </p>

                    {pending && <p className="text-zinc-500">Saving…</p>}
                    {error && <p className="text-red-500">{error}</p>}
                </div>

                {/* Table */}
                <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="hidden grid-cols-[minmax(280px,1.8fr)_1.2fr_110px_110px_110px_40px] gap-4 border-b border-zinc-200 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid dark:border-zinc-800">
                        <span>Investigation</span>
                        <span>Related Video</span>
                        <span>Documents</span>
                        <span>Date</span>
                        <span>Status</span>
                        <span />
                    </div>

                    {filtered.length === 0 ? (
                        <EmptyState hasItems={items.length > 0} />
                    ) : (
                        filtered.map((item) => (
                            <InvestigationRow
                                key={item.id}
                                item={item}
                                videoTitle={item.youtubeVideoId ? videoTitles[item.youtubeVideoId] : undefined}
                                onSelect={() => setSelectedId(item.id)}
                                onToggleFeatured={() => toggleFeatured(item)}
                                onDelete={() => deleteInvestigation(item)}
                            />
                        ))
                    )}
                </div>

                <p className="mt-4 text-[11px] text-zinc-500">
                    Only published investigations appear on the website. Showing {filtered.length} of {items.length}.
                </p>
            </main>

            {selected && (
                <InvestigationDrawer
                    investigation={selected}
                    videoTitle={selected.youtubeVideoId ? videoTitles[selected.youtubeVideoId] : undefined}
                    onClose={() => setSelectedId(null)}
                    onToggleFeatured={() => toggleFeatured(selected)}
                />
            )}
        </div>
    )
}

const hasDocument = (item: InvestigationWithDocuments, language: string) =>
    item.documents.some((doc) => doc.language === language)

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: number
}) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
                <div className="text-zinc-400">{icon}</div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">All time</span>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{label}</p>
        </div>
    )
}

function TabButton({
    children,
    active,
    onClick,
}: {
    children: React.ReactNode
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-md px-4 py-2 text-xs font-medium transition ${active
                ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
        >
            {children}
        </button>
    )
}

/** EN / HI chips — filled when that language's document is linked */
function DocumentChips({ item }: { item: InvestigationWithDocuments }) {
    return (
        <div className="flex items-center gap-1.5">
            {LANGUAGES.map((language) => {
                const doc = item.documents.find((d) => d.language === language)
                const className = `rounded px-1.5 py-0.5 text-[10px] font-semibold ${doc
                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                    : "bg-zinc-100 text-zinc-400 line-through dark:bg-zinc-900 dark:text-zinc-600"
                    }`

                return doc ? (
                    <a
                        key={language}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Open the ${languageLabels[language].name} document`}
                        className={`${className} hover:bg-red-500/20`}
                    >
                        {language}
                    </a>
                ) : (
                    <span key={language} title={`No ${languageLabels[language].name} document yet`} className={className}>
                        {language}
                    </span>
                )
            })}
        </div>
    )
}

function InvestigationRow({
    item,
    videoTitle,
    onSelect,
    onToggleFeatured,
    onDelete,
}: {
    item: InvestigationWithDocuments
    videoTitle?: string
    onSelect: () => void
    onToggleFeatured: () => void
    onDelete: () => void
}) {
    return (
        <div className="group grid gap-4 border-b border-zinc-200 px-5 py-4 transition last:border-b-0 hover:bg-zinc-50 lg:grid-cols-[minmax(280px,1.8fr)_1.2fr_110px_110px_110px_40px] lg:items-center dark:border-zinc-800 dark:hover:bg-zinc-900/50">
            {/* Investigation */}
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-11 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                    <FileText className="h-5 w-5 text-red-500" />
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onSelect}
                            className="truncate text-left text-sm font-medium hover:text-red-500"
                        >
                            {item.title}
                        </button>

                        {item.featured && (
                            <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
                        )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>/{item.slug}</span>
                    </div>
                </div>
            </div>

            {/* Related Video */}
            <div className="hidden min-w-0 lg:block">
                {item.youtubeVideoId ? (
                    <a
                        href={youtubeWatchUrl(item.youtubeVideoId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-red-500"
                    >
                        <Video className="h-3.5 w-3.5 shrink-0 text-red-500" />
                        <span className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                            {videoTitle ?? item.youtubeVideoId}
                        </span>
                    </a>
                ) : (
                    <span className="text-xs text-zinc-400">No video linked</span>
                )}
            </div>

            {/* Documents */}
            <DocumentChips item={item} />

            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-zinc-500">
                <CalendarDays className="h-3.5 w-3.5" />
                {item.publishedAt ? formatDate(item.publishedAt) : "—"}
            </div>

            {/* Status */}
            <div>
                <StatusBadge status={item.status} />
            </div>

            {/* Menu */}
            <div className="relative flex justify-end">
                <details className="relative">
                    <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                    </summary>

                    <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
                        <Link
                            href={`/dashboard/investigations/${item.id}`}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                        </Link>

                        {item.status === "PUBLISHED" && (
                            <a
                                href={`/investigations/${item.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View on website
                            </a>
                        )}

                        <button
                            type="button"
                            onClick={onToggleFeatured}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                        >
                            <Star className="h-3.5 w-3.5" />
                            {item.featured ? "Remove Featured" : "Make Featured"}
                        </button>

                        <button
                            type="button"
                            onClick={onDelete}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-red-500 hover:bg-red-500/10"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    </div>
                </details>
            </div>
        </div>
    )
}

export function StatusBadge({ status }: { status: InvestigationStatus }) {
    const styles: Record<InvestigationStatus, string> = {
        PUBLISHED: "bg-green-500/10 text-green-600 dark:text-green-400",
        DRAFT: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        ARCHIVED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900",
    }

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${styles[status]}`}>
            {statusLabels[status]}
        </span>
    )
}

function EmptyState({ hasItems }: { hasItems: boolean }) {
    return (
        <div className="px-6 py-16 text-center">
            <Search className="mx-auto h-7 w-7 text-zinc-300 dark:text-zinc-700" />

            <p className="mt-3 text-sm font-medium">
                {hasItems ? "No investigations found" : "No investigations yet"}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
                {hasItems
                    ? "Try changing your search or filters."
                    : "Create one to link a YouTube video with its English and Hindi documents."}
            </p>
        </div>
    )
}

function InvestigationDrawer({
    investigation,
    videoTitle,
    onClose,
    onToggleFeatured,
}: {
    investigation: InvestigationWithDocuments
    videoTitle?: string
    onClose: () => void
    onToggleFeatured: () => void
}) {
    const videoId = investigation.youtubeVideoId

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
                aria-label="Close drawer"
            />

            <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                            Investigation
                        </p>
                        <h2 className="mt-1 text-sm font-semibold">Details</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white"
                    >
                        <X className="h-4.25 w-4.25" />
                    </button>
                </div>

                <div className="space-y-6 p-5">
                    {/* Video */}
                    {videoId ? (
                        <a
                            href={youtubeWatchUrl(videoId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                        >
                            <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900">
                                <Image src={youtubeThumbnail(videoId)} alt="" fill sizes="448px" className="object-cover" />
                            </div>
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 group-hover:text-red-500">
                                <Video className="h-3.5 w-3.5 text-red-500" />
                                <span className="truncate">{videoTitle ?? videoId}</span>
                            </p>
                        </a>
                    ) : (
                        <div className="flex h-44 items-center justify-center rounded-xl bg-zinc-100 text-xs text-zinc-500 dark:bg-zinc-900">
                            No YouTube video linked
                        </div>
                    )}

                    <div>
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-semibold leading-6">{investigation.title}</h3>
                            <StatusBadge status={investigation.status} />
                        </div>

                        <p className="mt-2 text-sm leading-6 text-zinc-500">{investigation.summary}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <InfoBox label="Category" value={investigation.category} />
                        <InfoBox
                            label="Date"
                            value={investigation.publishedAt ? formatDate(investigation.publishedAt) : "Not set"}
                        />
                    </div>

                    {/* Documents */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Documents
                        </p>

                        <div className="space-y-2">
                            {LANGUAGES.map((language) => {
                                const doc = investigation.documents.find((d) => d.language === language)
                                const meta = [
                                    doc?.pages && `${doc.pages} pages`,
                                    doc?.readMinutes && `${doc.readMinutes} min read`,
                                ].filter(Boolean)

                                return (
                                    <div
                                        key={language}
                                        className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-[11px] font-semibold text-red-500">
                                            {language}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium" lang={languageLabels[language].htmlLang}>
                                                {doc ? doc.title ?? investigation.title : `No ${languageLabels[language].name} document`}
                                            </p>
                                            <p className="mt-0.5 text-xs text-zinc-500">
                                                {languageLabels[language].name}
                                                {meta.length > 0 && ` · ${meta.join(" · ")}`}
                                            </p>
                                        </div>

                                        {doc && (
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white"
                                                aria-label={`Open the ${languageLabels[language].name} document`}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onToggleFeatured}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                        >
                            <Star className={`h-4 w-4 ${investigation.featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                            {investigation.featured ? "Featured" : "Make featured"}
                        </button>

                        <Link
                            href={`/dashboard/investigations/${investigation.id}`}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                        >
                            <Edit3 className="h-4 w-4" />
                            Edit
                        </Link>
                    </div>
                </div>
            </aside>
        </div>
    )
}

function InfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
            <p className="mt-1 text-sm">{value}</p>
        </div>
    )
}

function formatDate(date: Date) {
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
}
