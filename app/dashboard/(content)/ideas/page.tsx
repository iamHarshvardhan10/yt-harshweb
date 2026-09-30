"use client"

import * as React from "react"

import {
    Plus,
    Search,
    Lightbulb,
    FileText,
    Scissors,
    CheckCircle2,
    MoreHorizontal,
    X,
    Check,
    Trash2,
    Tag,
} from "lucide-react"


type IdeaStatus = "idea" | "research" | "script" | "editing"

type Priority = "high" | "medium" | "low"


type Idea = {
    id: number
    title: string
    notes: string
    category: string
    priority: Priority
    status: IdeaStatus
    createdAt: string
}


const columns: {
    status: IdeaStatus
    label: string
    icon: React.ElementType
}[] = [
    { status: "idea", label: "Ideas", icon: Lightbulb },
    { status: "research", label: "Research", icon: Search },
    { status: "script", label: "Script", icon: FileText },
    { status: "editing", label: "Editing", icon: Scissors },
]


const initialIdeas: Idea[] = [
    {
        id: 1,
        title: "FSSAI Food Safety Failures",
        notes: "Look at adulteration reports and enforcement data from the last 5 years.",
        category: "Policy",
        priority: "high",
        status: "idea",
        createdAt: "Sep 28, 2026",
    },
    {
        id: 2,
        title: "EV Battery Recycling in India",
        notes: "Audience request from comments. Check CPCB battery waste rules.",
        category: "Technology",
        priority: "medium",
        status: "idea",
        createdAt: "Sep 25, 2026",
    },
    {
        id: 3,
        title: "North Korea's Hidden Economy",
        notes: "Sanctions, crypto theft and state-run enterprises.",
        category: "World",
        priority: "high",
        status: "research",
        createdAt: "Sep 12, 2026",
    },
    {
        id: 4,
        title: "Why Bengaluru Runs Out of Water",
        notes: "Groundwater depletion, lake encroachment and tanker mafia.",
        category: "Climate",
        priority: "medium",
        status: "research",
        createdAt: "Sep 10, 2026",
    },
    {
        id: 5,
        title: "India's Education Budget",
        notes: "Compare allocation vs. actual spending across states.",
        category: "Policy",
        priority: "high",
        status: "script",
        createdAt: "Sep 04, 2026",
    },
    {
        id: 6,
        title: "Nepal Glacier Flood Crisis",
        notes: "GLOF risk mapping, interviews and satellite imagery.",
        category: "Climate",
        priority: "low",
        status: "editing",
        createdAt: "Aug 30, 2026",
    },
]


const priorityClass: Record<Priority, string> = {
    high: "bg-red-500/10 text-red-500",
    medium: "bg-amber-500/10 text-amber-600",
    low: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900",
}


export default function IdeasPage() {

    const [ideas, setIdeas] =
        React.useState<Idea[]>(initialIdeas)

    const [search, setSearch] =
        React.useState("")

    const [editing, setEditing] =
        React.useState<Idea | null>(null)


    const filteredIdeas = ideas.filter((idea) =>
        idea.title.toLowerCase().includes(search.toLowerCase())
    )


    /* =========================================================
       OPEN NEW IDEA
    ========================================================= */

    function newIdea() {
        setEditing({
            id: 0,
            title: "",
            notes: "",
            category: "Policy",
            priority: "medium",
            status: "idea",
            createdAt: "",
        })
    }


    /* =========================================================
       SAVE IDEA
    ========================================================= */

    function saveIdea() {

        if (!editing || !editing.title.trim()) return

        if (editing.id === 0) {
            setIdeas((current) => [
                {
                    ...editing,
                    id: Date.now(),
                    createdAt: new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                    }),
                },
                ...current,
            ])
        } else {
            setIdeas((current) =>
                current.map((idea) =>
                    idea.id === editing.id ? editing : idea
                )
            )
        }

        setEditing(null)
    }


    function deleteIdea(id: number) {
        setIdeas((current) =>
            current.filter((idea) => idea.id !== id)
        )
        setEditing(null)
    }


    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                        Content
                    </p>

                    <h1 className="text-lg font-semibold">
                        Content Ideas
                    </h1>
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


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="min-h-[calc(100vh-64px)]">

                <div className="mx-auto max-w-7xl px-6 py-8">

                    {/* TOOLBAR */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <p className="text-xs text-zinc-500">
                            {ideas.length} ideas in your pipeline
                        </p>

                        <div className="relative w-full sm:w-72">

                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                            />

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search ideas..."
                                className={`${inputClass} pl-9`}
                            />

                        </div>

                    </div>


                    {/* BOARD */}

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                        {columns.map((column) => {

                            const Icon = column.icon

                            const items = filteredIdeas.filter(
                                (idea) => idea.status === column.status
                            )

                            return (
                                <section
                                    key={column.status}
                                    className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                                >

                                    <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">

                                        <div className="flex items-center gap-2">

                                            <Icon size={15} className="text-zinc-400" />

                                            <p className="text-sm font-semibold">
                                                {column.label}
                                            </p>

                                        </div>

                                        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-900">
                                            {items.length}
                                        </span>

                                    </div>


                                    <div className="space-y-2 p-3">

                                        {items.map((idea) => (

                                            <button
                                                key={idea.id}
                                                type="button"
                                                onClick={() => setEditing(idea)}
                                                className="w-full rounded-lg border border-zinc-200 p-3 text-left transition hover:border-red-500/30 hover:bg-red-500/5 dark:border-zinc-800"
                                            >

                                                <div className="flex items-start justify-between gap-2">

                                                    <p className="text-sm font-medium leading-5">
                                                        {idea.title}
                                                    </p>

                                                    <MoreHorizontal size={15} className="shrink-0 text-zinc-400" />

                                                </div>

                                                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-zinc-500">
                                                    {idea.notes}
                                                </p>

                                                <div className="mt-3 flex items-center justify-between">

                                                    <div className="flex items-center gap-1.5">

                                                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium capitalize ${priorityClass[idea.priority]}`}>
                                                            {idea.priority}
                                                        </span>

                                                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                                                            <Tag size={10} />
                                                            {idea.category}
                                                        </span>

                                                    </div>

                                                    <span className="text-[10px] text-zinc-400">
                                                        {idea.createdAt}
                                                    </span>

                                                </div>

                                            </button>

                                        ))}


                                        {items.length === 0 && (
                                            <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center dark:border-zinc-700">
                                                <CheckCircle2 size={18} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                                                <p className="mt-2 text-[11px] text-zinc-500">
                                                    Nothing here
                                                </p>
                                            </div>
                                        )}

                                    </div>

                                </section>
                            )
                        })}

                    </div>

                </div>

            </main>


            {/* =====================================================
                EDIT PANEL
            ===================================================== */}

            {editing && (

                <div className="fixed inset-0 z-50">

                    <button
                        type="button"
                        aria-label="Close"
                        onClick={() => setEditing(null)}
                        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
                    />

                    <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

                            <div>
                                <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                                    Content Idea
                                </p>

                                <h2 className="mt-1 text-sm font-semibold">
                                    {editing.id === 0 ? "New Idea" : "Edit Idea"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white"
                            >
                                <X size={17} />
                            </button>

                        </div>


                        <div className="space-y-5 p-5">

                            <Field label="Title">
                                <input
                                    value={editing.title}
                                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                    placeholder="What's the story?"
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="Notes">
                                <textarea
                                    rows={6}
                                    value={editing.notes}
                                    onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                                    placeholder="Angle, sources, questions to answer..."
                                    className={`${inputClass} resize-none leading-6`}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">

                                <Field label="Category">
                                    <select
                                        value={editing.category}
                                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option>Policy</option>
                                        <option>Climate</option>
                                        <option>Technology</option>
                                        <option>World</option>
                                        <option>Society</option>
                                    </select>
                                </Field>

                                <Field label="Stage">
                                    <select
                                        value={editing.status}
                                        onChange={(e) => setEditing({ ...editing, status: e.target.value as IdeaStatus })}
                                        className={inputClass}
                                    >
                                        {columns.map((column) => (
                                            <option key={column.status} value={column.status}>
                                                {column.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                            </div>

                            <Field label="Priority">
                                <div className="grid grid-cols-3 gap-2">
                                    {(["high", "medium", "low"] as Priority[]).map((priority) => (
                                        <button
                                            key={priority}
                                            type="button"
                                            onClick={() => setEditing({ ...editing, priority })}
                                            className={`rounded-lg border px-2 py-2.5 text-xs font-medium capitalize transition ${editing.priority === priority
                                                ? "border-red-500 bg-red-500/5 text-red-500"
                                                : "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                                }`}
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            </Field>


                            <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">

                                <button
                                    type="button"
                                    onClick={saveIdea}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    <Check size={15} />
                                    Save Idea
                                </button>

                                {editing.id !== 0 && (
                                    <button
                                        type="button"
                                        onClick={() => deleteIdea(editing.id)}
                                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:border-red-500/30 hover:text-red-500 dark:border-zinc-800"
                                    >
                                        <Trash2 size={15} />
                                        Delete Idea
                                    </button>
                                )}

                            </div>

                        </div>

                    </aside>

                </div>

            )}

        </div>
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
