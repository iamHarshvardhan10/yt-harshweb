"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    AlarmClock,
    CalendarClock,
    Check,
    CheckCircle2,
    ExternalLink,
    FileText,
    Lightbulb,
    Loader2,
    Mail,
    Plus,
    Rocket,
    Scissors,
    Search,
    Smartphone,
    Tag,
    Trash2,
    Video,
    X,
} from "lucide-react"
import type { ContentIdea, ContentIdeaType, IdeaPriority, IdeaStage } from "@prisma/client"

import { api } from "@/components/dashboard/home/api"
import { inputClass, labelClass } from "@/components/dashboard/home/ui"
import {
    IDEA_PRIORITIES,
    IDEA_STAGES,
    IDEA_TYPES,
    formatUpload,
    fromUploadInput,
    priorityLabels,
    stageLabels,
    toUploadInput,
    typeLabels,
    uploadCountdown,
} from "@/lib/ideas/shared"
import { youtubeWatchUrl } from "@/lib/investigations/shared"

/** Board columns — uploaded ideas are listed separately below the board */
const columns: { stage: IdeaStage; icon: React.ElementType }[] = [
    { stage: "IDEA", icon: Lightbulb },
    { stage: "RESEARCH", icon: Search },
    { stage: "SCRIPT", icon: FileText },
    { stage: "EDITING", icon: Scissors },
    { stage: "READY", icon: Rocket },
]

const typeMeta: Record<ContentIdeaType, { icon: React.ElementType; className: string }> = {
    VIDEO: { icon: Video, className: "bg-red-500/10 text-red-600 dark:text-red-400" },
    SHORT: { icon: Smartphone, className: "bg-zinc-900 text-white dark:bg-white dark:text-black" },
}

const priorityClass: Record<IdeaPriority, string> = {
    HIGH: "bg-red-500/10 text-red-500",
    MEDIUM: "bg-amber-500/10 text-amber-600",
    LOW: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900",
}

export const suggestedCategories = ["Policy", "Climate", "Technology", "World", "Society", "Economy"]

export type Draft = {
    id: string | null
    title: string
    notes: string
    category: string
    type: ContentIdeaType
    stage: IdeaStage
    priority: IdeaPriority
    uploadAt: string // datetime-local value in IST, "" = not planned
    youtubeVideoId: string
    reminderSentAt: Date | null // read-only, shown in the drawer
}

export const newDraft = (overrides: Partial<Draft> = {}): Draft => ({
    id: null,
    title: "",
    notes: "",
    category: "",
    type: "VIDEO",
    stage: "IDEA",
    priority: "MEDIUM",
    uploadAt: "",
    youtubeVideoId: "",
    reminderSentAt: null,
    ...overrides,
})

export const toDraft = (idea: ContentIdea): Draft => ({
    id: idea.id,
    title: idea.title,
    notes: idea.notes ?? "",
    category: idea.category ?? "",
    type: idea.type,
    stage: idea.stage,
    priority: idea.priority,
    uploadAt: toUploadInput(idea.uploadAt),
    youtubeVideoId: idea.youtubeVideoId ?? "",
    reminderSentAt: idea.reminderSentAt,
})

export const isOverdue = (idea: ContentIdea, now: Date) =>
    idea.stage !== "UPLOADED" && idea.uploadAt !== null && idea.uploadAt < now


export default function IdeaBoard({ ideas }: { ideas: ContentIdea[] }) {
    const router = useRouter()
    const [now] = React.useState(() => new Date())

    const [tab, setTab] = React.useState<"ALL" | ContentIdeaType>("ALL")
    const [search, setSearch] = React.useState("")
    const [editing, setEditing] = React.useState<Draft | null>(null)

    const query = search.trim().toLowerCase()
    const filtered = ideas.filter(
        (idea) =>
            (tab === "ALL" || idea.type === tab) &&
            (!query ||
                idea.title.toLowerCase().includes(query) ||
                idea.notes?.toLowerCase().includes(query) ||
                idea.category?.toLowerCase().includes(query))
    )

    // Ideas arrive sorted by upload time, so these stay in order
    const upcoming = filtered.filter((idea) => idea.uploadAt && idea.stage !== "UPLOADED")
    const uploaded = filtered.filter((idea) => idea.stage === "UPLOADED")

    const active = ideas.filter((idea) => idea.stage !== "UPLOADED")
    const stats = [
        { label: "Video ideas", value: active.filter((i) => i.type === "VIDEO").length, icon: Video },
        { label: "Short ideas", value: active.filter((i) => i.type === "SHORT").length, icon: Smartphone },
        { label: "Upload planned", value: active.filter((i) => i.uploadAt).length, icon: CalendarClock },
        { label: "Overdue", value: active.filter((i) => isOverdue(i, now)).length, icon: AlarmClock },
    ]

    function newIdea() {
        setEditing(newDraft({ type: tab === "SHORT" ? "SHORT" : "VIDEO" }))
    }

    function open(idea: ContentIdea) {
        setEditing(toDraft(idea))
    }

    function closeAndRefresh() {
        setEditing(null)
        router.refresh()
    }

    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* HEADER */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">Content</p>
                    <h1 className="text-lg font-semibold">Content Ideas</h1>
                </div>

                <button
                    type="button"
                    onClick={newIdea}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                    <Plus size={16} />
                    New Idea
                </button>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* STATS */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon
                        const alert = stat.label === "Overdue" && stat.value > 0
                        return (
                            <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                                <Icon size={17} className={alert ? "text-red-500" : "text-zinc-400"} />
                                <p className={`mt-4 text-2xl font-semibold tracking-tight ${alert ? "text-red-500" : ""}`}>{stat.value}</p>
                                <p className="mt-1 text-xs text-zinc-500">{stat.label}</p>
                            </div>
                        )
                    })}
                </div>

                {/* TOOLBAR */}
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-fit items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
                        {(["ALL", ...IDEA_TYPES] as const).map((id) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setTab(id)}
                                className={`rounded-md px-4 py-2 text-xs font-medium transition ${tab === id
                                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                    }`}
                            >
                                {id === "ALL" ? "All" : `${typeLabels[id]}s`}
                                <span className="ml-1.5 opacity-60">
                                    {id === "ALL" ? active.length : active.filter((i) => i.type === id).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search ideas..."
                            className={`${inputClass} pl-9`}
                        />
                    </div>
                </div>

                {/* UPCOMING UPLOADS */}
                <section className="mt-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                        <div>
                            <h2 className="font-semibold">Upcoming uploads</h2>
                            <p className="mt-1 text-xs text-zinc-500">When each planned video and Short should go live on YouTube (IST)</p>
                        </div>
                        <CalendarClock size={17} className="text-zinc-400" />
                    </div>

                    {upcoming.length === 0 ? (
                        <p className="px-5 py-6 text-xs text-zinc-500">
                            No upload times planned yet. Open an idea and set its planned upload.
                        </p>
                    ) : (
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {upcoming.map((idea) => {
                                const overdue = isOverdue(idea, now)
                                return (
                                    <button
                                        key={idea.id}
                                        type="button"
                                        onClick={() => open(idea)}
                                        className="flex w-full items-center gap-4 px-5 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                    >
                                        <TypeBadge type={idea.type} />

                                        <p className="min-w-0 flex-1 truncate text-sm font-medium">{idea.title}</p>

                                        <span className="hidden text-xs text-zinc-500 md:inline">{stageLabels[idea.stage]}</span>

                                        <span className="w-44 shrink-0 text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                                            {formatUpload(idea.uploadAt!)}
                                        </span>

                                        <span className={`w-28 shrink-0 text-right text-xs font-medium ${overdue ? "text-red-500" : "text-zinc-500"}`}>
                                            {overdue && uploadCountdown(idea.uploadAt!, now) === "Today"
                                                ? "Overdue"
                                                : uploadCountdown(idea.uploadAt!, now)}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </section>

                {/* BOARD */}
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {columns.map((column) => {
                        const Icon = column.icon
                        const items = filtered.filter((idea) => idea.stage === column.stage)

                        return (
                            <section key={column.stage} className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                                <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <Icon size={15} className="text-zinc-400" />
                                        <p className="text-sm font-semibold">{stageLabels[column.stage]}</p>
                                    </div>
                                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-900">
                                        {items.length}
                                    </span>
                                </div>

                                <div className="space-y-2 p-3">
                                    {items.map((idea) => (
                                        <IdeaCard key={idea.id} idea={idea} overdue={isOverdue(idea, now)} onClick={() => open(idea)} />
                                    ))}

                                    {items.length === 0 && (
                                        <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center dark:border-zinc-700">
                                            <CheckCircle2 size={18} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                                            <p className="mt-2 text-[11px] text-zinc-500">Nothing here</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )
                    })}
                </div>

                {/* UPLOADED */}
                {uploaded.length > 0 && (
                    <section className="mt-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                            <h2 className="font-semibold">Uploaded</h2>
                            <p className="mt-1 text-xs text-zinc-500">{uploaded.length} ideas are live on YouTube</p>
                        </div>

                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {uploaded.map((idea) => (
                                <div key={idea.id} className="flex items-center gap-4 px-5 py-3">
                                    <TypeBadge type={idea.type} />
                                    <button type="button" onClick={() => open(idea)} className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:text-red-500">
                                        {idea.title}
                                    </button>
                                    {idea.uploadAt && <span className="hidden text-xs text-zinc-500 sm:inline">{formatUpload(idea.uploadAt)}</span>}
                                    {idea.youtubeVideoId && (
                                        <a
                                            href={youtubeWatchUrl(idea.youtubeVideoId)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-400"
                                        >
                                            Watch
                                            <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {editing && (
                <IdeaDrawer
                    initial={editing}
                    categories={[...new Set([...ideas.flatMap((i) => i.category ?? []), ...suggestedCategories])]}
                    onClose={() => setEditing(null)}
                    onSaved={closeAndRefresh}
                />
            )}
        </div>
    )
}


/* =============================================================
   CARD
============================================================= */

export function TypeBadge({ type }: { type: ContentIdeaType }) {
    const { icon: Icon, className } = typeMeta[type]
    return (
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${className}`}>
            <Icon size={11} />
            {typeLabels[type]}
        </span>
    )
}

function IdeaCard({ idea, overdue, onClick }: { idea: ContentIdea; overdue: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full rounded-lg border border-zinc-200 p-3 text-left transition hover:border-red-500/30 hover:bg-red-500/5 dark:border-zinc-800"
        >
            <div className="flex items-center justify-between gap-2">
                <TypeBadge type={idea.type} />
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${priorityClass[idea.priority]}`}>
                    {priorityLabels[idea.priority]}
                </span>
            </div>

            <p className="mt-2 text-sm font-medium leading-5">{idea.title}</p>

            {idea.notes && <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-zinc-500">{idea.notes}</p>}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                {idea.category ? (
                    <span className="inline-flex items-center gap-1 text-zinc-500">
                        <Tag size={10} />
                        {idea.category}
                    </span>
                ) : <span />}

                {idea.uploadAt ? (
                    <span className={`inline-flex items-center gap-1 font-medium ${overdue ? "text-red-500" : "text-zinc-600 dark:text-zinc-400"}`}>
                        <CalendarClock size={10} />
                        {formatUpload(idea.uploadAt)}
                    </span>
                ) : (
                    <span className="text-zinc-400">No upload time</span>
                )}
            </div>
        </button>
    )
}


/* =============================================================
   DRAWER
============================================================= */

export function IdeaDrawer({
    initial,
    categories,
    onClose,
    onSaved,
}: {
    initial: Draft
    categories: string[]
    onClose: () => void
    onSaved: () => void
}) {
    const [draft, setDraft] = React.useState(initial)
    const [pending, setPending] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const isNew = draft.id === null
    const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

    async function request(fn: () => Promise<unknown>) {
        setPending(true)
        setError(null)
        try {
            await fn()
            onSaved()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
            setPending(false)
        }
    }

    function save() {
        if (!draft.title.trim()) {
            setError("Give the idea a title")
            return
        }

        const json = {
            title: draft.title,
            notes: draft.notes,
            category: draft.category,
            type: draft.type,
            stage: draft.stage,
            priority: draft.priority,
            uploadAt: fromUploadInput(draft.uploadAt),
            youtubeVideoId: draft.youtubeVideoId || null,
        }

        request(() =>
            isNew
                ? api("/api/ideas", { method: "POST", json })
                : api(`/api/ideas/${draft.id}`, { method: "PATCH", json })
        )
    }

    function remove() {
        if (!window.confirm(`Delete "${initial.title}"?`)) return
        request(() => api(`/api/ideas/${draft.id}`, { method: "DELETE" }))
    }

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
            />

            <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-red-500">Content Idea</p>
                        <h2 className="mt-1 text-sm font-semibold">{isNew ? "New Idea" : "Edit Idea"}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white"
                    >
                        <X size={17} />
                    </button>
                </div>

                <div className="space-y-5 p-5">
                    <Field label="Format">
                        <div className="grid grid-cols-2 gap-2">
                            {IDEA_TYPES.map((type) => {
                                const Icon = typeMeta[type].icon
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => set("type", type)}
                                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition ${draft.type === type
                                            ? "border-red-500 bg-red-500/5 text-red-500"
                                            : "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                            }`}
                                    >
                                        <Icon size={15} />
                                        {type === "VIDEO" ? "Long video" : "Short"}
                                    </button>
                                )
                            })}
                        </div>
                    </Field>

                    <Field label="Topic">
                        <input
                            value={draft.title}
                            onChange={(e) => set("title", e.target.value)}
                            placeholder="What's the story?"
                            maxLength={200}
                            autoFocus={isNew}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Notes">
                        <textarea
                            rows={5}
                            value={draft.notes}
                            onChange={(e) => set("notes", e.target.value)}
                            placeholder="Angle, sources, questions to answer..."
                            maxLength={5000}
                            className={`${inputClass} resize-none leading-6`}
                        />
                    </Field>

                    <Field label="Planned upload (IST)">
                        <div className="flex gap-2">
                            <input
                                type="datetime-local"
                                value={draft.uploadAt}
                                onChange={(e) => set("uploadAt", e.target.value)}
                                className={inputClass}
                            />
                            {draft.uploadAt && (
                                <button
                                    type="button"
                                    onClick={() => set("uploadAt", "")}
                                    className="shrink-0 rounded-lg border border-zinc-200 px-3 text-xs text-zinc-500 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        {draft.uploadAt && (
                            <p className="text-[11px] text-zinc-500">
                                {formatUpload(fromUploadInput(draft.uploadAt)!)} · {uploadCountdown(fromUploadInput(draft.uploadAt)!)}
                            </p>
                        )}
                        {draft.uploadAt && draft.stage !== "UPLOADED" && (
                            <p className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                                <Mail size={11} />
                                {draft.reminderSentAt && draft.uploadAt === initial.uploadAt
                                    ? `Reminder emailed ${formatUpload(draft.reminderSentAt)}`
                                    : "You'll get an email reminder about a day before"}
                            </p>
                        )}
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Stage">
                            <select
                                value={draft.stage}
                                onChange={(e) => set("stage", e.target.value as IdeaStage)}
                                className={inputClass}
                            >
                                {IDEA_STAGES.map((stage) => (
                                    <option key={stage} value={stage}>{stageLabels[stage]}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Category">
                            <input
                                list="idea-categories"
                                value={draft.category}
                                onChange={(e) => set("category", e.target.value)}
                                maxLength={40}
                                placeholder="Policy"
                                className={inputClass}
                            />
                            <datalist id="idea-categories">
                                {categories.map((category) => <option key={category} value={category} />)}
                            </datalist>
                        </Field>
                    </div>

                    <Field label="Priority">
                        <div className="grid grid-cols-3 gap-2">
                            {IDEA_PRIORITIES.map((priority) => (
                                <button
                                    key={priority}
                                    type="button"
                                    onClick={() => set("priority", priority)}
                                    className={`rounded-lg border px-2 py-2.5 text-xs font-medium transition ${draft.priority === priority
                                        ? "border-red-500 bg-red-500/5 text-red-500"
                                        : "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                        }`}
                                >
                                    {priorityLabels[priority]}
                                </button>
                            ))}
                        </div>
                    </Field>

                    {(draft.stage === "UPLOADED" || draft.youtubeVideoId) && (
                        <Field label="YouTube link">
                            <input
                                value={draft.youtubeVideoId}
                                onChange={(e) => set("youtubeVideoId", e.target.value)}
                                placeholder="https://youtube.com/watch?v=… or a Shorts link"
                                className={inputClass}
                            />
                        </Field>
                    )}

                    {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">{error}</p>}

                    <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={save}
                            disabled={pending}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                        >
                            {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                            {isNew ? "Add Idea" : "Save Idea"}
                        </button>

                        {!isNew && (
                            <button
                                type="button"
                                onClick={remove}
                                disabled={pending}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:border-red-500/30 hover:text-red-500 disabled:opacity-60 dark:border-zinc-800"
                            >
                                <Trash2 size={15} />
                                Delete Idea
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className={labelClass}>{label}</label>
            {children}
        </div>
    )
}
