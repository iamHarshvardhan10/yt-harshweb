"use client"

import * as React from "react"

import {
    Plus,
    Search,
    FileText,
    StickyNote,
    Image as ImageIcon,
    Bookmark,
    LayoutGrid,
    List,
    Tag,
    X,
    Check,
    Trash2,
    Upload,
    BookOpen,
} from "lucide-react"


type DocType = "note" | "document" | "media" | "clip"


type ResearchDoc = {
    id: number
    title: string
    type: DocType
    summary: string
    tags: string[]
    collection: string
    bookmarked: boolean
    updatedAt: string
}


const typeMeta: Record<DocType, {
    label: string
    icon: React.ElementType
}> = {
    note: { label: "Note", icon: StickyNote },
    document: { label: "Document", icon: FileText },
    media: { label: "Media", icon: ImageIcon },
    clip: { label: "Web Clip", icon: Bookmark },
}


const collections = [
    "All",
    "Energy",
    "Urban",
    "Climate",
    "Geopolitics",
    "Education",
]


const initialDocs: ResearchDoc[] = [
    {
        id: 1,
        title: "E20 Vehicle Compatibility Findings",
        type: "note",
        summary: "Most pre-2023 two-wheelers show 3–6% mileage drop on E20. Rubber seals and fuel lines are the main compatibility concern.",
        tags: ["ethanol", "automobile"],
        collection: "Energy",
        bookmarked: true,
        updatedAt: "2 days ago",
    },
    {
        id: 2,
        title: "BMC Storm Water Drain Masterplan (BRIMSTOWAD)",
        type: "document",
        summary: "1993 masterplan and 2006 revision. Capacity designed for 25 mm/hr; Mumbai regularly sees 50+ mm/hr.",
        tags: ["mumbai", "infrastructure"],
        collection: "Urban",
        bookmarked: true,
        updatedAt: "1 week ago",
    },
    {
        id: 3,
        title: "Chungthang Dam Breach Satellite Images",
        type: "media",
        summary: "Before / after Sentinel-2 imagery of South Lhonak lake and Teesta valley.",
        tags: ["sikkim", "satellite", "glof"],
        collection: "Climate",
        bookmarked: false,
        updatedAt: "2 weeks ago",
    },
    {
        id: 4,
        title: "Lazarus Group Crypto Heists Timeline",
        type: "clip",
        summary: "Chainalysis summary of major DPRK-linked thefts from 2017 to 2025.",
        tags: ["crypto", "dprk"],
        collection: "Geopolitics",
        bookmarked: false,
        updatedAt: "3 weeks ago",
    },
    {
        id: 5,
        title: "State-wise Education Spend vs Allocation",
        type: "document",
        summary: "Compiled from state budget documents. Several states spend under 80% of allocated education funds.",
        tags: ["budget", "states"],
        collection: "Education",
        bookmarked: false,
        updatedAt: "1 month ago",
    },
    {
        id: 6,
        title: "Script Hooks — Flood Series",
        type: "note",
        summary: "Opening hook ideas and B-roll list for the flood series episodes.",
        tags: ["script", "hooks"],
        collection: "Climate",
        bookmarked: false,
        updatedAt: "1 month ago",
    },
]


export default function ResearchLibraryPage() {

    const [docs, setDocs] =
        React.useState<ResearchDoc[]>(initialDocs)

    const [collection, setCollection] =
        React.useState("All")

    const [search, setSearch] =
        React.useState("")

    const [view, setView] =
        React.useState<"grid" | "list">("grid")

    const [editing, setEditing] =
        React.useState<ResearchDoc | null>(null)

    const [tagInput, setTagInput] =
        React.useState("")


    const filtered = docs.filter((doc) =>
        (collection === "All" || doc.collection === collection) &&
        (doc.title + doc.summary + doc.tags.join(" "))
            .toLowerCase()
            .includes(search.toLowerCase())
    )


    function newDoc() {
        setTagInput("")
        setEditing({
            id: 0,
            title: "",
            type: "note",
            summary: "",
            tags: [],
            collection: collection === "All" ? collections[1] : collection,
            bookmarked: false,
            updatedAt: "Just now",
        })
    }


    function openDoc(doc: ResearchDoc) {
        setTagInput("")
        setEditing(doc)
    }


    function saveDoc() {

        if (!editing || !editing.title.trim()) return

        const doc = { ...editing, updatedAt: "Just now" }

        if (doc.id === 0) {
            setDocs((current) => [{ ...doc, id: Date.now() }, ...current])
        } else {
            setDocs((current) => current.map((d) => d.id === doc.id ? doc : d))
        }

        setEditing(null)
    }


    function toggleBookmark(id: number) {
        setDocs((current) =>
            current.map((d) => d.id === id ? { ...d, bookmarked: !d.bookmarked } : d)
        )
    }


    function addTag() {
        const tag = tagInput.trim().toLowerCase()
        if (!editing || !tag || editing.tags.includes(tag)) return
        setEditing({ ...editing, tags: [...editing.tags, tag] })
        setTagInput("")
    }


    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                        Research
                    </p>

                    <h1 className="text-lg font-semibold">
                        Research Library
                    </h1>
                </div>

                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        className="hidden items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 sm:inline-flex dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    >
                        <Upload size={15} />
                        Upload
                    </button>

                    <button
                        type="button"
                        onClick={newDoc}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        <Plus size={16} />
                        New Note
                    </button>

                </div>

            </header>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[240px_1fr]">

                {/* COLLECTIONS */}

                <aside className="border-r border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">

                    <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Collections
                    </p>

                    {collections.map((c) => {

                        const count = c === "All"
                            ? docs.length
                            : docs.filter((d) => d.collection === c).length

                        const active = collection === c

                        return (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCollection(c)}
                                className={`mb-1 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${active
                                    ? "border-red-500/30 bg-red-500/5 font-medium text-red-500"
                                    : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <BookOpen size={14} className={active ? "" : "text-zinc-400"} />
                                    {c}
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                    {count}
                                </span>
                            </button>
                        )
                    })}

                    <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Bookmarked
                        </p>
                        {docs.filter((d) => d.bookmarked).map((d) => (
                            <button
                                key={d.id}
                                type="button"
                                onClick={() => openDoc(d)}
                                className="flex w-full items-center gap-2 truncate rounded-lg px-3 py-2 text-left text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                            >
                                <Bookmark size={12} className="shrink-0 text-red-500" fill="currentColor" />
                                <span className="truncate">{d.title}</span>
                            </button>
                        ))}
                    </div>

                </aside>


                {/* DOCUMENTS */}

                <main className="px-6 py-8">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="relative w-full sm:w-80">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search notes, documents, tags..."
                                className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-zinc-800 dark:bg-zinc-950"
                            />
                        </div>

                        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
                            {([["grid", LayoutGrid], ["list", List]] as const).map(([mode, Icon]) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setView(mode)}
                                    className={`rounded-md p-2 transition ${view === mode
                                        ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                        }`}
                                >
                                    <Icon size={14} />
                                </button>
                            ))}
                        </div>

                    </div>

                    <p className="mt-4 text-xs text-zinc-500">
                        {filtered.length} items
                    </p>


                    <div className={view === "grid"
                        ? "mt-3 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3"
                        : "mt-3 divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950"
                    }>

                        {filtered.map((doc) => {

                            const Icon = typeMeta[doc.type].icon

                            if (view === "list") {
                                return (
                                    <div
                                        key={doc.id}
                                        onClick={() => openDoc(doc)}
                                        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                                            <Icon size={16} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{doc.title}</p>
                                            <p className="mt-0.5 text-xs text-zinc-500">
                                                {typeMeta[doc.type].label} · {doc.collection} · {doc.updatedAt}
                                            </p>
                                        </div>
                                        <BookmarkButton
                                            active={doc.bookmarked}
                                            onClick={() => toggleBookmark(doc.id)}
                                        />
                                    </div>
                                )
                            }

                            return (
                                <div
                                    key={doc.id}
                                    onClick={() => openDoc(doc)}
                                    className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-red-500/30 dark:border-zinc-800 dark:bg-zinc-950"
                                >

                                    <div className="flex items-start justify-between">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                                            <Icon size={16} />
                                        </div>
                                        <BookmarkButton
                                            active={doc.bookmarked}
                                            onClick={() => toggleBookmark(doc.id)}
                                        />
                                    </div>

                                    <p className="mt-4 text-sm font-semibold leading-5">
                                        {doc.title}
                                    </p>

                                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">
                                        {doc.summary}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {doc.tags.map((tag) => (
                                            <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                                                <Tag size={9} />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-[10px] dark:border-zinc-800">
                                        <span className="font-medium text-red-500">{doc.collection}</span>
                                        <span className="text-zinc-400">{doc.updatedAt}</span>
                                    </div>

                                </div>
                            )
                        })}

                    </div>


                    {filtered.length === 0 && (
                        <div className="mt-3 rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-zinc-700">
                            <BookOpen size={28} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                            <p className="mt-3 text-sm font-medium">
                                Nothing in this collection yet
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                                Add a note or upload a document.
                            </p>
                        </div>
                    )}

                </main>

            </div>


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

                    <aside className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

                            <div>
                                <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                                    Research
                                </p>
                                <h2 className="mt-1 text-sm font-semibold">
                                    {editing.id === 0 ? "New Item" : "Edit Item"}
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

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Title</label>
                                <input
                                    value={editing.title}
                                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Type</label>
                                    <select
                                        value={editing.type}
                                        onChange={(e) => setEditing({ ...editing, type: e.target.value as DocType })}
                                        className={inputClass}
                                    >
                                        {(Object.keys(typeMeta) as DocType[]).map((type) => (
                                            <option key={type} value={type}>{typeMeta[type].label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Collection</label>
                                    <select
                                        value={editing.collection}
                                        onChange={(e) => setEditing({ ...editing, collection: e.target.value })}
                                        className={inputClass}
                                    >
                                        {collections.slice(1).map((c) => (
                                            <option key={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Content</label>
                                <textarea
                                    rows={10}
                                    value={editing.summary}
                                    onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                                    placeholder="Write your findings..."
                                    className={`${inputClass} resize-none leading-6`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Tags</label>

                                <div className="flex flex-wrap gap-1.5">
                                    {editing.tags.map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-1 text-[11px] font-medium text-red-500">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => setEditing({ ...editing, tags: editing.tags.filter((t) => t !== tag) })}
                                            >
                                                <X size={11} />
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                <input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            addTag()
                                        }
                                    }}
                                    placeholder="Type a tag and press Enter"
                                    className={inputClass}
                                />
                            </div>


                            <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">

                                <button
                                    type="button"
                                    onClick={saveDoc}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    <Check size={15} />
                                    Save
                                </button>

                                {editing.id !== 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDocs((current) => current.filter((d) => d.id !== editing.id))
                                            setEditing(null)
                                        }}
                                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:border-red-500/30 hover:text-red-500 dark:border-zinc-800"
                                    >
                                        <Trash2 size={15} />
                                        Delete
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
   BOOKMARK BUTTON
============================================================= */

function BookmarkButton({
    active,
    onClick,
}: {
    active: boolean
    onClick: () => void
}) {

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation()
                onClick()
            }}
            className={`rounded-lg p-1.5 transition ${active
                ? "text-red-500"
                : "text-zinc-300 hover:text-zinc-500 dark:text-zinc-700"
                }`}
        >
            <Bookmark size={15} fill={active ? "currentColor" : "none"} />
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
