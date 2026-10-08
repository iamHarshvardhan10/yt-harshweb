"use client"

import * as React from "react"
import Link from "next/link"
import { DownloadCloud, ExternalLink, Loader2 } from "lucide-react"
import type { HomeSectionKey } from "@prisma/client"

import { api, useAction, type HomeAdminData } from "@/components/dashboard/home/api"
import HeroEditor from "@/components/dashboard/home/HeroEditor"
import SectionEditor from "@/components/dashboard/home/SectionEditor"
import CollectionEditor from "@/components/dashboard/home/CollectionEditor"
import { StatusText } from "@/components/dashboard/home/ui"


const tabs = [
    { id: "HERO", label: "Hero" },
    { id: "FEATURED_VIDEOS", label: "Featured Videos" },
    { id: "METRICS", label: "Metrics" },
    { id: "ABOUT", label: "About" },
    { id: "TESTIMONIALS", label: "Testimonials" },
    { id: "FAQ", label: "FAQ" },
    { id: "CONTACT", label: "Contact" },
] as const

type TabId = (typeof tabs)[number]["id"]

const fetchHome = () => api<HomeAdminData>("/api/home?scope=admin")

const errorText = (err: unknown) =>
    err instanceof Error ? err.message : "Failed to load home page content"


export default function Home() {
    const [data, setData] = React.useState<HomeAdminData | null>(null)
    const [loadError, setLoadError] = React.useState<string | null>(null)
    const [activeTab, setActiveTab] = React.useState<TabId>("HERO")
    // Bumped after a seed so every editor re-initialises from fresh data
    const [version, setVersion] = React.useState(0)
    const seed = useAction()

    async function load() {
        try {
            setData(await fetchHome())
            setLoadError(null)
        } catch (err) {
            setLoadError(errorText(err))
        }
    }

    React.useEffect(() => {
        let ignore = false
        fetchHome().then(
            (result) => !ignore && setData(result),
            (err) => !ignore && setLoadError(errorText(err))
        )
        return () => {
            ignore = true
        }
    }, [])

    const isEmpty =
        !!data &&
        !data.hero &&
        data.sections.length === 0 &&
        data.metrics.length === 0 &&
        data.aboutItems.length === 0 &&
        data.testimonials.length === 0 &&
        data.faqs.length === 0

    function importDefaults() {
        return seed.run(async () => {
            await api("/api/home/seed", { method: "POST" })
            await load()
            setVersion((v) => v + 1)
        }, "Default content imported")
    }

    const section = (key: HomeSectionKey) => data?.sections.find((s) => s.key === key)


    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* =========================================================
                HEADER
            ========================================================= */}

            <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

                <div className="flex h-16 items-center justify-between px-6">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                            Website
                        </p>

                        <h1 className="text-lg font-semibold">
                            Home Page
                        </h1>
                    </div>

                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                        <ExternalLink size={14} />
                        View Site
                    </Link>
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
                MAIN EDITOR
            ========================================================= */}

            <main className="mx-auto w-full max-w-5xl px-6 py-8">

                {loadError && (
                    <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600">
                        {loadError}
                        <button type="button" onClick={load} className="ml-3 underline">
                            Retry
                        </button>
                    </div>
                )}

                {!data && !loadError && (
                    <div className="flex items-center justify-center gap-2 py-20 text-sm text-zinc-500">
                        <Loader2 size={16} className="animate-spin" />
                        Loading content…
                    </div>
                )}

                {isEmpty && (
                    <div className="mb-8 flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                        <div>
                            <p className="text-sm font-medium">No home page content saved yet</p>
                            <p className="mt-1 text-xs text-zinc-500">
                                Import the current website copy as a starting point, or add content section by section.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <StatusText status={seed.status} />
                            <button
                                type="button"
                                onClick={importDefaults}
                                disabled={seed.pending}
                                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black"
                            >
                                {seed.pending ? <Loader2 size={14} className="animate-spin" /> : <DownloadCloud size={14} />}
                                Import current content
                            </button>
                        </div>
                    </div>
                )}

                {data && (
                    // Every tab stays mounted so unsaved edits survive tab switches
                    <div key={version}>

                        <TabPanel active={activeTab === "HERO"}>
                            <HeroEditor initialHero={data.hero} />
                        </TabPanel>


                        <TabPanel active={activeTab === "FEATURED_VIDEOS"}>
                            <SectionEditor sectionKey="FEATURED_VIDEOS" initialSection={section("FEATURED_VIDEOS")} />

                            <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-xs text-zinc-500 dark:border-zinc-700">
                                The video grid is loaded from the YouTube API — only the section header is managed here.
                            </p>
                        </TabPanel>


                        <TabPanel active={activeTab === "METRICS"}>
                            <SectionEditor sectionKey="METRICS" initialSection={section("METRICS")} />

                            <CollectionEditor
                                endpoint="/api/home/metrics"
                                number="02"
                                title="Metrics"
                                itemName="Metric"
                                initialItems={data.metrics}
                                fields={[
                                    { name: "value", label: "Value", type: "text", maxLength: 30, placeholder: "120K+" },
                                    { name: "title", label: "Label", type: "text", maxLength: 60, placeholder: "Monthly Visits" },
                                ]}
                                summary={(m) => ({ primary: m.value, secondary: m.title })}
                                maxItems={4}
                            />
                        </TabPanel>


                        <TabPanel active={activeTab === "ABOUT"}>
                            <SectionEditor
                                sectionKey="ABOUT"
                                initialSection={section("ABOUT")}
                                imageLabel="Centre image (defaults to /about.webp)"
                            />

                            <CollectionEditor
                                endpoint="/api/home/about-items"
                                number="02"
                                title="About Highlights"
                                itemName="Highlight"
                                initialItems={data.aboutItems}
                                fields={[
                                    { name: "title", label: "Title", type: "text", maxLength: 80 },
                                    { name: "description", label: "Description", type: "textarea", maxLength: 400 },
                                ]}
                                summary={(item) => ({ primary: item.title, secondary: item.description })}
                                maxItems={4}
                            />
                        </TabPanel>


                        <TabPanel active={activeTab === "TESTIMONIALS"}>
                            <SectionEditor sectionKey="TESTIMONIALS" initialSection={section("TESTIMONIALS")} />

                            <CollectionEditor
                                endpoint="/api/home/testimonials"
                                number="02"
                                title="Testimonials"
                                itemName="Testimonial"
                                initialItems={data.testimonials}
                                fields={[
                                    { name: "name", label: "Name", type: "text", maxLength: 80 },
                                    { name: "text", label: "Quote", type: "textarea", maxLength: 400 },
                                    { name: "avatarId", label: "Avatar", type: "avatar" },
                                ]}
                                summary={(t) => ({ primary: t.name, secondary: t.text, image: t.avatar?.secureUrl ?? t.image })}
                            />
                        </TabPanel>


                        <TabPanel active={activeTab === "FAQ"}>
                            <SectionEditor sectionKey="FAQ" initialSection={section("FAQ")} />

                            <CollectionEditor
                                endpoint="/api/home/faqs"
                                number="02"
                                title="Questions"
                                description="Also shown on the Contact page."
                                itemName="FAQ"
                                initialItems={data.faqs}
                                fields={[
                                    { name: "question", label: "Question", type: "text", maxLength: 200 },
                                    { name: "answer", label: "Answer", type: "textarea", maxLength: 2000 },
                                ]}
                                summary={(f) => ({ primary: f.question, secondary: f.answer })}
                            />
                        </TabPanel>


                        <TabPanel active={activeTab === "CONTACT"}>
                            <SectionEditor sectionKey="CONTACT" initialSection={section("CONTACT")} />
                        </TabPanel>

                    </div>
                )}

            </main>

        </div>
    )
}


function TabPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
    return <div className={active ? "" : "hidden"}>{children}</div>
}
