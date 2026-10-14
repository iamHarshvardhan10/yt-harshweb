"use client";

import { useEffect, useState } from "react";
import type { DocumentLanguage } from "@prisma/client";

import type { PublicDocument, PublicInvestigation } from "@/lib/investigations/queries";
import { languageLabels } from "@/lib/investigations/shared";
import { duration } from "@/lib/format";
import { displayDate } from "@/components/core/Investigations/format";
import YouTubeEmbed from "@/components/common/YouTubeEmbed";

type Tab = "watch" | "read";

export default function InvestigationTabs({ investigation }: { investigation: PublicInvestigation }) {
    const { video, documents } = investigation;

    // Open on the report when there's no video to watch
    const [activeTab, setActiveTab] = useState<Tab>(video ? "watch" : "read");
    const [language, setLanguage] = useState<DocumentLanguage>(documents[0]?.language ?? "EN");

    // ?tab=read and ?lang=hi (from the library and newsletter links) are read in
    // the browser, so the page itself stays static and cacheable
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const lang = params.get("lang") === "hi" ? "HI" : null;

        /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from the URL after hydration */
        if (params.get("tab") === "read" && documents.length > 0) setActiveTab("read");
        if (lang && documents.some((doc) => doc.language === lang)) setLanguage(lang);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [documents]);

    const tabs = ([["watch", "Watch Video"], ["read", "Read Report"]] as const).filter(
        ([id]) => (id === "watch" ? video : documents.length > 0)
    );

    const details = [
        ["Category", investigation.category],
        ["Published", investigation.publishedAt && displayDate(investigation.publishedAt)],
        ["Video", video?.durationSeconds ? duration(video.durationSeconds) : null],
        ["Report", documents.map((doc) => languageLabels[doc.language].native).join(" / ") || null],
    ].filter((row): row is [string, string] => Boolean(row[1]));

    return (
        <section className="bg-background px-6 pb-30 text-white md:px-20 lg:px-49">

            {/* TABS */}
            {tabs.length > 0 && (
                <div className="flex items-center gap-8 border-b border-white/10 pb-6">
                    {tabs.map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={`cursor-pointer border-b pb-2 text-[16px] uppercase transition-colors ${activeTab === id ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/70"}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}


            <div className="grid grid-cols-1 gap-12 pt-12 lg:grid-cols-[1fr_320px]">

                {/* MAIN — every panel is in the HTML (inactive ones `hidden`) so search
                    engines can read the full report in every language, not just the video */}
                <div className="min-w-0">
                    {video && (
                        <div hidden={activeTab !== "watch"}>
                            <YouTubeEmbed
                                id={video.id}
                                title={video.title ?? investigation.title}
                                thumbnail={investigation.thumbnail}
                            />

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.15em]">
                                    {video.durationSeconds ? <span className="text-[#82CFFF]">{duration(video.durationSeconds)}</span> : null}
                                    {investigation.publishedAt && <span>{displayDate(investigation.publishedAt)}</span>}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {documents.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("read")}
                                            className="cursor-pointer rounded-full border border-white/25 px-6 py-2 text-[12px] uppercase text-white/70 transition-colors hover:border-white hover:text-white"
                                        >
                                            Read the report
                                        </button>
                                    )}
                                    <a
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full border border-white px-6 py-2 text-[12px] uppercase transition-colors hover:bg-white hover:text-black"
                                    >
                                        Watch on YouTube
                                    </a>
                                </div>
                            </div>

                            {video.description && (
                                <p className="mt-8 max-w-3xl text-[16px] leading-[1.7] text-[#c9c9c9]">{video.description}</p>
                            )}
                        </div>
                    )}

                    {documents.map((doc) => (
                        <div key={doc.language} hidden={activeTab !== "read" || doc.language !== language}>
                            <DocumentReader
                                document={doc}
                                languages={documents.map((d) => d.language)}
                                onLanguageChange={setLanguage}
                            />
                        </div>
                    ))}

                    {activeTab === "read" && documents.length === 0 && (
                        <p className="py-20 text-center text-[16px] uppercase text-white/40">The report is coming soon.</p>
                    )}
                </div>


                {/* SIDEBAR */}
                <aside className="space-y-10">
                    {documents.length > 0 && (
                        <div>
                            <p className="mb-4 text-[12px] uppercase tracking-[0.15em] text-white/40">Documents</p>
                            <ul className="space-y-3">
                                {documents.map((doc) => (
                                    <li key={doc.language}>
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-between gap-4 border border-white/25 px-4 py-3 transition-colors hover:border-white"
                                        >
                                            <span className="min-w-0">
                                                <span lang={languageLabels[doc.language].htmlLang} className="block text-[14px] uppercase">
                                                    {languageLabels[doc.language].native}
                                                </span>
                                                <span className="mt-0.5 block text-[11px] uppercase tracking-[0.15em] text-white/40">
                                                    {documentMeta(doc) || "Open document"}
                                                </span>
                                            </span>
                                            <span className="text-[#82CFFF] transition-transform group-hover:translate-x-0.5" aria-hidden>↗</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {investigation.keyFindings.length > 0 && (
                        <div className="border-t border-white/10 pt-8 first:border-t-0 first:pt-0">
                            <p className="mb-4 text-[12px] uppercase tracking-[0.15em] text-white/40">Key Findings</p>
                            <ol className="space-y-5">
                                {investigation.keyFindings.map((finding, index) => (
                                    <li key={finding} className="flex gap-4">
                                        <span className="text-[16px] text-[#82CFFF]">{String(index + 1).padStart(2, "0")}</span>
                                        <p className="text-[14px] uppercase leading-snug">{finding}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    <div className="border-t border-white/10 pt-8">
                        <p className="mb-4 text-[12px] uppercase tracking-[0.15em] text-white/40">Details</p>
                        <dl className="space-y-3 text-[14px] uppercase">
                            {details.map(([label, value]) => (
                                <div key={label} className="flex justify-between gap-4">
                                    <dt className="text-white/40">{label}</dt>
                                    <dd className="text-right">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {investigation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 border-t border-white/10 pt-8">
                            {investigation.tags.map((tag) => (
                                <span key={tag} className="rounded-full border border-white/25 px-3 py-1 text-[11px] uppercase tracking-widest text-white/60">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </aside>

            </div>
        </section>
    )
}

const documentMeta = (doc: PublicDocument) =>
    [doc.pages && `${doc.pages} pages`, doc.readMinutes && `${doc.readMinutes} min read`].filter(Boolean).join(" · ");

/** One language version of the report: language switch, details and the link. */
function DocumentReader({
    document,
    languages,
    onLanguageChange,
}: {
    document: PublicDocument,
    languages: DocumentLanguage[],
    onLanguageChange: (language: DocumentLanguage) => void,
}) {
    const { native, htmlLang } = languageLabels[document.language];
    const paragraphs = document.description?.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) ?? [];
    const meta = documentMeta(document);

    return (
        <article className="max-w-3xl">
            {languages.length > 1 && (
                <div className="mb-10 inline-flex border border-white/25" role="group" aria-label="Report language">
                    {languages.map((language) => (
                        <button
                            key={language}
                            type="button"
                            onClick={() => onLanguageChange(language)}
                            aria-pressed={language === document.language}
                            lang={languageLabels[language].htmlLang}
                            className={`cursor-pointer px-5 py-2 text-[12px] uppercase tracking-[0.15em] transition-colors ${language === document.language ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
                        >
                            {languageLabels[language].native}
                        </button>
                    ))}
                </div>
            )}

            <div lang={htmlLang}>
                <h2 className="text-3xl uppercase leading-tight md:text-4xl">{document.title}</h2>

                {meta && <p className="mt-3 text-[12px] uppercase tracking-[0.15em] text-[#82CFFF]">{meta}</p>}

                <div className="mt-8">
                    {paragraphs.map((paragraph, index) => (
                        <p key={index} className="mb-6 whitespace-pre-line text-[18px] leading-[1.7] text-[#c9c9c9]">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>

            <div className="mt-10 border border-white/25 p-6">
                <p className="text-[12px] uppercase tracking-[0.15em] text-[#82CFFF]">Full Report · {native}</p>
                <p className="mt-2 text-[16px] uppercase">
                    The complete report includes every source, dataset and document we used.
                </p>
                <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-block w-full bg-[#82cfff] py-2.5 text-center text-[16px] uppercase text-black transition-colors hover:bg-[#6b6b6b] hover:text-[#82cfff]"
                >
                    Open the {languageLabels[document.language].name} report
                </a>
            </div>
        </article>
    )
}
