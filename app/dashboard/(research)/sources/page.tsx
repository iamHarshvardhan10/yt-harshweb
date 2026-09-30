"use client"

import * as React from "react"

import {
    Plus,
    Search,
    ExternalLink,
    FileText,
    Globe,
    Database,
    Newspaper,
    User,
    X,
    Check,
    Trash2,
    Link2,
    ShieldCheck,
    MoreHorizontal,
} from "lucide-react"


type SourceType = "report" | "news" | "dataset" | "interview" | "website"

type Reliability = "verified" | "credible" | "unverified"


type Source = {
    id: number
    title: string
    publisher: string
    url: string
    type: SourceType
    reliability: Reliability
    investigation: string
    notes: string
    addedAt: string
}


const typeMeta: Record<SourceType, {
    label: string
    icon: React.ElementType
}> = {
    report: { label: "Report", icon: FileText },
    news: { label: "News", icon: Newspaper },
    dataset: { label: "Dataset", icon: Database },
    interview: { label: "Interview", icon: User },
    website: { label: "Website", icon: Globe },
}


const reliabilityClass: Record<Reliability, string> = {
    verified: "bg-green-500/10 text-green-600",
    credible: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
    unverified: "bg-amber-500/10 text-amber-600",
}


const investigations = [
    "The Truth Behind India's E20 Fuel",
    "Why Mumbai Floods Every Monsoon",
    "Can India Handle Another Himalayan Flood?",
    "North Korea's Hidden Economy",
    "India's Education Budget",
]


const initialSources: Source[] = [
    {
        id: 1,
        title: "Roadmap for Ethanol Blending in India 2020–25",
        publisher: "NITI Aayog",
        url: "https://niti.gov.in",
        type: "report",
        reliability: "verified",
        investigation: "The Truth Behind India's E20 Fuel",
        notes: "Primary government roadmap. Pages 18–24 on vehicle compatibility.",
        addedAt: "Aug 12, 2026",
    },
    {
        id: 2,
        title: "Mumbai Rainfall Data 1990–2025",
        publisher: "India Meteorological Department",
        url: "https://mausam.imd.gov.in",
        type: "dataset",
        reliability: "verified",
        investigation: "Why Mumbai Floods Every Monsoon",
        notes: "Daily rainfall by station. Use Santacruz + Colaba.",
        addedAt: "Aug 20, 2026",
    },
    {
        id: 3,
        title: "Interview: Former BMC Storm Water Engineer",
        publisher: "Field interview",
        url: "",
        type: "interview",
        reliability: "credible",
        investigation: "Why Mumbai Floods Every Monsoon",
        notes: "Off-record on drain capacity numbers. Needs second confirmation.",
        addedAt: "Aug 24, 2026",
    },
    {
        id: 4,
        title: "Glacial Lake Outburst Flood Risk Assessment",
        publisher: "ICIMOD",
        url: "https://icimod.org",
        type: "report",
        reliability: "verified",
        investigation: "Can India Handle Another Himalayan Flood?",
        notes: "Risk map of 47 potentially dangerous glacial lakes.",
        addedAt: "Aug 26, 2026",
    },
    {
        id: 5,
        title: "UN Panel of Experts Report on DPRK",
        publisher: "United Nations",
        url: "https://un.org",
        type: "report",
        reliability: "verified",
        investigation: "North Korea's Hidden Economy",
        notes: "Crypto theft estimates, ship-to-ship transfers.",
        addedAt: "Sep 11, 2026",
    },
    {
        id: 6,
        title: "Viral thread on ethanol engine damage",
        publisher: "X / Twitter",
        url: "https://x.com",
        type: "website",
        reliability: "unverified",
        investigation: "The Truth Behind India's E20 Fuel",
        notes: "Anecdotal. Only use as example of public perception.",
        addedAt: "Aug 14, 2026",
    },
]


export default function SourcesPage() {

    const [sources, setSources] =
        React.useState<Source[]>(initialSources)

    const [search, setSearch] =
        React.useState("")

    const [investigation, setInvestigation] =
        React.useState("all")

    const [editing, setEditing] =
        React.useState<Source | null>(null)


    const filtered = sources.filter((s) =>
        (investigation === "all" || s.investigation === investigation) &&
        (s.title + s.publisher).toLowerCase().includes(search.toLowerCase())
    )


    function newSource() {
        setEditing({
            id: 0,
            title: "",
            publisher: "",
            url: "",
            type: "report",
            reliability: "credible",
            investigation: investigations[0],
            notes: "",
            addedAt: "",
        })
    }


    function saveSource() {

        if (!editing || !editing.title.trim()) return

        if (editing.id === 0) {
            setSources((current) => [
                {
                    ...editing,
                    id: Date.now(),
                    addedAt: new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                    }),
                },
                ...current,
            ])
        } else {
            setSources((current) =>
                current.map((s) => s.id === editing.id ? editing : s)
            )
        }

        setEditing(null)
    }


    function deleteSource(id: number) {
        setSources((current) => current.filter((s) => s.id !== id))
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
                        Research
                    </p>

                    <h1 className="text-lg font-semibold">
                        Sources
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={newSource}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                    <Plus size={16} />
                    Add Source
                </button>

            </header>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="min-h-[calc(100vh-64px)]">

                <div className="mx-auto max-w-7xl px-6 py-8">

                    {/* STATS */}

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard icon={<Link2 size={17} />} label="Total Sources" value={sources.length} />
                        <StatCard icon={<ShieldCheck size={17} />} label="Verified" value={sources.filter((s) => s.reliability === "verified").length} />
                        <StatCard icon={<FileText size={17} />} label="Reports & Datasets" value={sources.filter((s) => s.type === "report" || s.type === "dataset").length} />
                        <StatCard icon={<User size={17} />} label="Interviews" value={sources.filter((s) => s.type === "interview").length} />
                    </div>


                    {/* TOOLBAR */}

                    <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                        <select
                            value={investigation}
                            onChange={(e) => setInvestigation(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 lg:w-80 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                            <option value="all">All investigations</option>
                            {investigations.map((inv) => (
                                <option key={inv}>{inv}</option>
                            ))}
                        </select>

                        <div className="relative w-full lg:w-72">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search sources..."
                                className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-zinc-800 dark:bg-zinc-950"
                            />
                        </div>

                    </div>


                    {/* TABLE */}

                    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">

                                <thead className="border-b border-zinc-200 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-5 py-3">Source</th>
                                        <th className="px-5 py-3">Type</th>
                                        <th className="px-5 py-3">Reliability</th>
                                        <th className="px-5 py-3">Investigation</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">

                                    {filtered.map((s) => {

                                        const Icon = typeMeta[s.type].icon

                                        return (
                                            <tr
                                                key={s.id}
                                                onClick={() => setEditing(s)}
                                                className="cursor-pointer transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                            >

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                                                            <Icon size={16} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="max-w-[340px] truncate font-medium">
                                                                {s.title}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-zinc-500">
                                                                {s.publisher} · {s.addedAt}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-xs text-zinc-500">
                                                    {typeMeta[s.type].label}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className={`rounded-md px-2 py-1 text-[10px] font-medium capitalize ${reliabilityClass[s.reliability]}`}>
                                                        {s.reliability}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="max-w-[240px] truncate text-xs text-red-500">
                                                        {s.investigation}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {s.url && (
                                                            <a
                                                                href={s.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                                                            >
                                                                <ExternalLink size={15} />
                                                            </a>
                                                        )}
                                                        <span className="p-2 text-zinc-400">
                                                            <MoreHorizontal size={16} />
                                                        </span>
                                                    </div>
                                                </td>

                                            </tr>
                                        )
                                    })}

                                </tbody>
                            </table>
                        </div>

                        {filtered.length === 0 && (
                            <div className="px-6 py-16 text-center">
                                <Link2 size={28} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                                <p className="mt-3 text-sm font-medium">
                                    No sources found
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Try another search or investigation.
                                </p>
                            </div>
                        )}

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
                                    Source
                                </p>
                                <h2 className="mt-1 text-sm font-semibold">
                                    {editing.id === 0 ? "Add Source" : "Edit Source"}
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
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="Publisher / Author">
                                <input
                                    value={editing.publisher}
                                    onChange={(e) => setEditing({ ...editing, publisher: e.target.value })}
                                    className={inputClass}
                                />
                            </Field>

                            <Field label="URL">
                                <div className="relative">
                                    <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        value={editing.url}
                                        onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                                        placeholder="https://"
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                            </Field>

                            <div className="grid grid-cols-2 gap-3">

                                <Field label="Type">
                                    <select
                                        value={editing.type}
                                        onChange={(e) => setEditing({ ...editing, type: e.target.value as SourceType })}
                                        className={inputClass}
                                    >
                                        {(Object.keys(typeMeta) as SourceType[]).map((type) => (
                                            <option key={type} value={type}>
                                                {typeMeta[type].label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Reliability">
                                    <select
                                        value={editing.reliability}
                                        onChange={(e) => setEditing({ ...editing, reliability: e.target.value as Reliability })}
                                        className={`${inputClass} capitalize`}
                                    >
                                        <option value="verified">Verified</option>
                                        <option value="credible">Credible</option>
                                        <option value="unverified">Unverified</option>
                                    </select>
                                </Field>

                            </div>

                            <Field label="Linked Investigation">
                                <select
                                    value={editing.investigation}
                                    onChange={(e) => setEditing({ ...editing, investigation: e.target.value })}
                                    className={inputClass}
                                >
                                    {investigations.map((inv) => (
                                        <option key={inv}>{inv}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Notes">
                                <textarea
                                    rows={5}
                                    value={editing.notes}
                                    onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                                    placeholder="Key facts, page numbers, caveats..."
                                    className={`${inputClass} resize-none leading-6`}
                                />
                            </Field>


                            <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">

                                <button
                                    type="button"
                                    onClick={saveSource}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    <Check size={15} />
                                    Save Source
                                </button>

                                {editing.id !== 0 && (
                                    <button
                                        type="button"
                                        onClick={() => deleteSource(editing.id)}
                                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:border-red-500/30 hover:text-red-500 dark:border-zinc-800"
                                    >
                                        <Trash2 size={15} />
                                        Delete Source
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
   STAT CARD
============================================================= */

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
