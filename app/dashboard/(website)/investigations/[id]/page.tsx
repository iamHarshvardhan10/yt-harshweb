
"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
    ArrowLeft,
    Calendar,
    Check,
    ChevronDown,
    FileText,
    Globe,
    Link2,
    Save,
    Search,
    Trash2,
    Upload,
    Video,
    Eye,
    EyeOff,
    Star,
    Download,
    ExternalLink,
    Image as ImageIcon,
    X,
} from "lucide-react"

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
    pdfUrl: string

    cover: string

    youtubeTitle: string
    youtubeId: string

    isVisible: boolean
    showOnHome: boolean
    featured: boolean
    allowDownload: boolean
    displayOrder: number

    tags: string[]

    metaTitle: string
    metaDescription: string
}

const mockInvestigation: Investigation = {
    id: "inv_001",
    title: "Why Mumbai Floods Every Monsoon",
    slug: "why-mumbai-floods-every-monsoon",
    summary:
        "An investigation into Mumbai's recurring monsoon flooding, urban infrastructure, drainage systems and the decisions that continue to shape the city's flood risk.",
    category: "Environment",
    date: "2026-09-10",
    status: "published",

    pdfName: "mumbai-flood-investigation.pdf",
    pdfSize: "4.8 MB",
    pdfUrl: "#",

    cover: "",

    youtubeTitle: "Why Mumbai Floods Every Monsoon",
    youtubeId: "dQw4w9WgXcQ",

    isVisible: true,
    showOnHome: true,
    featured: true,
    allowDownload: true,
    displayOrder: 1,

    tags: ["Mumbai", "Floods", "BMC", "Infrastructure", "Monsoon"],

    metaTitle: "Why Mumbai Floods Every Monsoon | Investigation",
    metaDescription:
        "A detailed investigation into Mumbai's recurring monsoon floods, drainage infrastructure and urban planning.",
}

const categories = [
    "Environment",
    "Politics",
    "Economy",
    "Infrastructure",
    "Technology",
    "Society",
    "International",
]

export default function InvestigationDetailsPage() {
    const [investigation, setInvestigation] =
        useState<Investigation>(mockInvestigation)

    const [tagInput, setTagInput] = useState("")
    const [saving, setSaving] = useState(false)
    const [showStatusMenu, setShowStatusMenu] = useState(false)

    const youtubeUrl = useMemo(
        () => `https://www.youtube.com/watch?v=${investigation.youtubeId}`,
        [investigation.youtubeId]
    )

    const updateField = <K extends keyof Investigation>(
        field: K,
        value: Investigation[K]
    ) => {
        setInvestigation((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const generateSlug = () => {
        const slug = investigation.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")

        updateField("slug", slug)
    }

    const addTag = () => {
        const value = tagInput.trim()

        if (!value) return

        if (!investigation.tags.includes(value)) {
            updateField("tags", [...investigation.tags, value])
        }

        setTagInput("")
    }

    const removeTag = (tag: string) => {
        updateField(
            "tags",
            investigation.tags.filter((item) => item !== tag)
        )
    }

    const handleSave = async () => {
        setSaving(true)

        // Replace this with your PATCH API later.
        await new Promise((resolve) => setTimeout(resolve, 800))

        setSaving(false)
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur">
                <div className="flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/investigations"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#151515] text-white/60 transition hover:bg-white/10 hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-semibold">
                                    Edit Investigation
                                </h1>

                                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[11px] font-medium text-green-400">
                                    {investigation.status}
                                </span>
                            </div>

                            <p className="text-xs text-white/40">
                                Manage investigation content and website settings
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={`/investigations/${investigation.slug}`}
                            target="_blank"
                            className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white sm:flex"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View page
                        </Link>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-6">
                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                    {/* Main editor */}
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <section className="rounded-xl border border-white/10 bg-[#151515]">
                            <div className="border-b border-white/10 px-5 py-4">
                                <h2 className="text-sm font-semibold">
                                    Basic Information
                                </h2>
                                <p className="mt-1 text-xs text-white/40">
                                    Main information displayed on the investigation page.
                                </p>
                            </div>

                            <div className="space-y-5 p-5">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-white/60">
                                        Investigation Title
                                    </label>

                                    <input
                                        value={investigation.title}
                                        onChange={(e) =>
                                            updateField("title", e.target.value)
                                        }
                                        className="w-full rounded-lg border border-white/10 bg-[#101010] px-3 py-2.5 text-sm outline-none transition placeholder:text-white/20 focus:border-red-600"
                                        placeholder="Enter investigation title"
                                    />
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-xs font-medium text-white/60">
                                            Slug
                                        </label>

                                        <button
                                            onClick={generateSlug}
                                            className="text-[11px] text-red-500 hover:text-red-400"
                                        >
                                            Generate from title
                                        </button>
                                    </div>

                                    <div className="flex items-center rounded-lg border border-white/10 bg-[#101010]">
                                        <span className="px-3 text-xs text-white/30">
                                            /investigations/
                                        </span>

                                        <input
                                            value={investigation.slug}
                                            onChange={(e) =>
                                                updateField("slug", e.target.value)
                                            }
                                            className="min-w-0 flex-1 bg-transparent px-0 py-2.5 text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-white/60">
                                        Summary
                                    </label>

                                    <textarea
                                        rows={5}
                                        value={investigation.summary}
                                        onChange={(e) =>
                                            updateField("summary", e.target.value)
                                        }
                                        className="w-full resize-none rounded-lg border border-white/10 bg-[#101010] px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-red-600"
                                        placeholder="Write a short summary..."
                                    />

                                    <div className="mt-1 text-right text-[11px] text-white/30">
                                        {investigation.summary.length} characters
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-xs font-medium text-white/60">
                                            Category
                                        </label>

                                        <div className="relative">
                                            <select
                                                value={investigation.category}
                                                onChange={(e) =>
                                                    updateField("category", e.target.value)
                                                }
                                                className="w-full appearance-none rounded-lg border border-white/10 bg-[#101010] px-3 py-2.5 text-sm outline-none focus:border-red-600"
                                            >
                                                {categories.map((category) => (
                                                    <option
                                                        key={category}
                                                        value={category}
                                                        className="bg-[#151515]"
                                                    >
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>

                                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-medium text-white/60">
                                            Publication Date
                                        </label>

                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                                            <input
                                                type="date"
                                                value={investigation.date}
                                                onChange={(e) =>
                                                    updateField("date", e.target.value)
                                                }
                                                className="w-full rounded-lg border border-white/10 bg-[#101010] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-red-600"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-white/60">
                                        Tags
                                    </label>

                                    <div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-[#101010] p-2">
                                        {investigation.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-xs text-white/70"
                                            >
                                                {tag}

                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className="text-white/40 hover:text-white"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}

                                        <input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault()
                                                    addTag()
                                                }
                                            }}
                                            placeholder="Add tag..."
                                            className="min-w-[100px] flex-1 bg-transparent px-1 py-1 text-xs outline-none placeholder:text-white/20"
                                        />
                                    </div>

                                    <p className="mt-1 text-[11px] text-white/30">
                                        Press Enter to add a tag.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Investigation PDF */}
                        <section className="rounded-xl border border-white/10 bg-[#151515]">
                            <div className="border-b border-white/10 px-5 py-4">
                                <h2 className="text-sm font-semibold">
                                    Investigation Document
                                </h2>

                                <p className="mt-1 text-xs text-white/40">
                                    Upload and manage the PDF displayed on the public website.
                                </p>
                            </div>

                            <div className="p-5">
                                <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#101010] p-4 sm:flex-row sm:items-center">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                                        <FileText className="h-7 w-7 text-red-500" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {investigation.pdfName}
                                        </p>

                                        <p className="mt-1 text-xs text-white/40">
                                            PDF • {investigation.pdfSize}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <a
                                            href={investigation.pdfUrl}
                                            target="_blank"
                                            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </a>

                                        <button className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:bg-white/5 hover:text-white">
                                            <Upload className="h-4 w-4" />
                                            Replace
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg border border-dashed border-white/10 bg-[#101010] p-6 text-center transition hover:border-red-600/50">
                                        <Upload className="mx-auto h-6 w-6 text-white/30" />

                                        <p className="mt-3 text-xs font-medium">
                                            Upload new PDF
                                        </p>

                                        <p className="mt-1 text-[11px] text-white/30">
                                            PDF files up to 25 MB
                                        </p>

                                        <button className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white">
                                            Choose File
                                        </button>
                                    </div>

                                    <div className="rounded-lg border border-dashed border-white/10 bg-[#101010] p-6 text-center transition hover:border-red-600/50">
                                        <ImageIcon className="mx-auto h-6 w-6 text-white/30" />

                                        <p className="mt-3 text-xs font-medium">
                                            Investigation Cover
                                        </p>

                                        <p className="mt-1 text-[11px] text-white/30">
                                            JPG, PNG or WebP
                                        </p>

                                        <button className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white">
                                            Upload Cover
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Related YouTube Video */}
                        <section className="rounded-xl border border-white/10 bg-[#151515]">
                            <div className="border-b border-white/10 px-5 py-4">
                                <h2 className="text-sm font-semibold">
                                    Related YouTube Video
                                </h2>

                                <p className="mt-1 text-xs text-white/40">
                                    Connect this investigation with its corresponding video.
                                </p>
                            </div>

                            <div className="space-y-4 p-5">
                                <div className="flex gap-4 rounded-xl border border-white/10 bg-[#101010] p-4">
                                    <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg bg-black">
                                        <Video className="h-6 w-6 text-white/30" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded bg-red-600/10 px-2 py-1 text-[10px] font-medium text-red-500">
                                                YouTube
                                            </span>

                                            <span className="text-[10px] text-white/30">
                                                {investigation.youtubeId}
                                            </span>
                                        </div>

                                        <h3 className="mt-2 truncate text-sm font-medium">
                                            {investigation.youtubeTitle}
                                        </h3>

                                        <a
                                            href={youtubeUrl}
                                            target="_blank"
                                            className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white"
                                        >
                                            Open on YouTube
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>

                                    <button className="self-start rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 hover:bg-white/5 hover:text-white">
                                        Change
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-white/10" />
                                    <span className="text-[10px] uppercase tracking-wider text-white/20">
                                        or
                                    </span>
                                    <div className="h-px flex-1 bg-white/10" />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-white/60">
                                        YouTube URL
                                    </label>

                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                                            <input
                                                placeholder="https://youtube.com/watch?v=..."
                                                className="w-full rounded-lg border border-white/10 bg-[#101010] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-red-600"
                                            />
                                        </div>

                                        <button className="rounded-lg bg-white/10 px-4 text-xs font-medium transition hover:bg-white/15">
                                            Connect
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SEO */}
                        <section className="rounded-xl border border-white/10 bg-[#151515]">
                            <div className="border-b border-white/10 px-5 py-4">
                                <h2 className="text-sm font-semibold">
                                    SEO Settings
                                </h2>

                                <p className="mt-1 text-xs text-white/40">
                                    Control how this investigation appears in search engines.
                                </p>
                            </div>

                            <div className="space-y-5 p-5">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-white/60">
                                        Meta Title
                                    </label>

                                    <input
                                        value={investigation.metaTitle}
                                        onChange={(e) =>
                                            updateField("metaTitle", e.target.value)
                                        }
                                        className="w-full rounded-lg border border-white/10 bg-[#101010] px-3 py-2.5 text-sm outline-none focus:border-red-600"
                                    />

                                    <p className="mt-1 text-[11px] text-white/30">
                                        {investigation.metaTitle.length}/60 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-white/60">
                                        Meta Description
                                    </label>

                                    <textarea
                                        rows={4}
                                        value={investigation.metaDescription}
                                        onChange={(e) =>
                                            updateField("metaDescription", e.target.value)
                                        }
                                        className="w-full resize-none rounded-lg border border-white/10 bg-[#101010] px-3 py-2.5 text-sm outline-none focus:border-red-600"
                                    />

                                    <p className="mt-1 text-[11px] text-white/30">
                                        {investigation.metaDescription.length}/160 characters
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Danger Zone */}
                        <section className="rounded-xl border border-red-500/20 bg-red-500/[0.03]">
                            <div className="border-b border-red-500/10 px-5 py-4">
                                <h2 className="text-sm font-semibold text-red-400">
                                    Danger Zone
                                </h2>
                            </div>

                            <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                                <div>
                                    <p className="text-sm font-medium">
                                        Delete investigation
                                    </p>

                                    <p className="mt-1 text-xs text-white/40">
                                        Permanently remove this investigation and its website
                                        configuration.
                                    </p>
                                </div>

                                <button className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Investigation
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right settings */}
                    <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                        {/* Publishing */}
                        <section className="rounded-xl border border-white/10 bg-[#151515]">
                            <div className="border-b border-white/10 px-5 py-4">
                                <h2 className="text-sm font-semibold">
                                    Publishing
                                </h2>
                            </div>

                            <div className="p-5">
                                <label className="mb-2 block text-xs font-medium text-white/60">
                                    Status
                                </label>

                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setShowStatusMenu((prev) => !prev)
                                        }
                                        className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-[#101010] px-3 py-2.5 text-sm"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span
                                                className={`h-2 w-2 rounded-full ${investigation.status === "published"
                                                        ? "bg-green-500"
                                                        : investigation.status === "draft"
                                                            ? "bg-yellow-500"
                                                            : "bg-white/30"
                                                    }`}
                                            />

                                            {investigation.status.charAt(0).toUpperCase() +
                                                investigation.status.slice(1)}
                                        </span>

                                        <ChevronDown className="h-4 w-4 text-white/40" />
                                    </button>

                                    {showStatusMenu && (
                                        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-white/10 bg-[#181818] shadow-xl">
                                            {(
                                                ["published", "draft", "archived"] as InvestigationStatus[]
                                            ).map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        updateField("status", status)
                                                        setShowStatusMenu(false)
                                                    }}
                                                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs hover:bg-white/5"
                                                >
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${status === "published"
                                                                ? "bg-green-500"
                                                                : status === "draft"
                                                                    ? "bg-yellow-500"
                                                                    : "bg-white/30"
                                                            }`}
                                                    />

                                                    {status.charAt(0).toUpperCase() +
                                                        status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Website Settings */}
                        <section className="rounded-xl border border-white/10 bg-[#151515]">
                            <div className="border-b border-white/10 px-5 py-4">
                                <h2 className="text-sm font-semibold">
                                    Website Settings
                                </h2>

                                <p className="mt-1 text-xs text-white/40">
                                    Control where this investigation appears.
                                </p>
                            </div>

                            <div className="divide-y divide-white/10">
                                <SettingRow
                                    icon={
                                        investigation.isVisible ? (
                                            <Eye className="h-4 w-4" />
                                        ) : (
                                            <EyeOff className="h-4 w-4" />
                                        )
                                    }
                                    title="Show on website"
                                    description="Make investigation publicly visible"
                                    enabled={investigation.isVisible}
                                    onToggle={() =>
                                        updateField(
                                            "isVisible",
                                            !investigation.isVisible
                                        )
                                    }
                                />

                                <SettingRow
                                    icon={<Globe className="h-4 w-4" />}
                                    title="Show on homepage"
                                    description="Display in homepage investigations"
                                    enabled={investigation.showOnHome}
                                    onToggle={() =>
                                        updateField(
                                            "showOnHome",
                                            !investigation.showOnHome
                                        )
                                    }
                                />

                                <SettingRow
                                    icon={<Star className="h-4 w-4" />}
                                    title="Featured"
                                    description="Highlight this investigation"
                                    enabled={investigation.featured}
                                    onToggle={() =>
                                        updateField(
                                            "featured",
                                            !investigation.featured
                                        )
                                    }
                                />

                                <SettingRow
                                    icon={<Download className="h-4 w-4" />}
                                    title="Allow PDF downloads"
                                    description="Visitors can download the PDF"
                                    enabled={investigation.allowDownload}
                                    onToggle={() =>
                                        updateField(
                                            "allowDownload",
                                            !investigation.allowDownload
                                        )
                                    }
                                />
                            </div>
                        </section>

                        {/* Display Order */}
                        <section className="rounded-xl border border-white/10 bg-[#151515]">
                            <div className="border-b border-white/10 px-5 py-4">
                                <h2 className="text-sm font-semibold">
                                    Display Order
                                </h2>
                            </div>

                            <div className="p-5">
                                <label className="mb-2 block text-xs font-medium text-white/60">
                                    Position
                                </label>

                                <input
                                    type="number"
                                    min={0}
                                    value={investigation.displayOrder}
                                    onChange={(e) =>
                                        updateField(
                                            "displayOrder",
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-full rounded-lg border border-white/10 bg-[#101010] px-3 py-2.5 text-sm outline-none focus:border-red-600"
                                />

                                <p className="mt-2 text-[11px] leading-5 text-white/30">
                                    Lower numbers appear first when investigations are sorted
                                    manually.
                                </p>
                            </div>
                        </section>

                        {/* Quick Info */}
                        <section className="rounded-xl border border-white/10 bg-[#151515]">
                            <div className="border-b border-white/10 px-5 py-4">
                                <h2 className="text-sm font-semibold">
                                    Investigation Info
                                </h2>
                            </div>

                            <div className="space-y-4 p-5">
                                <InfoRow
                                    label="Investigation ID"
                                    value={investigation.id}
                                />

                                <InfoRow
                                    label="PDF"
                                    value={investigation.pdfName}
                                />

                                <InfoRow
                                    label="Video ID"
                                    value={investigation.youtubeId}
                                />

                                <InfoRow
                                    label="Category"
                                    value={investigation.category}
                                />

                                <InfoRow
                                    label="Published"
                                    value={investigation.date}
                                />
                            </div>
                        </section>
                    </aside>
                </div>

                {/* Mobile save bar */}
                <div className="mt-6 flex justify-end border-t border-white/10 pt-6 xl:hidden">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </main>
        </div>
    )
}

/* ---------------------------------------------
   Setting Row
--------------------------------------------- */

function SettingRow({
    icon,
    title,
    description,
    enabled,
    onToggle,
}: {
    icon: React.ReactNode
    title: string
    description: string
    enabled: boolean
    onToggle: () => void
}) {
    return (
        <div className="flex items-center gap-3 px-5 py-4">
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${enabled
                        ? "bg-red-600/10 text-red-500"
                        : "bg-white/5 text-white/30"
                    }`}
            >
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{title}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-white/30">
                    {description}
                </p>
            </div>

            <button
                onClick={onToggle}
                aria-label={`Toggle ${title}`}
                className={`relative h-5 w-9 shrink-0 rounded-full transition ${enabled ? "bg-red-600" : "bg-white/10"
                    }`}
            >
                <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${enabled ? "left-[18px]" : "left-0.5"
                        }`}
                />

                {enabled && (
                    <Check className="absolute left-[21px] top-1 h-3 w-3 text-red-600" />
                )}
            </button>
        </div>
    )
}

/* ---------------------------------------------
   Info Row
--------------------------------------------- */

function InfoRow({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-wider text-white/30">
                {label}
            </p>

            <p className="mt-1 truncate text-xs text-white/60">
                {value}
            </p>
        </div>
    )
}
