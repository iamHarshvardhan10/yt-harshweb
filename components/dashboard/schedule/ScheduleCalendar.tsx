"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Loader2,
    Mail,
    MailCheck,
    Plus,
    Send,
} from "lucide-react"
import type { ContentIdea, ContentIdeaType } from "@prisma/client"

import {
    IdeaDrawer,
    TypeBadge,
    isOverdue,
    newDraft,
    suggestedCategories,
    toDraft,
    type Draft,
} from "@/components/dashboard/ideas/IdeaBoard"
import {
    IDEA_TYPES,
    formatUpload,
    stageLabels,
    toUploadInput,
    typeLabels,
    uploadCountdown,
} from "@/lib/ideas/shared"

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const chipClass: Record<ContentIdeaType, string> = {
    VIDEO: "bg-red-500/10 text-red-600 dark:text-red-400",
    SHORT: "bg-zinc-900 text-white dark:bg-white dark:text-black",
}

const REMINDER_LEAD_MS = 24 * 60 * 60 * 1000

/** Calendar day (IST) of an upload: "YYYY-MM-DD" */
const istDayKey = (date: Date) => toUploadInput(date).slice(0, 10)
/** Time (IST) of an upload: "18:00" */
const istTime = (date: Date) => toUploadInput(date).slice(11, 16)

const pad = (n: number) => String(n).padStart(2, "0")

type MailStatus = { configured: boolean; recipients: string[] }


export default function ScheduleCalendar({
    ideas,
    mail,
    onSendTest,
}: {
    ideas: ContentIdea[]
    mail: MailStatus
    onSendTest: () => Promise<{ ok: true } | { ok: false; error: string }>
}) {
    const router = useRouter()
    const [now] = React.useState(() => new Date())
    const todayKey = istDayKey(now)

    const [month, setMonth] = React.useState(() => ({
        year: Number(todayKey.slice(0, 4)),
        month: Number(todayKey.slice(5, 7)) - 1,
    }))
    const [editing, setEditing] = React.useState<Draft | null>(null)

    const scheduled = ideas.filter((idea): idea is ContentIdea & { uploadAt: Date } => idea.uploadAt !== null)
    const upcoming = scheduled.filter((idea) => idea.stage !== "UPLOADED" && idea.uploadAt >= now)
    const overdue = scheduled.filter((idea) => isOverdue(idea, now))
    const unscheduled = ideas.filter((idea) => !idea.uploadAt && idea.stage !== "UPLOADED")

    const byDay = new Map<string, typeof scheduled>()
    for (const idea of scheduled) {
        const key = istDayKey(idea.uploadAt)
        byDay.set(key, [...(byDay.get(key) ?? []), idea])
    }

    /* CALENDAR GRID */

    const firstWeekday = new Date(Date.UTC(month.year, month.month, 1)).getUTCDay()
    const daysInMonth = new Date(Date.UTC(month.year, month.month + 1, 0)).getUTCDate()
    const cells: (string | null)[] = [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => `${month.year}-${pad(month.month + 1)}-${pad(i + 1)}`),
    ]
    while (cells.length % 7 !== 0) cells.push(null)

    const monthLabel = new Date(Date.UTC(month.year, month.month, 1)).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    })

    function shiftMonth(delta: number) {
        setMonth(({ year, month }) => {
            const next = new Date(Date.UTC(year, month + delta, 1))
            return { year: next.getUTCFullYear(), month: next.getUTCMonth() }
        })
    }

    function goToToday() {
        setMonth({ year: Number(todayKey.slice(0, 4)), month: Number(todayKey.slice(5, 7)) - 1 })
    }

    /** New post on a day — defaults to 6 pm IST */
    function scheduleOn(day?: string) {
        setEditing(newDraft({ uploadAt: `${day ?? todayKey}T18:00` }))
    }

    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* HEADER */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">Content</p>
                    <h1 className="text-lg font-semibold">Schedule</h1>
                </div>

                <button
                    type="button"
                    onClick={() => scheduleOn()}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                    <Plus size={16} />
                    Schedule Post
                </button>
            </header>

            <main className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[1fr_320px]">

                <div className="min-w-0 space-y-6">
                    {/* CALENDAR */}
                    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <CalendarDays size={17} className="text-zinc-400" />
                                <h2 className="font-semibold">{monthLabel}</h2>
                                <span className="text-xs text-zinc-400">IST</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    aria-label="Previous month"
                                    onClick={() => shiftMonth(-1)}
                                    className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={goToToday}
                                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    aria-label="Next month"
                                    onClick={() => shiftMonth(1)}
                                    className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
                            {weekDays.map((day) => (
                                <div key={day} className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7">
                            {cells.map((key, index) => {
                                if (!key) {
                                    return (
                                        <div
                                            key={`empty-${index}`}
                                            className="min-h-24 border-b border-r border-zinc-100 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-900/20"
                                        />
                                    )
                                }

                                const dayItems = byDay.get(key) ?? []
                                const isToday = key === todayKey
                                const isPast = key < todayKey

                                return (
                                    <div
                                        key={key}
                                        onClick={() => scheduleOn(key)}
                                        className={`group min-h-24 cursor-pointer border-b border-r border-zinc-100 p-1.5 transition hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50 ${isPast ? "bg-zinc-50/40 dark:bg-zinc-900/10" : ""}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${isToday
                                                    ? "bg-red-600 font-semibold text-white"
                                                    : isPast ? "text-zinc-300 dark:text-zinc-700" : "text-zinc-500"
                                                    }`}
                                            >
                                                {Number(key.slice(8))}
                                            </span>
                                            <Plus size={12} className="text-zinc-300 opacity-0 transition group-hover:opacity-100 dark:text-zinc-700" />
                                        </div>

                                        <div className="mt-1 space-y-1">
                                            {dayItems.map((idea) => {
                                                const done = idea.stage === "UPLOADED"
                                                const late = isOverdue(idea, now)
                                                return (
                                                    <button
                                                        key={idea.id}
                                                        type="button"
                                                        title={`${typeLabels[idea.type]} · ${stageLabels[idea.stage]} · ${formatUpload(idea.uploadAt)}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setEditing(toDraft(idea))
                                                        }}
                                                        className={`flex w-full items-center gap-1 truncate rounded px-1.5 py-1 text-left text-[10px] font-medium ${chipClass[idea.type]} ${done ? "opacity-50" : ""} ${late ? "ring-1 ring-red-500" : ""}`}
                                                    >
                                                        {done && <Check size={10} className="shrink-0" />}
                                                        <span className="shrink-0 tabular-nums opacity-70">{istTime(idea.uploadAt)}</span>
                                                        <span className="truncate">{idea.title}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* NOT SCHEDULED */}
                    {unscheduled.length > 0 && (
                        <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                                <h2 className="font-semibold">Not scheduled yet</h2>
                                <p className="mt-1 text-xs text-zinc-500">Ideas without an upload time — open one to schedule it</p>
                            </div>
                            <div className="grid divide-y divide-zinc-200 md:grid-cols-2 md:divide-y-0 dark:divide-zinc-800">
                                {unscheduled.map((idea) => (
                                    <button
                                        key={idea.id}
                                        type="button"
                                        onClick={() => setEditing(toDraft(idea))}
                                        className="flex items-center gap-3 px-5 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                    >
                                        <TypeBadge type={idea.type} />
                                        <span className="min-w-0 flex-1 truncate text-sm">{idea.title}</span>
                                        <span className="shrink-0 text-[10px] text-zinc-500">{stageLabels[idea.stage]}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}
                </div>


                {/* SIDEBAR */}
                <div className="space-y-6">

                    <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                            <h2 className="font-semibold">Upcoming</h2>
                            <p className="mt-1 text-xs text-zinc-500">
                                {upcoming.length} scheduled
                                {overdue.length > 0 && <span className="text-red-500"> · {overdue.length} overdue</span>}
                            </p>
                        </div>

                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {[...overdue, ...upcoming].map((idea) => (
                                <button
                                    key={idea.id}
                                    type="button"
                                    onClick={() => setEditing(toDraft(idea))}
                                    className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <TypeBadge type={idea.type} />
                                            <span className={`text-[10px] font-medium ${isOverdue(idea, now) ? "text-red-500" : "text-zinc-500"}`}>
                                                {isOverdue(idea, now) ? "Overdue" : uploadCountdown(idea.uploadAt, now)}
                                            </span>
                                        </div>
                                        <p className="mt-1.5 truncate text-sm font-medium">{idea.title}</p>
                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                                            <Clock3 size={11} />
                                            {formatUpload(idea.uploadAt)} · {stageLabels[idea.stage]}
                                        </p>
                                        {!isOverdue(idea, now) && <ReminderStatus idea={idea} now={now} />}
                                    </div>
                                </button>
                            ))}

                            {upcoming.length + overdue.length === 0 && (
                                <p className="px-5 py-8 text-center text-xs text-zinc-500">Nothing scheduled yet.</p>
                            )}
                        </div>
                    </section>

                    <EmailCard mail={mail} onSendTest={onSendTest} />

                    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                        <p className="text-sm font-semibold">Legend</p>
                        <div className="mt-4 space-y-2 text-xs">
                            {IDEA_TYPES.map((type) => (
                                <div key={type} className="flex items-center gap-2">
                                    <span className={`h-3 w-3 rounded ${chipClass[type]}`} />
                                    {type === "VIDEO" ? "Long video" : "Short"}
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded ring-1 ring-red-500" />
                                Overdue — time passed, not marked uploaded
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={12} className="text-zinc-400" />
                                Uploaded
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {editing && (
                <IdeaDrawer
                    initial={editing}
                    categories={[...new Set([...ideas.flatMap((i) => i.category ?? []), ...suggestedCategories])]}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null)
                        router.refresh()
                    }}
                />
            )}
        </div>
    )
}


/** "Reminder sent" / "Reminder on its way" / "Reminder Tue, 13 Oct, 6:00 pm" */
function ReminderStatus({ idea, now }: { idea: ContentIdea & { uploadAt: Date }; now: Date }) {
    const remindAt = new Date(idea.uploadAt.getTime() - REMINDER_LEAD_MS)

    const [Icon, text] = idea.reminderSentAt
        ? [MailCheck, `Reminder emailed ${formatUpload(idea.reminderSentAt)}`]
        : remindAt <= now
            ? [Mail, "Reminder goes out within the hour"]
            : [Mail, `Reminder ${formatUpload(remindAt)}`]

    return (
        <p className={`mt-1 flex items-center gap-1.5 text-[11px] ${idea.reminderSentAt ? "text-green-600" : "text-zinc-400"}`}>
            <Icon size={11} />
            {text}
        </p>
    )
}


function EmailCard({
    mail,
    onSendTest,
}: {
    mail: MailStatus
    onSendTest: () => Promise<{ ok: true } | { ok: false; error: string }>
}) {
    const [pending, startTransition] = React.useTransition()
    const [result, setResult] = React.useState<{ ok: boolean; text: string } | null>(null)

    function sendTest() {
        setResult(null)
        startTransition(async () => {
            const res = await onSendTest()
            setResult(res.ok ? { ok: true, text: "Test email sent — check your inbox" } : { ok: false, text: res.error })
        })
    }

    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Email reminders</p>
                <span
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${mail.configured
                        ? "bg-green-500/10 text-green-600"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900"
                        }`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${mail.configured ? "bg-green-500" : "bg-zinc-400"}`} />
                    {mail.configured ? "On" : "Not set up"}
                </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
                About a day before each scheduled upload, an email goes to{" "}
                <span className="text-zinc-900 dark:text-white">{mail.recipients.join(", ") || "no one yet"}</span>.
            </p>

            {mail.configured ? (
                <button
                    type="button"
                    onClick={sendTest}
                    disabled={pending}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                    {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Send test email
                </button>
            ) : (
                <ol className="mt-3 list-decimal space-y-1 pl-4 text-[11px] leading-5 text-zinc-500">
                    <li>Turn on 2-Step Verification for your Google account, then create an <strong>App Password</strong>.</li>
                    <li>In <code>.env</code> set <code>GMAIL_USER</code> and <code>GMAIL_APP_PASSWORD</code>, then restart the server.</li>
                </ol>
            )}

            {result && (
                <p className={`mt-3 text-[11px] leading-4 ${result.ok ? "text-green-600" : "text-red-500"}`}>{result.text}</p>
            )}
        </section>
    )
}
