"use client"

import * as React from "react"
import Link from "next/link"
import { ExternalLink, Link2, Loader2, RotateCcw, Save } from "lucide-react"
import type { AboutPage as AboutPageRow, AboutStep, Media } from "@prisma/client"

import { defaultAboutPage } from "@/lib/about/defaults"
import { api, useAction } from "@/components/dashboard/home/api"
import CollectionEditor from "@/components/dashboard/home/CollectionEditor"
import {
    EditorSection,
    MediaUpload,
    PrimaryButton,
    SecondaryButton,
    StatusText,
    TextAreaField,
    TextField,
    ToggleRow,
    labelClass,
} from "@/components/dashboard/home/ui"


type AboutRow = AboutPageRow & { heroMedia: Media | null }
type AboutAdminData = { page: AboutRow | null; steps: AboutStep[] }

const tabs = [
    { id: "HERO", label: "Hero" },
    { id: "PROCESS", label: "How We Work" },
    { id: "CTA", label: "Call to Action" },
    { id: "BLOCKS", label: "Page Blocks" },
] as const

type TabId = (typeof tabs)[number]["id"]

const fetchAbout = () => api<AboutAdminData>("/api/about?scope=admin")

const errorText = (err: unknown) =>
    err instanceof Error ? err.message : "Failed to load about page content"

function toForm(page: AboutRow | null) {
    const source = page ?? defaultAboutPage
    return {
        heroTag: source.heroTag,
        heroTitle: source.heroTitle,
        heroDesc: source.heroDesc,
        processTag: source.processTag,
        processTitle: source.processTitle,
        processDesc: source.processDesc,
        processVisible: source.processVisible,
        ctaTag: source.ctaTag,
        ctaTitle: source.ctaTitle,
        ctaDesc: source.ctaDesc,
        ctaBtn1: source.ctaBtn1,
        ctaBtn1Link: source.ctaBtn1Link,
        ctaBtn2: source.ctaBtn2,
        ctaBtn2Link: source.ctaBtn2Link,
        ctaVisible: source.ctaVisible,
        showAbout: source.showAbout,
        showMetrics: source.showMetrics,
    }
}

type AboutForm = ReturnType<typeof toForm>


export default function AboutPage() {
    const [data, setData] = React.useState<AboutAdminData | null>(null)
    const [loadError, setLoadError] = React.useState<string | null>(null)

    React.useEffect(() => {
        let ignore = false
        fetchAbout().then(
            (result) => !ignore && setData(result),
            (err) => !ignore && setLoadError(errorText(err))
        )
        return () => {
            ignore = true
        }
    }, [])

    async function retry() {
        try {
            setData(await fetchAbout())
            setLoadError(null)
        } catch (err) {
            setLoadError(errorText(err))
        }
    }

    if (!data) {
        return (
            <div className="min-h-full bg-zinc-50 p-6 dark:bg-black">
                {loadError ? (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600">
                        {loadError}
                        <button type="button" onClick={retry} className="ml-3 underline">
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 py-20 text-sm text-zinc-500">
                        <Loader2 size={16} className="animate-spin" />
                        Loading content…
                    </div>
                )}
            </div>
        )
    }

    return <AboutEditor initial={data} />
}


/* =============================================================
   EDITOR
============================================================= */

function AboutEditor({ initial }: { initial: AboutAdminData }) {
    const [page, setPage] = React.useState(initial.page)
    const [form, setForm] = React.useState(() => toForm(initial.page))
    const [activeTab, setActiveTab] = React.useState<TabId>("HERO")
    const { pending, status, run } = useAction()

    const set = <K extends keyof AboutForm>(key: K, value: AboutForm[K]) =>
        setForm((current) => ({ ...current, [key]: value }))

    async function put(body: object) {
        const res = await api<{ page: AboutRow }>("/api/about", { method: "PUT", json: body })
        setPage(res.page)
    }

    // Saves just the image; the first save of the page needs the full copy too
    const setHeroMedia = (heroMediaId: string | null) =>
        put(page ? { heroMediaId } : { ...form, heroMediaId })

    function reset() {
        if (!confirm("Reset all About page copy to the defaults? Steps are kept.")) return
        return run(async () => {
            const res = await api<{ page: AboutRow }>("/api/about", { method: "DELETE" })
            setPage(res.page)
            setForm(toForm(res.page))
        }, "Reset to default")
    }


    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* =========================================================
                HEADER
            ========================================================= */}

            <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

                <div className="flex h-16 items-center justify-between gap-4 px-6">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                            Website
                        </p>

                        <h1 className="text-lg font-semibold">
                            About Page
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <StatusText status={status} />

                        <Link
                            href="/about"
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                        >
                            <ExternalLink size={14} />
                            View Page
                        </Link>

                        <SecondaryButton onClick={reset} disabled={pending}>
                            <RotateCcw size={14} />
                            Reset
                        </SecondaryButton>

                        <PrimaryButton onClick={() => run(() => put(form), "About page saved")} pending={pending}>
                            <Save size={16} />
                            Save Changes
                        </PrimaryButton>
                    </div>
                </div>

                <nav className="flex gap-1 overflow-x-auto px-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition ${activeTab === tab.id
                                ? "border-red-500 text-red-500"
                                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

            </header>


            {/* =========================================================
                MAIN
            ========================================================= */}

            <main className="mx-auto w-full max-w-5xl px-6 py-8">

                {!page && (
                    <p className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
                        Not saved yet — the site shows this default copy. Click <strong>Save Changes</strong> to store it.
                    </p>
                )}

                {/* Every tab stays mounted so unsaved edits survive tab switches */}

                <TabPanel active={activeTab === "HERO"}>
                    <EditorSection number="01" title="Hero Content">
                        <div className="space-y-5">
                            <TextField
                                label="Eyebrow"
                                value={form.heroTag}
                                onChange={(v) => set("heroTag", v)}
                                maxLength={40}
                            />
                            <TextAreaField
                                label="Title (new lines are kept)"
                                value={form.heroTitle}
                                onChange={(v) => set("heroTitle", v)}
                                rows={2}
                                maxLength={120}
                            />
                            <TextAreaField
                                label="Description"
                                value={form.heroDesc}
                                onChange={(v) => set("heroDesc", v)}
                                rows={4}
                                maxLength={400}
                            />
                        </div>
                    </EditorSection>

                    <EditorSection
                        number="02"
                        title="Background Image"
                        description={`Uploads are saved immediately. Without an upload the page uses ${page?.heroImage ?? defaultAboutPage.heroImage}.`}
                    >
                        <p className={`${labelClass} mb-2 block`}>Hero image</p>
                        <MediaUpload
                            kind="image"
                            media={page?.heroMedia}
                            onUploaded={(media) => setHeroMedia(media.id)}
                            onRemove={() => setHeroMedia(null)}
                        />
                    </EditorSection>
                </TabPanel>


                <TabPanel active={activeTab === "PROCESS"}>
                    <EditorSection number="01" title="Section Header">
                        <div className="space-y-5">
                            <TextField
                                label="Eyebrow"
                                value={form.processTag}
                                onChange={(v) => set("processTag", v)}
                                maxLength={40}
                            />
                            <TextField
                                label="Title"
                                value={form.processTitle}
                                onChange={(v) => set("processTitle", v)}
                                maxLength={120}
                            />
                            <TextAreaField
                                label="Description"
                                value={form.processDesc}
                                onChange={(v) => set("processDesc", v)}
                                rows={3}
                                maxLength={400}
                            />
                            <ToggleRow
                                title="Show Section"
                                description="Display “How We Work” on the About page"
                                checked={form.processVisible}
                                onChange={(v) => set("processVisible", v)}
                            />
                        </div>
                    </EditorSection>

                    <CollectionEditor
                        endpoint="/api/about/steps"
                        number="02"
                        title="Steps"
                        description="Saved individually. Numbered automatically in order."
                        itemName="Step"
                        initialItems={initial.steps}
                        fields={[
                            { name: "title", label: "Title", type: "text", maxLength: 60, placeholder: "Research" },
                            { name: "description", label: "Description", type: "textarea", maxLength: 400 },
                        ]}
                        summary={(step) => ({ primary: step.title, secondary: step.description })}
                    />
                </TabPanel>


                <TabPanel active={activeTab === "CTA"}>
                    <EditorSection number="01" title="Content">
                        <div className="space-y-5">
                            <TextField
                                label="Eyebrow"
                                value={form.ctaTag}
                                onChange={(v) => set("ctaTag", v)}
                                maxLength={40}
                            />
                            <TextField
                                label="Title"
                                value={form.ctaTitle}
                                onChange={(v) => set("ctaTitle", v)}
                                maxLength={120}
                            />
                            <TextAreaField
                                label="Description"
                                value={form.ctaDesc}
                                onChange={(v) => set("ctaDesc", v)}
                                rows={3}
                                maxLength={400}
                            />
                        </div>
                    </EditorSection>

                    <EditorSection number="02" title="Buttons">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-3">
                                <TextField
                                    label="Primary Button"
                                    value={form.ctaBtn1}
                                    onChange={(v) => set("ctaBtn1", v)}
                                    maxLength={40}
                                />
                                <TextField
                                    label="Primary URL"
                                    value={form.ctaBtn1Link}
                                    onChange={(v) => set("ctaBtn1Link", v)}
                                    placeholder="/contact"
                                    icon={<Link2 size={15} />}
                                />
                            </div>

                            <div className="space-y-3">
                                <TextField
                                    label="Secondary Button"
                                    value={form.ctaBtn2}
                                    onChange={(v) => set("ctaBtn2", v)}
                                    maxLength={40}
                                />
                                <TextField
                                    label="Secondary URL"
                                    value={form.ctaBtn2Link}
                                    onChange={(v) => set("ctaBtn2Link", v)}
                                    placeholder="/investigations"
                                    icon={<Link2 size={15} />}
                                />
                            </div>
                        </div>
                    </EditorSection>

                    <EditorSection number="03" title="Visibility">
                        <ToggleRow
                            title="Show Call to Action"
                            description="Display the closing section on the About page"
                            checked={form.ctaVisible}
                            onChange={(v) => set("ctaVisible", v)}
                        />
                    </EditorSection>
                </TabPanel>


                <TabPanel active={activeTab === "BLOCKS"}>
                    <EditorSection
                        number="01"
                        title="Shared Blocks"
                        description="These blocks reuse the home page content. Their text is edited on the Home page dashboard; here you only choose whether they appear on /about."
                    >
                        <div className="space-y-3">
                            <ToggleRow
                                title="About Highlights"
                                description="The centre image with four highlights, below the hero"
                                checked={form.showAbout}
                                onChange={(v) => set("showAbout", v)}
                            />
                            <ToggleRow
                                title="Metrics"
                                description="Key numbers, after “How We Work”"
                                checked={form.showMetrics}
                                onChange={(v) => set("showMetrics", v)}
                            />

                            <Link
                                href="/dashboard/home"
                                className="inline-flex items-center gap-2 text-xs font-medium text-red-500 hover:underline"
                            >
                                Edit the shared content on the Home page →
                            </Link>
                        </div>
                    </EditorSection>
                </TabPanel>

            </main>

        </div>
    )
}


function TabPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
    return <div className={active ? "" : "hidden"}>{children}</div>
}
