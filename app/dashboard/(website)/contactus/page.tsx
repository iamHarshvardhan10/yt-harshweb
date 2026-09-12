
"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
    Archive,
    ArrowLeft,
    Check,
    ChevronDown,
    Clock,
    Mail,
    MailOpen,
    MoreHorizontal,
    Reply,
    Search,
    Send,
    Star,
    Trash2,
    User,
    X,
    Inbox,
    AlertCircle,
} from "lucide-react"

type MessageStatus = "unread" | "read" | "replied" | "archived"

type ContactMessage = {
    id: string
    name: string
    email: string
    subject: string
    message: string
    date: string
    time: string
    status: MessageStatus
    starred: boolean
    priority: "normal" | "high"
    source: string
}

const mockMessages: ContactMessage[] = [
    {
        id: "msg_001",
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        subject: "Question about your Mumbai flood investigation",
        message:
            "Hi Harsh, I recently watched your investigation on Mumbai floods. I wanted to know if you have considered looking into the drainage projects completed in the last five years and whether the promised improvements actually reduced flooding in affected areas.",
        date: "2026-09-12",
        time: "03:42 PM",
        status: "unread",
        starred: true,
        priority: "high",
        source: "Contact Form",
    },
    {
        id: "msg_002",
        name: "Priya Mehta",
        email: "priya.mehta@example.com",
        subject: "Suggestion for an investigation",
        message:
            "Hello, I have been following your videos for a while. I think you should investigate the current condition of public hospitals and the availability of essential medicines.",
        date: "2026-09-12",
        time: "01:18 PM",
        status: "read",
        starred: false,
        priority: "normal",
        source: "Contact Form",
    },
    {
        id: "msg_003",
        name: "Aditya Kulkarni",
        email: "aditya.k@example.com",
        subject: "Collaboration opportunity",
        message:
            "Hi Harsh, I work with a research organization and would like to discuss a possible collaboration around data-driven investigations. Please let me know if you are open to discussing this.",
        date: "2026-09-11",
        time: "06:27 PM",
        status: "replied",
        starred: true,
        priority: "normal",
        source: "Contact Form",
    },
    {
        id: "msg_004",
        name: "Sneha Patil",
        email: "sneha.patil@example.com",
        subject: "Information regarding E20 investigation",
        message:
            "I wanted to share some information related to E20 fuel compatibility. I have collected some documents that might be useful for your research.",
        date: "2026-09-11",
        time: "11:05 AM",
        status: "unread",
        starred: false,
        priority: "normal",
        source: "Contact Form",
    },
    {
        id: "msg_005",
        name: "Vikram Joshi",
        email: "vikram.joshi@example.com",
        subject: "Great work!",
        message:
            "Just wanted to say that I really appreciate the research and effort that goes into your videos. Keep up the good work.",
        date: "2026-09-10",
        time: "09:14 PM",
        status: "read",
        starred: false,
        priority: "normal",
        source: "Contact Form",
    },
    {
        id: "msg_006",
        name: "Ananya Deshmukh",
        email: "ananya.d@example.com",
        subject: "Nepal glacier investigation",
        message:
            "I watched your recent video about the hanging glaciers in the Himalayas. Could you consider covering how early warning systems work in the Alaknanda basin?",
        date: "2026-09-09",
        time: "04:38 PM",
        status: "archived",
        starred: false,
        priority: "normal",
        source: "Contact Form",
    },
]

const filters = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Read", value: "read" },
    { label: "Replied", value: "replied" },
    { label: "Archived", value: "archived" },
]

export default function ContactPage() {
    const [messages, setMessages] =
        useState<ContactMessage[]>(mockMessages)

    const [activeFilter, setActiveFilter] = useState("all")
    const [search, setSearch] = useState("")
    const [selectedMessage, setSelectedMessage] =
        useState<ContactMessage | null>(null)

    const [showMenu, setShowMenu] = useState<string | null>(null)

    const stats = useMemo(() => {
        return {
            total: messages.length,
            unread: messages.filter(
                (message) => message.status === "unread"
            ).length,
            today: messages.filter(
                (message) => message.date === "2026-09-12"
            ).length,
            replied: messages.filter(
                (message) => message.status === "replied"
            ).length,
        }
    }, [messages])

    const filteredMessages = useMemo(() => {
        return messages.filter((message) => {
            const matchesFilter =
                activeFilter === "all" ||
                message.status === activeFilter

            const searchText = search.toLowerCase()

            const matchesSearch =
                !searchText ||
                message.name.toLowerCase().includes(searchText) ||
                message.email.toLowerCase().includes(searchText) ||
                message.subject.toLowerCase().includes(searchText) ||
                message.message.toLowerCase().includes(searchText)

            return matchesFilter && matchesSearch
        })
    }, [messages, activeFilter, search])

    const updateMessage = (
        id: string,
        updates: Partial<ContactMessage>
    ) => {
        setMessages((prev) =>
            prev.map((message) =>
                message.id === id
                    ? { ...message, ...updates }
                    : message
            )
        )

        setSelectedMessage((prev) =>
            prev?.id === id
                ? { ...prev, ...updates }
                : prev
        )
    }

    const toggleStar = (id: string) => {
        const message = messages.find((item) => item.id === id)

        if (!message) return

        updateMessage(id, {
            starred: !message.starred,
        })
    }

    const markAsRead = (id: string) => {
        updateMessage(id, {
            status: "read",
        })
    }

    const archiveMessage = (id: string) => {
        updateMessage(id, {
            status: "archived",
        })
    }

    const deleteMessage = (id: string) => {
        setMessages((prev) =>
            prev.filter((message) => message.id !== id)
        )

        if (selectedMessage?.id === id) {
            setSelectedMessage(null)
        }
    }

    const openMessage = (message: ContactMessage) => {
        setSelectedMessage(message)

        if (message.status === "unread") {
            markAsRead(message.id)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur">
                <div className="flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#151515] text-white/60 transition hover:bg-white/5 hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>

                        <div>
                            <h1 className="text-lg font-semibold">
                                Contact Messages
                            </h1>

                            <p className="text-xs text-white/40">
                                Manage messages received from your website
                            </p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2">
                            <span className="h-2 w-2 rounded-full bg-green-500" />

                            <span className="text-xs text-green-400">
                                Contact form active
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1500px] px-6 py-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    <StatCard
                        label="Total Messages"
                        value={stats.total}
                        icon={<Inbox className="h-4 w-4" />}
                    />

                    <StatCard
                        label="Unread"
                        value={stats.unread}
                        icon={<Mail className="h-4 w-4" />}
                        accent
                    />

                    <StatCard
                        label="Received Today"
                        value={stats.today}
                        icon={<Clock className="h-4 w-4" />}
                    />

                    <StatCard
                        label="Replied"
                        value={stats.replied}
                        icon={<Reply className="h-4 w-4" />}
                    />
                </div>

                {/* Inbox */}
                <section className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-[#151515]">
                    {/* Toolbar */}
                    <div className="border-b border-white/10">
                        <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                            {/* Filters */}
                            <div className="flex items-center gap-1 overflow-x-auto">
                                {filters.map((filter) => {
                                    const count =
                                        filter.value === "all"
                                            ? messages.length
                                            : messages.filter(
                                                (message) =>
                                                    message.status === filter.value
                                            ).length

                                    return (
                                        <button
                                            key={filter.value}
                                            onClick={() =>
                                                setActiveFilter(filter.value)
                                            }
                                            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${activeFilter === filter.value
                                                    ? "bg-red-600/10 text-red-500"
                                                    : "text-white/40 hover:bg-white/5 hover:text-white"
                                                }`}
                                        >
                                            {filter.label}

                                            <span
                                                className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeFilter === filter.value
                                                        ? "bg-red-600 text-white"
                                                        : "bg-white/5 text-white/30"
                                                    }`}
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Search */}
                            <div className="relative w-full lg:w-72">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                                <input
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search messages..."
                                    className="w-full rounded-lg border border-white/10 bg-[#101010] py-2.5 pl-9 pr-3 text-xs outline-none transition placeholder:text-white/20 focus:border-red-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Message list */}
                    <div>
                        {filteredMessages.length === 0 ? (
                            <EmptyState />
                        ) : (
                            filteredMessages.map((message) => (
                                <MessageRow
                                    key={message.id}
                                    message={message}
                                    onClick={() => openMessage(message)}
                                    onStar={() => toggleStar(message.id)}
                                    onArchive={() =>
                                        archiveMessage(message.id)
                                    }
                                    onDelete={() =>
                                        deleteMessage(message.id)
                                    }
                                    showMenu={showMenu === message.id}
                                    setShowMenu={setShowMenu}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
                        <p className="text-[11px] text-white/30">
                            Showing {filteredMessages.length} of{" "}
                            {messages.length} messages
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                disabled
                                className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/20"
                            >
                                Previous
                            </button>

                            <span className="rounded-lg bg-white/5 px-3 py-1.5 text-[11px] text-white/50">
                                1
                            </span>

                            <button
                                disabled
                                className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/20"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Message Drawer */}
            {selectedMessage && (
                <div className="fixed inset-0 z-50">
                    {/* Overlay */}
                    <button
                        aria-label="Close message"
                        onClick={() => setSelectedMessage(null)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                    />

                    {/* Drawer */}
                    <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-[#111111] shadow-2xl">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/10 text-red-500">
                                    <MailOpen className="h-4 w-4" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold">
                                        Message Details
                                    </p>

                                    <p className="text-[11px] text-white/30">
                                        {selectedMessage.source}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Sender */}
                            <div className="border-b border-white/10 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                                            {selectedMessage.name
                                                .split(" ")
                                                .map((name) => name[0])
                                                .join("")
                                                .slice(0, 2)}
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">
                                                {selectedMessage.name}
                                            </p>

                                            <a
                                                href={`mailto:${selectedMessage.email}`}
                                                className="text-xs text-white/40 hover:text-red-500"
                                            >
                                                {selectedMessage.email}
                                            </a>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            toggleStar(selectedMessage.id)
                                        }
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${selectedMessage.starred
                                                ? "bg-yellow-500/10 text-yellow-500"
                                                : "text-white/30 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <Star
                                            className="h-4 w-4"
                                            fill={
                                                selectedMessage.starred
                                                    ? "currentColor"
                                                    : "none"
                                            }
                                        />
                                    </button>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <StatusBadge
                                        status={selectedMessage.status}
                                    />

                                    {selectedMessage.priority === "high" && (
                                        <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-400">
                                            <AlertCircle className="h-3 w-3" />
                                            High Priority
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="border-b border-white/10 p-5">
                                <p className="text-[10px] uppercase tracking-wider text-white/30">
                                    Subject
                                </p>

                                <h2 className="mt-2 text-base font-semibold leading-6">
                                    {selectedMessage.subject}
                                </h2>

                                <div className="mt-2 flex items-center gap-2 text-[11px] text-white/30">
                                    <Clock className="h-3 w-3" />

                                    {selectedMessage.date} at{" "}
                                    {selectedMessage.time}
                                </div>
                            </div>

                            {/* Message */}
                            <div className="p-5">
                                <p className="mb-3 text-[10px] uppercase tracking-wider text-white/30">
                                    Message
                                </p>

                                <div className="rounded-xl border border-white/10 bg-[#151515] p-4">
                                    <p className="whitespace-pre-wrap text-sm leading-7 text-white/70">
                                        {selectedMessage.message}
                                    </p>
                                </div>
                            </div>

                            {/* Message Metadata */}
                            <div className="px-5 pb-5">
                                <div className="grid grid-cols-2 gap-3">
                                    <InfoBox
                                        label="Source"
                                        value={selectedMessage.source}
                                    />

                                    <InfoBox
                                        label="Message ID"
                                        value={selectedMessage.id}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="border-t border-white/10 bg-[#151515] p-4">
                            <div className="flex gap-2">
                                <a
                                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                    onClick={() =>
                                        updateMessage(selectedMessage.id, {
                                            status: "replied",
                                        })
                                    }
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-medium transition hover:bg-red-700"
                                >
                                    <Reply className="h-4 w-4" />
                                    Reply
                                </a>

                                <button
                                    onClick={() =>
                                        archiveMessage(selectedMessage.id)
                                    }
                                    className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
                                >
                                    <Archive className="h-4 w-4" />
                                    Archive
                                </button>

                                <button
                                    onClick={() =>
                                        deleteMessage(selectedMessage.id)
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/10 text-red-400 transition hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    )
}

/* ---------------------------------------------
   Message Row
--------------------------------------------- */

function MessageRow({
    message,
    onClick,
    onStar,
    onArchive,
    onDelete,
    showMenu,
    setShowMenu,
}: {
    message: ContactMessage
    onClick: () => void
    onStar: () => void
    onArchive: () => void
    onDelete: () => void
    showMenu: boolean
    setShowMenu: (id: string | null) => void
}) {
    const isUnread = message.status === "unread"

    return (
        <div
            className={`group flex items-center gap-3 border-b border-white/5 px-5 py-4 transition hover:bg-white/[0.025] ${isUnread ? "bg-white/[0.015]" : ""
                }`}
        >
            {/* Checkbox */}
            <button
                onClick={onClick}
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/20 hover:border-red-500"
            />

            {/* Star */}
            <button
                onClick={onStar}
                className={`shrink-0 transition ${message.starred
                        ? "text-yellow-500"
                        : "text-white/20 hover:text-white/60"
                    }`}
            >
                <Star
                    className="h-4 w-4"
                    fill={
                        message.starred ? "currentColor" : "none"
                    }
                />
            </button>

            {/* Sender */}
            <button
                onClick={onClick}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
                <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${isUnread
                            ? "bg-red-600/10 text-red-500"
                            : "bg-white/10 text-white/50"
                        }`}
                >
                    {message.name
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)}
                </div>

                <div className="min-w-0 w-40">
                    <p
                        className={`truncate text-xs ${isUnread
                                ? "font-semibold text-white"
                                : "text-white/60"
                            }`}
                    >
                        {message.name}
                    </p>

                    <p className="truncate text-[10px] text-white/30">
                        {message.email}
                    </p>
                </div>

                <div className="min-w-0 flex-1">
                    <p
                        className={`truncate text-xs ${isUnread
                                ? "font-semibold text-white"
                                : "text-white/60"
                            }`}
                    >
                        {message.subject}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-white/25">
                        {message.message}
                    </p>
                </div>
            </button>

            {/* Priority */}
            {message.priority === "high" && (
                <span className="hidden rounded-full bg-red-500/10 px-2 py-1 text-[9px] font-medium text-red-400 lg:block">
                    High
                </span>
            )}

            {/* Status */}
            <div className="hidden w-20 lg:block">
                <StatusBadge status={message.status} />
            </div>

            {/* Date */}
            <div className="hidden w-28 text-right md:block">
                <p className="text-[11px] text-white/40">
                    {message.date}
                </p>

                <p className="mt-0.5 text-[10px] text-white/20">
                    {message.time}
                </p>
            </div>

            {/* Menu */}
            <div className="relative">
                <button
                    onClick={() =>
                        setShowMenu(showMenu ? null : message.id)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/20 opacity-0 transition hover:bg-white/5 hover:text-white group-hover:opacity-100"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>

                {showMenu && (
                    <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-lg border border-white/10 bg-[#181818] shadow-xl">
                        <button
                            onClick={() => {
                                onClick()
                                setShowMenu(null)
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-white/60 hover:bg-white/5 hover:text-white"
                        >
                            <MailOpen className="h-3.5 w-3.5" />
                            Open message
                        </button>

                        <button
                            onClick={() => {
                                onArchive()
                                setShowMenu(null)
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-white/60 hover:bg-white/5 hover:text-white"
                        >
                            <Archive className="h-3.5 w-3.5" />
                            Archive
                        </button>

                        <button
                            onClick={() => {
                                onDelete()
                                setShowMenu(null)
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ---------------------------------------------
   Status Badge
--------------------------------------------- */

function StatusBadge({
    status,
}: {
    status: MessageStatus
}) {
    const config = {
        unread: {
            label: "Unread",
            className: "bg-red-500/10 text-red-400",
        },
        read: {
            label: "Read",
            className: "bg-white/5 text-white/40",
        },
        replied: {
            label: "Replied",
            className: "bg-green-500/10 text-green-400",
        },
        archived: {
            label: "Archived",
            className: "bg-white/5 text-white/30",
        },
    }

    const current = config[status]

    return (
        <span
            className={`inline-flex rounded-full px-2 py-1 text-[9px] font-medium ${current.className}`}
        >
            {current.label}
        </span>
    )
}

/* ---------------------------------------------
   Stat Card
--------------------------------------------- */

function StatCard({
    label,
    value,
    icon,
    accent = false,
}: {
    label: string
    value: number
    icon: React.ReactNode
    accent?: boolean
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-[#151515] p-4">
            <div className="flex items-center justify-between">
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent
                            ? "bg-red-600/10 text-red-500"
                            : "bg-white/5 text-white/40"
                        }`}
                >
                    {icon}
                </div>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight">
                {value}
            </p>

            <p className="mt-1 text-xs text-white/35">
                {label}
            </p>
        </div>
    )
}

/* ---------------------------------------------
   Info Box
--------------------------------------------- */

function InfoBox({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-lg border border-white/10 bg-[#101010] p-3">
            <p className="text-[9px] uppercase tracking-wider text-white/25">
                {label}
            </p>

            <p className="mt-1 truncate text-[11px] text-white/50">
                {value}
            </p>
        </div>
    )
}

/* ---------------------------------------------
   Empty State
--------------------------------------------- */

function EmptyState() {
    return (
        <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Mail className="h-5 w-5 text-white/25" />
            </div>

            <h3 className="mt-4 text-sm font-medium">
                No messages found
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-white/30">
                Messages submitted through your website contact form
                will appear here.
            </p>
        </div>
    )
}
