
"use client"

import {
    CalendarDays,
    Check,
    ChevronDown,
    Clock3,
    Download,
    Edit3,
    Eye,
    EyeOff,
    FileText,
    FolderOpen,
    MoreHorizontal,
    Plus,
    Search,
    Star,
    Trash2,
    Video,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

type InvestigationStatus = "published" | "draft" | "archived"

type Investigation = {
    id: string
    title: string
    slug: string
    summary: string
    category: string
    date: string
    status: InvestigationStatus
    pdfName: string
    pdfSize: string
    cover: string
    youtubeTitle: string
    youtubeId: string
    isVisible: boolean
    showOnHome: boolean
    featured: boolean
    allowDownload: boolean
    displayOrder: number
}

const initialInvestigations: Investigation[] = [
    {
        id: "1",
        title: "Why Mumbai Floods Every Monsoon",
        slug: "why-mumbai-floods-every-monsoon",
        summary:
            "An investigation into Mumbai's drainage infrastructure, flooding patterns and the systems behind recurring monsoon flooding.",
        category: "Infrastructure",
        date: "2026-09-12",
        status: "published",
        pdfName: "mumbai-flood-investigation.pdf",
        pdfSize: "8.4 MB",
        cover: "",
        youtubeTitle: "Why Mumbai Floods Every Monsoon",
        youtubeId: "abc123",
        isVisible: true,
        showOnHome: true,
        featured: true,
        allowDownload: true,
        displayOrder: 1,
    },
    {
        id: "2",
        title: "The Truth Behind India's E20 Fuel",
        slug: "truth-behind-india-e20-fuel",
        summary:
            "A detailed investigation into E20 fuel compatibility, vehicle readiness and the larger policy debate.",
        category: "Energy",
        date: "2026-09-08",
        status: "published",
        pdfName: "e20-fuel-investigation.pdf",
        pdfSize: "6.2 MB",
        cover: "",
        youtubeTitle: "The Truth Behind India's E20 Fuel",
        youtubeId: "xyz456",
        isVisible: true,
        showOnHome: false,
        featured: false,
        allowDownload: true,
        displayOrder: 2,
    },
    {
        id: "3",
        title: "Nepal Glacier Collapse & India's Flood Risk",
        slug: "nepal-glacier-collapse-india-flood-risk",
        summary:
            "Research document examining Himalayan hanging glaciers, glacier collapse and downstream flood risks.",
        category: "Environment",
        date: "2026-09-05",
        status: "draft",
        pdfName: "nepal-glacier-investigation.pdf",
        pdfSize: "11.8 MB",
        cover: "",
        youtubeTitle: "What Happened in Nepal?",
        youtubeId: "nep789",
        isVisible: false,
        showOnHome: false,
        featured: false,
        allowDownload: true,
        displayOrder: 3,
    },
    {
        id: "4",
        title: "How Dependent Is Tripura on Bangladesh?",
        slug: "tripura-dependence-on-bangladesh",
        summary:
            "An investigation into Tripura's geographical position, connectivity and dependence on routes through Bangladesh.",
        category: "Geopolitics",
        date: "2026-09-02",
        status: "published",
        pdfName: "tripura-bangladesh-investigation.pdf",
        pdfSize: "5.6 MB",
        cover: "",
        youtubeTitle: "How Dependent Is Tripura on Bangladesh?",
        youtubeId: "tri321",
        isVisible: true,
        showOnHome: false,
        featured: false,
        allowDownload: true,
        displayOrder: 4,
    },
]

export default function InvestigationsPage() {
    const [investigations, setInvestigations] =
        useState<Investigation[]>(initialInvestigations)

    const [activeTab, setActiveTab] = useState<
        "all" | "published" | "draft" | "archived"
    >("all")

    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("all")
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const filteredInvestigations = useMemo(() => {
        return investigations.filter((item) => {
            const matchesTab =
                activeTab === "all" || item.status === activeTab

            const query = search.toLowerCase().trim()

            const matchesSearch =
                !query ||
                item.title.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.youtubeTitle.toLowerCase().includes(query)

            const matchesCategory =
                category === "all" || item.category === category

            return matchesTab && matchesSearch && matchesCategory
        })
    }, [investigations, activeTab, search, category])

    const stats = {
        total: investigations.length,
        published: investigations.filter(
            (item) => item.status === "published"
        ).length,
        drafts: investigations.filter(
            (item) => item.status === "draft"
        ).length,
        visible: investigations.filter(
            (item) => item.isVisible
        ).length,
    }

    function toggleVisibility(id: string) {
        setInvestigations((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        isVisible: !item.isVisible,
                    }
                    : item
            )
        )
    }

    function toggleFeatured(id: string) {
        setInvestigations((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        featured: !item.featured,
                    }
                    : item
            )
        )
    }

    function deleteInvestigation(id: string) {
        setInvestigations((current) =>
            current.filter((item) => item.id !== id)
        )
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            {/* Header */}
            <div className="border-b border-white/10">
                <div className="flex items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/10">
                            <FileText className="h-5 w-5 text-red-500" />
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold">
                                Investigations
                            </h1>

                            <p className="mt-0.5 text-sm text-white/40">
                                Manage research documents connected to
                                your videos.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/investigations/new"
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium transition hover:bg-red-500"
                    >
                        <Plus className="h-4 w-4" />
                        New Investigation
                    </Link>
                </div>
            </div>

            <div className="p-6">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={
                            <FolderOpen className="h-5 w-5" />
                        }
                        label="Total Investigations"
                        value={stats.total}
                    />

                    <StatCard
                        icon={<Check className="h-5 w-5" />}
                        label="Published"
                        value={stats.published}
                    />

                    <StatCard
                        icon={<Clock3 className="h-5 w-5" />}
                        label="Drafts"
                        value={stats.drafts}
                    />

                    <StatCard
                        icon={<Eye className="h-5 w-5" />}
                        label="Visible on Website"
                        value={stats.visible}
                    />
                </div>

                {/* Main Table */}
                <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-[#151515]">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-4 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto">
                            <TabButton
                                active={activeTab === "all"}
                                onClick={() =>
                                    setActiveTab("all")
                                }
                            >
                                All
                            </TabButton>

                            <TabButton
                                active={activeTab === "published"}
                                onClick={() =>
                                    setActiveTab("published")
                                }
                            >
                                Published
                            </TabButton>

                            <TabButton
                                active={activeTab === "draft"}
                                onClick={() =>
                                    setActiveTab("draft")
                                }
                            >
                                Drafts
                            </TabButton>

                            <TabButton
                                active={activeTab === "archived"}
                                onClick={() =>
                                    setActiveTab("archived")
                                }
                            >
                                Archived
                            </TabButton>
                        </div>

                        {/* Search + Category */}
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                                <input
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search investigations..."
                                    className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-red-500/50 sm:w-64"
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(
                                            e.target.value
                                        )
                                    }
                                    className="h-9 appearance-none rounded-lg border border-white/10 bg-white/[0.03] px-3 pr-9 text-sm text-white/60 outline-none focus:border-red-500/50"
                                >
                                    <option
                                        value="all"
                                        className="bg-[#151515]"
                                    >
                                        All Categories
                                    </option>

                                    <option
                                        value="Infrastructure"
                                        className="bg-[#151515]"
                                    >
                                        Infrastructure
                                    </option>

                                    <option
                                        value="Energy"
                                        className="bg-[#151515]"
                                    >
                                        Energy
                                    </option>

                                    <option
                                        value="Environment"
                                        className="bg-[#151515]"
                                    >
                                        Environment
                                    </option>

                                    <option
                                        value="Geopolitics"
                                        className="bg-[#151515]"
                                    >
                                        Geopolitics
                                    </option>
                                </select>

                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                            </div>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="hidden grid-cols-[minmax(300px,1.8fr)_1.2fr_120px_120px_80px_40px] gap-4 border-b border-white/10 px-5 py-3 text-xs font-medium uppercase tracking-wide text-white/30 lg:grid">
                        <span>Investigation</span>
                        <span>Related Video</span>
                        <span>Date</span>
                        <span>Status</span>
                        <span>Website</span>
                        <span />
                    </div>

                    {/* Rows */}
                    <div>
                        {filteredInvestigations.length === 0 ? (
                            <EmptyState />
                        ) : (
                            filteredInvestigations.map(
                                (item) => (
                                    <InvestigationRow
                                        key={item.id}
                                        item={item}
                                        onToggleVisibility={() =>
                                            toggleVisibility(
                                                item.id
                                            )
                                        }
                                        onToggleFeatured={() =>
                                            toggleFeatured(
                                                item.id
                                            )
                                        }
                                        onDelete={() =>
                                            deleteInvestigation(
                                                item.id
                                            )
                                        }
                                        onSelect={() =>
                                            setSelectedId(
                                                item.id
                                            )
                                        }
                                    />
                                )
                            )
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-white/25">
                    <span>
                        Showing{" "}
                        {filteredInvestigations.length} of{" "}
                        {investigations.length} investigations
                    </span>

                    <span>Last updated just now</span>
                </div>
            </div>

            {/* Drawer */}
            {selectedId && (
                <InvestigationDrawer
                    investigation={
                        investigations.find(
                            (item) =>
                                item.id === selectedId
                        )!
                    }
                    onClose={() => setSelectedId(null)}
                    onToggleVisibility={() =>
                        toggleVisibility(selectedId)
                    }
                    onToggleFeatured={() =>
                        toggleFeatured(selectedId)
                    }
                />
            )}
        </div>
    )
}

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
        <div className="rounded-xl border border-white/10 bg-[#151515] p-5">
            <div className="flex items-center justify-between">
                <div className="text-white/35">
                    {icon}
                </div>

                <span className="text-xs text-white/20">
                    All time
                </span>
            </div>

            <div className="mt-5">
                <div className="text-2xl font-semibold">
                    {value}
                </div>

                <div className="mt-1 text-sm text-white/40">
                    {label}
                </div>
            </div>
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
            onClick={onClick}
            className={`rounded-md px-3 py-2 text-sm transition ${active
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                }`}
        >
            {children}
        </button>
    )
}

function InvestigationRow({
    item,
    onToggleVisibility,
    onToggleFeatured,
    onDelete,
    onSelect,
}: {
    item: Investigation
    onToggleVisibility: () => void
    onToggleFeatured: () => void
    onDelete: () => void
    onSelect: () => void
}) {
    return (
        <div className="group grid gap-4 border-b border-white/[0.07] px-5 py-4 transition last:border-b-0 hover:bg-white/[0.02] lg:grid-cols-[minmax(300px,1.8fr)_1.2fr_120px_120px_80px_40px] lg:items-center">
            {/* Investigation */}
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-11 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
                    <FileText className="h-5 w-5 text-red-500" />
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onSelect}
                            className="truncate text-left text-sm font-medium text-white hover:text-red-400"
                        >
                            {item.title}
                        </button>

                        {item.featured && (
                            <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
                        )}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-white/35">
                            {item.category}
                        </span>

                        <span className="text-white/15">
                            •
                        </span>

                        <span className="text-xs text-white/25">
                            {item.pdfSize}
                        </span>
                    </div>
                </div>
            </div>

            {/* Related Video */}
            <div className="hidden min-w-0 lg:block">
                <div className="flex items-center gap-2">
                    <Video className="h-3.5 w-3.5 shrink-0 text-red-500" />

                    <span className="truncate text-xs text-white/50">
                        {item.youtubeTitle}
                    </span>
                </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-white/40">
                <CalendarDays className="h-3.5 w-3.5" />

                {formatDate(item.date)}
            </div>

            {/* Status */}
            <div>
                <StatusBadge status={item.status} />
            </div>

            {/* Website */}
            <div>
                <button
                    onClick={onToggleVisibility}
                    className={`relative h-5 w-9 rounded-full transition ${item.isVisible
                            ? "bg-red-600"
                            : "bg-white/10"
                        }`}
                    aria-label="Toggle website visibility"
                >
                    <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${item.isVisible
                                ? "left-[18px]"
                                : "left-0.5"
                            }`}
                    />
                </button>
            </div>

            {/* Menu */}
            <div className="relative flex justify-end">
                <details className="relative">
                    <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md text-white/30 hover:bg-white/10 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                    </summary>

                    <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-white/10 bg-[#1b1b1b] p-1 shadow-2xl">
                        <Link
                            href={`/dashboard/investigations/${item.id}`}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                        </Link>

                        <button
                            onClick={onToggleFeatured}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-white/60 hover:bg-white/5 hover:text-white"
                        >
                            <Star className="h-3.5 w-3.5" />

                            {item.featured
                                ? "Remove Featured"
                                : "Make Featured"}
                        </button>

                        <button
                            onClick={onDelete}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10"
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

function StatusBadge({
    status,
}: {
    status: InvestigationStatus
}) {
    const styles = {
        published:
            "bg-green-500/10 text-green-400",
        draft:
            "bg-yellow-500/10 text-yellow-400",
        archived:
            "bg-white/10 text-white/40",
    }

    const labels = {
        published: "Published",
        draft: "Draft",
        archived: "Archived",
    }

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}
        >
            {labels[status]}
        </span>
    )
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Search className="h-5 w-5 text-white/30" />
            </div>

            <h3 className="mt-4 text-sm font-medium">
                No investigations found
            </h3>

            <p className="mt-1 max-w-sm text-xs text-white/30">
                Try changing your search or filters.
            </p>
        </div>
    )
}

function InvestigationDrawer({
    investigation,
    onClose,
    onToggleVisibility,
    onToggleFeatured,
}: {
    investigation: Investigation
    onClose: () => void
    onToggleVisibility: () => void
    onToggleFeatured: () => void
}) {
    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <button
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                aria-label="Close drawer"
            />

            {/* Drawer */}
            <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#151515] shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-white/25">
                            Investigation
                        </p>

                        <h2 className="mt-1 text-base font-semibold">
                            Details
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-white/35 hover:bg-white/5 hover:text-white"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-6 p-6">
                    {/* PDF Cover */}
                    <div className="flex h-44 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                        <FileText className="h-12 w-12 text-red-500/70" />
                    </div>

                    {/* Content */}
                    <div>
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold">
                                {investigation.title}
                            </h3>

                            {investigation.featured && (
                                <Star className="mt-1 h-4 w-4 shrink-0 fill-yellow-500 text-yellow-500" />
                            )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-white/40">
                            {investigation.summary}
                        </p>
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <InfoBox
                            label="Category"
                            value={investigation.category}
                        />

                        <InfoBox
                            label="Date"
                            value={formatDate(
                                investigation.date
                            )}
                        />

                        <InfoBox
                            label="PDF"
                            value={investigation.pdfSize}
                        />

                        <InfoBox
                            label="Status"
                            value={investigation.status}
                        />
                    </div>

                    {/* Settings */}
                    <div className="overflow-hidden rounded-xl border border-white/10">
                        <SettingRow
                            icon={
                                investigation.isVisible ? (
                                    <Eye className="h-4 w-4" />
                                ) : (
                                    <EyeOff className="h-4 w-4" />
                                )
                            }
                            title="Show on website"
                            description="Make this investigation publicly visible."
                            enabled={
                                investigation.isVisible
                            }
                            onClick={onToggleVisibility}
                        />

                        <SettingRow
                            icon={
                                <Star className="h-4 w-4" />
                            }
                            title="Featured"
                            description="Highlight this investigation."
                            enabled={
                                investigation.featured
                            }
                            onClick={onToggleFeatured}
                        />

                        <SettingRow
                            icon={
                                <Download className="h-4 w-4" />
                            }
                            title="PDF downloads"
                            description="Allow visitors to download the document."
                            enabled={
                                investigation.allowDownload
                            }
                            onClick={() => { }}
                            last
                        />
                    </div>

                    {/* Related Video */}
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/25">
                            Related YouTube Video
                        </p>

                        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-600/10">
                                    <Video className="h-4 w-4 text-red-500" />
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm text-white/65">
                                        {
                                            investigation.youtubeTitle
                                        }
                                    </p>

                                    <p className="mt-0.5 text-xs text-white/25">
                                        YouTube
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit */}
                    <Link
                        href={`/dashboard/investigations/${investigation.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-medium transition hover:bg-red-500"
                    >
                        <Edit3 className="h-4 w-4" />
                        Edit Investigation
                    </Link>
                </div>
            </aside>
        </div>
    )
}

function SettingRow({
    icon,
    title,
    description,
    enabled,
    onClick,
    last = false,
}: {
    icon: React.ReactNode
    title: string
    description: string
    enabled: boolean
    onClick: () => void
    last?: boolean
}) {
    return (
        <div
            className={`flex items-center justify-between gap-4 p-4 ${!last
                    ? "border-b border-white/10"
                    : ""
                }`}
        >
            <div className="flex min-w-0 gap-3">
                <div className="mt-0.5 text-white/30">
                    {icon}
                </div>

                <div>
                    <p className="text-sm font-medium text-white/75">
                        {title}
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-white/30">
                        {description}
                    </p>
                </div>
            </div>

            <button
                onClick={onClick}
                className={`relative h-5 w-9 shrink-0 rounded-full transition ${enabled
                        ? "bg-red-600"
                        : "bg-white/10"
                    }`}
            >
                <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${enabled
                            ? "left-[18px]"
                            : "left-0.5"
                        }`}
                />
            </button>
        </div>
    )
}

function InfoBox({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <p className="text-[11px] uppercase tracking-wide text-white/25">
                {label}
            </p>

            <p className="mt-1 text-sm capitalize text-white/60">
                {value}
            </p>
        </div>
    )
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    )
}
