"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    ExternalLink,
    FileText,
    Link2,
    Plus,
    Save,
    Trash2,
    Video,
    X,
} from "lucide-react"
import type { DocumentLanguage, InvestigationStatus } from "@prisma/client"

import { api, useAction } from "@/components/dashboard/home/api"
import {
    EditorSection,
    IconButton,
    PrimaryButton,
    SecondaryButton,
    StatusText,
    TextAreaField,
    TextField,
    ToggleRow,
    inputClass,
    labelClass,
} from "@/components/dashboard/home/ui"
import { StatusBadge } from "@/components/dashboard/investigations/InvestigationList"
import type { InvestigationWithDocuments } from "@/lib/investigations/queries"
import {
    LANGUAGES,
    languageLabels,
    slugify,
    STATUSES,
    statusLabels,
    youtubeIdFromUrl,
    youtubeThumbnail,
    youtubeWatchUrl,
} from "@/lib/investigations/shared"

export type ChannelVideo = { id: string; title: string; type: "video" | "short"; publishedAt: string }

type DocumentForm = {
    title: string
    description: string
    url: string
    pages: string
    readMinutes: string
}

type Form = {
    title: string
    slug: string
    summary: string
    category: string
    status: InvestigationStatus
    publishedAt: string // YYYY-MM-DD or ""
    youtubeVideoId: string
    keyFindings: string[]
    tags: string[]
    featured: boolean
    order: string
    metaTitle: string
    metaDescription: string
    documents: Record<DocumentLanguage, DocumentForm>
}

const suggestedCategories = [
    "Environment",
    "Politics",
    "Economy",
    "Infrastructure",
    "Technology",
    "Society",
    "International",
]

const emptyDocument: DocumentForm = { title: "", description: "", url: "", pages: "", readMinutes: "" }

function toForm(item: InvestigationWithDocuments | null): Form {
    const documents = Object.fromEntries(
        LANGUAGES.map((language) => {
            const doc = item?.documents.find((d) => d.language === language)
            return [
                language,
                doc
                    ? {
                        title: doc.title ?? "",
                        description: doc.description ?? "",
                        url: doc.url,
                        pages: doc.pages?.toString() ?? "",
                        readMinutes: doc.readMinutes?.toString() ?? "",
                    }
                    : emptyDocument,
            ]
        })
    ) as Record<DocumentLanguage, DocumentForm>

    return {
        title: item?.title ?? "",
        slug: item?.slug ?? "",
        summary: item?.summary ?? "",
        category: item?.category ?? "",
        status: item?.status ?? "DRAFT",
        publishedAt: item?.publishedAt?.toISOString().slice(0, 10) ?? "",
        youtubeVideoId: item?.youtubeVideoId ?? "",
        keyFindings: item?.keyFindings ?? [],
        tags: item?.tags ?? [],
        featured: item?.featured ?? false,
        order: String(item?.order ?? 0),
        metaTitle: item?.metaTitle ?? "",
        metaDescription: item?.metaDescription ?? "",
        documents,
    }
}

const hasContent = (doc: DocumentForm) => Object.values(doc).some((value) => value.trim() !== "")
const toInt = (value: string) => (value.trim() ? Number(value) : null)

function toPayload(form: Form) {
    return {
        title: form.title,
        slug: form.slug,
        summary: form.summary,
        category: form.category,
        status: form.status,
        publishedAt: form.publishedAt || null,
        youtubeVideoId: form.youtubeVideoId || null,
        keyFindings: form.keyFindings,
        tags: form.tags,
        featured: form.featured,
        order: Number(form.order) || 0,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        // A language with every field empty means "no document" and is removed
        documents: LANGUAGES.filter((language) => hasContent(form.documents[language])).map((language) => {
            const doc = form.documents[language]
            return {
                language,
                title: doc.title,
                description: doc.description,
                url: doc.url,
                pages: toInt(doc.pages),
                readMinutes: toInt(doc.readMinutes),
            }
        }),
    }
}

export default function InvestigationEditor({
    investigation,
    channelVideos,
    channelError,
    categories,
}: {
    investigation: InvestigationWithDocuments | null
    channelVideos: ChannelVideo[]
    channelError: string | null
    categories: string[]
}) {
    const router = useRouter()
    const isNew = investigation === null

    const [form, setForm] = React.useState(() => toForm(investigation))
    const [saved, setSaved] = React.useState(form)
    // New investigations keep the slug in sync with the title until it's edited by hand
    const [slugTouched, setSlugTouched] = React.useState(!isNew)

    const save = useAction()
    const remove = useAction()

    const dirty = JSON.stringify(form) !== JSON.stringify(saved)

    function update<K extends keyof Form>(field: K, value: Form[K]) {
        setForm((current) => ({ ...current, [field]: value }))
    }

    function updateTitle(title: string) {
        setForm((current) => ({ ...current, title, slug: slugTouched ? current.slug : slugify(title) }))
    }

    function updateDocument(language: DocumentLanguage, field: keyof DocumentForm, value: string) {
        setForm((current) => ({
            ...current,
            documents: { ...current.documents, [language]: { ...current.documents[language], [field]: value } },
        }))
    }

    function selectVideo(id: string) {
        const video = channelVideos.find((v) => v.id === id)
        setForm((current) => {
            // Fill an empty title from the video
            const title = current.title || video?.title || ""
            return {
                ...current,
                youtubeVideoId: id,
                title,
                slug: slugTouched ? current.slug : slugify(title),
            }
        })
    }

    async function handleSave() {
        await save.run(async () => {
            const json = toPayload(form)
            const { item } = isNew
                ? await api<{ item: InvestigationWithDocuments }>("/api/investigations", { method: "POST", json })
                : await api<{ item: InvestigationWithDocuments }>(`/api/investigations/${investigation.id}`, {
                    method: "PATCH",
                    json,
                })

            // Dates arrive as strings over JSON
            const next = toForm({ ...item, publishedAt: item.publishedAt ? new Date(item.publishedAt) : null })
            setForm(next)
            setSaved(next)
            setSlugTouched(true)

            if (isNew) router.replace(`/dashboard/investigations/${item.id}`)
            else router.refresh()
        }, isNew ? "Created" : "Saved")
    }

    async function handleDelete() {
        if (!investigation) return
        if (!window.confirm(`Delete "${investigation.title}" and its documents? This can't be undone.`)) return

        const ok = await remove.run(async () => {
            await api(`/api/investigations/${investigation.id}`, { method: "DELETE" })
        }, "Deleted")
        if (ok) router.push("/dashboard/investigations")
    }

    const allCategories = [...new Set([...categories, ...suggestedCategories])]

    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
                <div className="flex min-w-0 items-center gap-4">
                    <Link
                        href="/dashboard/investigations"
                        aria-label="Back to investigations"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>

                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                            Investigations
                        </p>
                        <div className="flex items-center gap-2">
                            <h1 className="truncate text-lg font-semibold">
                                {isNew ? "New Investigation" : "Edit Investigation"}
                            </h1>
                            {!isNew && <StatusBadge status={investigation.status} />}
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <StatusText status={save.status} />
                    {!save.status && dirty && <span className="hidden text-xs text-zinc-500 sm:inline">Unsaved changes</span>}

                    {investigation?.status === "PUBLISHED" && (
                        <a
                            href={`/investigations/${investigation.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium transition hover:bg-zinc-100 sm:inline-flex dark:border-zinc-800 dark:hover:bg-zinc-900"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View page
                        </a>
                    )}

                    <PrimaryButton pending={save.pending} onClick={handleSave}>
                        <Save className="h-4 w-4" />
                        {isNew ? "Create" : "Save"}
                    </PrimaryButton>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="grid gap-8 xl:grid-cols-[1fr_300px]">
                    <div className="min-w-0">
                        {/* TOPIC */}
                        <EditorSection
                            number="01"
                            title="Topic"
                            description="Shown on the investigations page and at the top of the investigation."
                        >
                            <div className="space-y-4">
                                <TextField label="Title" value={form.title} onChange={updateTitle} maxLength={160} placeholder="Why Mumbai Floods Every Monsoon" />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className={labelClass}>Slug</label>
                                        <button
                                            type="button"
                                            onClick={() => update("slug", slugify(form.title))}
                                            className="text-[11px] text-red-500 hover:text-red-400"
                                        >
                                            Generate from title
                                        </button>
                                    </div>

                                    <div className="flex items-center rounded-lg border border-zinc-200 bg-white focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/10 dark:border-zinc-800 dark:bg-zinc-900">
                                        <span className="pl-3 text-xs text-zinc-400">/investigations/</span>
                                        <input
                                            value={form.slug}
                                            onChange={(e) => {
                                                setSlugTouched(true)
                                                update("slug", e.target.value.toLowerCase())
                                            }}
                                            maxLength={120}
                                            className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                <TextAreaField label="Summary" value={form.summary} onChange={(v) => update("summary", v)} rows={4} maxLength={600} />

                                <div className="space-y-2">
                                    <label className={labelClass}>Category</label>
                                    <input
                                        list="investigation-categories"
                                        value={form.category}
                                        onChange={(e) => update("category", e.target.value)}
                                        maxLength={40}
                                        placeholder="Pick or type a category"
                                        className={inputClass}
                                    />
                                    <datalist id="investigation-categories">
                                        {allCategories.map((category) => (
                                            <option key={category} value={category} />
                                        ))}
                                    </datalist>
                                </div>

                                <ListField
                                    label="Key Findings"
                                    items={form.keyFindings}
                                    onChange={(items) => update("keyFindings", items)}
                                    placeholder="Drains designed for 25 mm/hr; peak rainfall now exceeds 50 mm/hr"
                                    max={10}
                                />

                                <TagsField tags={form.tags} onChange={(tags) => update("tags", tags)} />
                            </div>
                        </EditorSection>

                        {/* VIDEO */}
                        <EditorSection
                            number="02"
                            title="YouTube Video"
                            description="The video for this topic — embedded on the investigation page."
                        >
                            <VideoPicker
                                videoId={form.youtubeVideoId}
                                channelVideos={channelVideos}
                                channelError={channelError}
                                onChange={selectVideo}
                                onClear={() => update("youtubeVideoId", "")}
                            />
                        </EditorSection>

                        {/* DOCUMENTS */}
                        <EditorSection
                            number="03"
                            title="Documents"
                            description="The research document in English and Hindi. Paste a shareable link (Google Drive, Docs, PDF) — make sure anyone with the link can view it."
                        >
                            <div className="grid gap-4 lg:grid-cols-2">
                                {LANGUAGES.map((language) => (
                                    <DocumentCard
                                        key={language}
                                        language={language}
                                        doc={form.documents[language]}
                                        onChange={(field, value) => updateDocument(language, field, value)}
                                        onClear={() =>
                                            setForm((current) => ({
                                                ...current,
                                                documents: { ...current.documents, [language]: emptyDocument },
                                            }))
                                        }
                                    />
                                ))}
                            </div>
                        </EditorSection>

                        {/* SEO */}
                        <EditorSection
                            number="04"
                            title="SEO"
                            description="Optional — the title and summary are used when these are empty."
                        >
                            <div className="space-y-4">
                                <TextField label="Meta Title" value={form.metaTitle} onChange={(v) => update("metaTitle", v)} maxLength={70} />
                                <TextAreaField label="Meta Description" value={form.metaDescription} onChange={(v) => update("metaDescription", v)} rows={3} maxLength={200} />
                            </div>
                        </EditorSection>

                        {!isNew && (
                            <section className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-5">
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <p className="text-sm font-medium text-red-500">Delete investigation</p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            Removes it from the website along with both document links. The YouTube video isn&apos;t affected.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <StatusText status={remove.status} />
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={remove.pending}
                                            className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                        <SideCard title="Publishing">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className={labelClass}>Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => update("status", e.target.value as InvestigationStatus)}
                                        className={inputClass}
                                    >
                                        {STATUSES.map((status) => (
                                            <option key={status} value={status}>
                                                {statusLabels[status]}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] leading-4 text-zinc-500">
                                        Only published investigations appear on the website.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClass}>Publication date</label>
                                    <input
                                        type="date"
                                        value={form.publishedAt}
                                        onChange={(e) => update("publishedAt", e.target.value)}
                                        className={inputClass}
                                    />
                                    <p className="text-[11px] leading-4 text-zinc-500">
                                        Left empty, today&apos;s date is used when you publish.
                                    </p>
                                </div>
                            </div>
                        </SideCard>

                        <SideCard title="Website">
                            <div className="space-y-4">
                                <ToggleRow
                                    title="Featured"
                                    description="Highlight this investigation"
                                    checked={form.featured}
                                    onChange={(checked) => update("featured", checked)}
                                />

                                <div className="space-y-2">
                                    <label className={labelClass}>Display order</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.order}
                                        onChange={(e) => update("order", e.target.value)}
                                        className={inputClass}
                                    />
                                    <p className="text-[11px] leading-4 text-zinc-500">
                                        Lower numbers come first; equal numbers show newest first.
                                    </p>
                                </div>
                            </div>
                        </SideCard>

                        <SideCard title="Checklist">
                            <ul className="space-y-2 text-xs">
                                <ChecklistItem done={!!form.youtubeVideoId}>YouTube video linked</ChecklistItem>
                                {LANGUAGES.map((language) => (
                                    <ChecklistItem key={language} done={!!form.documents[language].url.trim()}>
                                        {languageLabels[language].name} document
                                    </ChecklistItem>
                                ))}
                                <ChecklistItem done={form.keyFindings.length > 0}>Key findings</ChecklistItem>
                            </ul>
                        </SideCard>
                    </aside>
                </div>
            </main>
        </div>
    )
}


/* =============================================================
   VIDEO PICKER
============================================================= */

function VideoPicker({
    videoId,
    channelVideos,
    channelError,
    onChange,
    onClear,
}: {
    videoId: string
    channelVideos: ChannelVideo[]
    channelError: string | null
    onChange: (id: string) => void
    onClear: () => void
}) {
    const [link, setLink] = React.useState("")
    const [linkError, setLinkError] = React.useState<string | null>(null)

    const selected = channelVideos.find((video) => video.id === videoId)
    const videos = channelVideos.filter((video) => video.type === "video")
    const shorts = channelVideos.filter((video) => video.type === "short")

    function connectLink() {
        const id = youtubeIdFromUrl(link)
        if (!id) {
            setLinkError("That doesn't look like a YouTube video link")
            return
        }
        setLinkError(null)
        setLink("")
        onChange(id)
    }

    return (
        <div className="space-y-4">
            {videoId ? (
                <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                        <Image src={youtubeThumbnail(videoId)} alt="" fill sizes="144px" className="object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-red-600/10 px-2 py-0.5 text-[10px] font-medium text-red-500">
                                {selected?.type === "short" ? "Short" : "YouTube"}
                            </span>
                            <span className="text-[10px] text-zinc-400">{videoId}</span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm font-medium">
                            {selected?.title ?? "Video from a link"}
                        </p>

                        <a
                            href={youtubeWatchUrl(videoId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-500"
                        >
                            Open on YouTube
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>

                    <IconButton label="Remove video" danger onClick={onClear}>
                        <X className="h-4 w-4" />
                    </IconButton>
                </div>
            ) : (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-white p-4 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950">
                    <Video className="h-5 w-5 text-zinc-400" />
                    No video linked yet.
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className={labelClass}>From your channel</label>
                    <select
                        value={selected ? videoId : ""}
                        onChange={(e) => e.target.value && onChange(e.target.value)}
                        disabled={channelVideos.length === 0}
                        className={`${inputClass} disabled:opacity-60`}
                    >
                        <option value="">
                            {channelVideos.length ? "Choose a video…" : "Channel videos unavailable"}
                        </option>
                        {videos.length > 0 && (
                            <optgroup label="Videos">
                                {videos.map((video) => (
                                    <option key={video.id} value={video.id}>
                                        {video.title}
                                    </option>
                                ))}
                            </optgroup>
                        )}
                        {shorts.length > 0 && (
                            <optgroup label="Shorts">
                                {shorts.map((video) => (
                                    <option key={video.id} value={video.id}>
                                        {video.title}
                                    </option>
                                ))}
                            </optgroup>
                        )}
                    </select>
                    {channelError && <p className="text-[11px] text-red-500">{channelError}</p>}
                </div>

                <div className="space-y-2">
                    <label className={labelClass}>Or paste a YouTube link</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        connectLink()
                                    }
                                }}
                                placeholder="https://youtube.com/watch?v=…"
                                className={`${inputClass} pl-9`}
                            />
                        </div>
                        <SecondaryButton onClick={connectLink} disabled={!link.trim()}>
                            Connect
                        </SecondaryButton>
                    </div>
                    {linkError && <p className="text-[11px] text-red-500">{linkError}</p>}
                </div>
            </div>
        </div>
    )
}


/* =============================================================
   DOCUMENT CARD (one per language)
============================================================= */

function DocumentCard({
    language,
    doc,
    onChange,
    onClear,
}: {
    language: DocumentLanguage
    doc: DocumentForm
    onChange: (field: keyof DocumentForm, value: string) => void
    onClear: () => void
}) {
    const { name, native, htmlLang } = languageLabels[language]
    const linked = doc.url.trim() !== ""

    return (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500/10 text-[11px] font-semibold text-red-500">
                        {language}
                    </span>
                    <div>
                        <p className="text-sm font-semibold">{native}</p>
                        <p className="text-[11px] text-zinc-500">{linked ? `${name} document` : `No ${name} document yet`}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {linked && URL.canParse(doc.url) && (
                        <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open the ${name} document`}
                            title="Open"
                            className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                    {hasContent(doc) && (
                        <IconButton label={`Remove the ${name} document`} danger onClick={onClear}>
                            <Trash2 className="h-4 w-4" />
                        </IconButton>
                    )}
                </div>
            </div>

            <div className="space-y-4 p-4">
                <TextField
                    label="Document link"
                    value={doc.url}
                    onChange={(v) => onChange("url", v)}
                    placeholder="https://drive.google.com/…"
                    icon={<FileText className="h-4 w-4" />}
                />

                {/* lang lets the browser pick a Devanagari font and keyboard for Hindi */}
                <div lang={htmlLang} className="space-y-4">
                    <TextField
                        label={`Title (${name})`}
                        value={doc.title}
                        onChange={(v) => onChange("title", v)}
                        maxLength={200}
                        placeholder={language === "HI" ? "मुंबई में हर मानसून बाढ़ क्यों आती है" : "Leave empty to use the investigation title"}
                    />

                    <TextAreaField
                        label={`Details (${name})`}
                        value={doc.description}
                        onChange={(v) => onChange("description", v)}
                        rows={6}
                        maxLength={5000}
                        placeholder={
                            language === "HI"
                                ? "इस दस्तावेज़ में क्या है — खाली पंक्ति से नया पैराग्राफ़।"
                                : "What this document covers. Leave a blank line between paragraphs."
                        }
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className={labelClass}>Pages</label>
                        <input
                            type="number"
                            min={1}
                            value={doc.pages}
                            onChange={(e) => onChange("pages", e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={labelClass}>Read time (min)</label>
                        <input
                            type="number"
                            min={1}
                            value={doc.readMinutes}
                            onChange={(e) => onChange("readMinutes", e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}


/* =============================================================
   SMALL PIECES
============================================================= */

function ListField({
    label,
    items,
    onChange,
    placeholder,
    max,
}: {
    label: string
    items: string[]
    onChange: (items: string[]) => void
    placeholder?: string
    max: number
}) {
    const list = items.length ? items : [""]

    return (
        <div className="space-y-2">
            <label className={labelClass}>{label}</label>

            {list.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <span className="w-6 text-right text-xs text-red-500">{String(index + 1).padStart(2, "0")}</span>
                    <input
                        value={item}
                        onChange={(e) => onChange(list.map((value, i) => (i === index ? e.target.value : value)))}
                        maxLength={300}
                        placeholder={index === 0 ? placeholder : undefined}
                        className={inputClass}
                    />
                    <IconButton
                        label="Remove"
                        danger
                        disabled={list.length === 1 && !item}
                        onClick={() => onChange(list.filter((_, i) => i !== index))}
                    >
                        <X className="h-4 w-4" />
                    </IconButton>
                </div>
            ))}

            {list.length < max && (
                <button
                    type="button"
                    onClick={() => onChange([...list, ""])}
                    className="ml-8 inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-400"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add finding
                </button>
            )}
        </div>
    )
}

function TagsField({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
    const [input, setInput] = React.useState("")

    function add() {
        const value = input.trim()
        if (value && !tags.includes(value) && tags.length < 15) onChange([...tags, value])
        setInput("")
    }

    return (
        <div className="space-y-2">
            <label className={labelClass}>Tags</label>

            <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
                {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs dark:bg-zinc-800">
                        {tag}
                        <button
                            type="button"
                            aria-label={`Remove ${tag}`}
                            onClick={() => onChange(tags.filter((t) => t !== tag))}
                            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}

                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault()
                            add()
                        }
                    }}
                    onBlur={add}
                    maxLength={40}
                    placeholder="Add tag…"
                    className="min-w-[100px] flex-1 bg-transparent px-1 py-1 text-xs outline-none"
                />
            </div>
            <p className="text-[11px] text-zinc-500">Press Enter to add a tag.</p>
        </div>
    )
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="border-b border-zinc-200 px-5 py-4 text-sm font-semibold dark:border-zinc-800">{title}</h2>
            <div className="p-5">{children}</div>
        </section>
    )
}

function ChecklistItem({ done, children }: { done: boolean; children: React.ReactNode }) {
    return (
        <li className={`flex items-center gap-2 ${done ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />
            {children}
        </li>
    )
}
