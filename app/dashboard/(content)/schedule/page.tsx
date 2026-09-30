"use client"

import * as React from "react"

import {
    Plus,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Clock3,
    Video,
    Smartphone,
    FileSearch,
    X,
    Check,
    Trash2,
} from "lucide-react"


type ContentType = "video" | "short" | "investigation"


type ScheduledItem = {
    id: number
    title: string
    type: ContentType
    date: string
    time: string
}


const typeMeta: Record<ContentType, {
    label: string
    icon: React.ElementType
    className: string
}> = {
    video: {
        label: "Long Video",
        icon: Video,
        className: "bg-red-500/10 text-red-500",
    },
    short: {
        label: "Short",
        icon: Smartphone,
        className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
    },
    investigation: {
        label: "Investigation",
        icon: FileSearch,
        className: "bg-zinc-900 text-white dark:bg-white dark:text-black",
    },
}


const initialItems: ScheduledItem[] = [
    { id: 1, title: "North Korea's Hidden Economy", type: "investigation", date: "2026-10-03", time: "18:00" },
    { id: 2, title: "What Happens If A Glacier Collapses?", type: "short", date: "2026-10-06", time: "12:00" },
    { id: 3, title: "India's Education Budget Explained", type: "video", date: "2026-10-10", time: "18:00" },
    { id: 4, title: "Why Paper Leaks Keep Happening", type: "short", date: "2026-10-14", time: "12:00" },
    { id: 5, title: "Bengaluru Water Crisis", type: "investigation", date: "2026-10-21", time: "18:00" },
    { id: 6, title: "FSSAI Food Safety", type: "video", date: "2026-10-28", time: "18:00" },
]


const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]


function toKey(date: Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}


export default function SchedulePage() {

    const [items, setItems] =
        React.useState<ScheduledItem[]>(initialItems)

    const [month, setMonth] =
        React.useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))

    const [editing, setEditing] =
        React.useState<ScheduledItem | null>(null)


    /* =========================================================
       CALENDAR GRID
    ========================================================= */

    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

    const cells: (Date | null)[] = [
        ...Array.from({ length: firstDay.getDay() }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) =>
            new Date(month.getFullYear(), month.getMonth(), i + 1)
        ),
    ]

    while (cells.length % 7 !== 0) cells.push(null)

    const todayKey = toKey(new Date())

    const upcoming = [...items]
        .filter((item) => item.date >= todayKey)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))


    function shiftMonth(delta: number) {
        setMonth((current) =>
            new Date(current.getFullYear(), current.getMonth() + delta, 1)
        )
    }


    function openNew(date?: string) {
        setEditing({
            id: 0,
            title: "",
            type: "video",
            date: date ?? todayKey,
            time: "18:00",
        })
    }


    function saveItem() {

        if (!editing || !editing.title.trim()) return

        if (editing.id === 0) {
            setItems((current) => [...current, { ...editing, id: Date.now() }])
        } else {
            setItems((current) =>
                current.map((item) => item.id === editing.id ? editing : item)
            )
        }

        setEditing(null)
    }


    function deleteItem(id: number) {
        setItems((current) => current.filter((item) => item.id !== id))
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
                        Schedule
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={() => openNew()}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                    <Plus size={16} />
                    Schedule Content
                </button>

            </header>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="min-h-[calc(100vh-64px)]">

                <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[1fr_320px]">

                    {/* CALENDAR */}

                    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

                        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">

                            <div className="flex items-center gap-2">
                                <CalendarDays size={17} className="text-zinc-400" />
                                <h2 className="font-semibold">
                                    {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                </h2>
                            </div>

                            <div className="flex items-center gap-1">

                                <button
                                    type="button"
                                    onClick={() => shiftMonth(-1)}
                                    className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                >
                                    Today
                                </button>

                                <button
                                    type="button"
                                    onClick={() => shiftMonth(1)}
                                    className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                >
                                    <ChevronRight size={16} />
                                </button>

                            </div>

                        </div>


                        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
                            {weekDays.map((day) => (
                                <div
                                    key={day}
                                    className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>


                        <div className="grid grid-cols-7">

                            {cells.map((date, index) => {

                                if (!date) {
                                    return (
                                        <div
                                            key={`empty-${index}`}
                                            className="min-h-24 border-b border-r border-zinc-100 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-900/20"
                                        />
                                    )
                                }

                                const key = toKey(date)
                                const dayItems = items.filter((item) => item.date === key)
                                const isToday = key === todayKey

                                return (
                                    <div
                                        key={key}
                                        onClick={() => openNew(key)}
                                        className="group min-h-24 cursor-pointer border-b border-r border-zinc-100 p-1.5 transition hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50"
                                    >

                                        <div className="flex items-center justify-between">

                                            <span
                                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${isToday
                                                    ? "bg-red-600 font-semibold text-white"
                                                    : "text-zinc-500"
                                                    }`}
                                            >
                                                {date.getDate()}
                                            </span>

                                            <Plus size={12} className="text-zinc-300 opacity-0 transition group-hover:opacity-100 dark:text-zinc-700" />

                                        </div>

                                        <div className="mt-1 space-y-1">
                                            {dayItems.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setEditing(item)
                                                    }}
                                                    className={`block w-full truncate rounded px-1.5 py-1 text-left text-[10px] font-medium ${typeMeta[item.type].className}`}
                                                >
                                                    {item.title}
                                                </button>
                                            ))}
                                        </div>

                                    </div>
                                )
                            })}

                        </div>

                    </section>


                    {/* SIDEBAR */}

                    <div className="space-y-6">

                        <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

                            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                                <h2 className="font-semibold">
                                    Upcoming
                                </h2>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {upcoming.length} scheduled publications
                                </p>
                            </div>

                            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

                                {upcoming.map((item) => {

                                    const meta = typeMeta[item.type]
                                    const Icon = meta.icon

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setEditing(item)}
                                            className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                        >

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                                                <Icon size={16} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                                                    <Clock3 size={11} />
                                                    {item.time} · {meta.label}
                                                </p>
                                            </div>

                                            <span className="shrink-0 text-xs font-medium text-red-500">
                                                {new Date(item.date + "T00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                                            </span>

                                        </button>
                                    )
                                })}

                                {upcoming.length === 0 && (
                                    <p className="px-5 py-8 text-center text-xs text-zinc-500">
                                        Nothing scheduled yet.
                                    </p>
                                )}

                            </div>

                        </section>


                        <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">

                            <p className="text-sm font-semibold">
                                Legend
                            </p>

                            <div className="mt-4 space-y-2">
                                {(Object.keys(typeMeta) as ContentType[]).map((type) => (
                                    <div key={type} className="flex items-center gap-2 text-xs">
                                        <span className={`h-3 w-3 rounded ${typeMeta[type].className}`} />
                                        {typeMeta[type].label}
                                    </div>
                                ))}
                            </div>

                        </section>

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
                                    Schedule
                                </p>
                                <h2 className="mt-1 text-sm font-semibold">
                                    {editing.id === 0 ? "New Publication" : "Edit Publication"}
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
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Title
                                </label>
                                <input
                                    value={editing.title}
                                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                    placeholder="Video title"
                                    className={inputClass}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Content Type
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(Object.keys(typeMeta) as ContentType[]).map((type) => {
                                        const Icon = typeMeta[type].icon
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setEditing({ ...editing, type })}
                                                className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-[11px] font-medium transition ${editing.type === type
                                                    ? "border-red-500 bg-red-500/5 text-red-500"
                                                    : "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                                    }`}
                                            >
                                                <Icon size={16} />
                                                {typeMeta[type].label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editing.date}
                                        onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={editing.time}
                                        onChange={(e) => setEditing({ ...editing, time: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>

                            </div>


                            <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">

                                <button
                                    type="button"
                                    onClick={saveItem}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    <Check size={15} />
                                    Save
                                </button>

                                {editing.id !== 0 && (
                                    <button
                                        type="button"
                                        onClick={() => deleteItem(editing.id)}
                                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:border-red-500/30 hover:text-red-500 dark:border-zinc-800"
                                    >
                                        <Trash2 size={15} />
                                        Remove from Schedule
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
