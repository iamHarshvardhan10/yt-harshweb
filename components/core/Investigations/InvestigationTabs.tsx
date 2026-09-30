"use client";

import { useState } from "react";

import type { Investigation } from "@/app/utils/constant";

type Tab = "watch" | "read";

export default function InvestigationTabs({ investigation, initialTab }: { investigation: Investigation, initialTab: Tab }) {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);

    return (
        <section className="bg-background px-6 pb-30 text-white md:px-20 lg:px-49">

            {/* TABS */}
            <div className="flex items-center gap-8 border-b border-white/10 pb-6">
                {([["watch", "Watch Video"], ["read", "Read Report"]] as const).map(([id, label]) => (
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


            <div className="grid grid-cols-1 gap-12 pt-12 lg:grid-cols-[1fr_320px]">

                {/* MAIN */}
                <div>
                    {activeTab === "watch" ? (
                        <>
                            <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${investigation.youtubeId}`}
                                    title={investigation.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 h-full w-full"
                                />
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.15em]">
                                    <span className="text-[#82CFFF]">{investigation.duration}</span>
                                    <span>{investigation.date}</span>
                                </div>
                                <a
                                    href={investigation.youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full border border-white px-6 py-2 text-[12px] uppercase transition-colors hover:bg-white hover:text-black"
                                >
                                    Watch on YouTube
                                </a>
                            </div>
                        </>
                    ) : (
                        <article className="max-w-3xl">
                            {investigation.body.map((paragraph) => (
                                <p key={paragraph} className="mb-6 text-[18px] leading-[1.7] text-[#c9c9c9]">
                                    {paragraph}
                                </p>
                            ))}

                            <div className="mt-10 border border-white/25 p-6">
                                <p className="text-[12px] uppercase tracking-[0.15em] text-[#82CFFF]">Full Report</p>
                                <p className="mt-2 text-[16px] uppercase">
                                    The complete report includes every source, dataset and document we used.
                                </p>
                                <a
                                    href={investigation.pdfUrl}
                                    download
                                    className="mt-6 inline-block w-full bg-[#82cfff] py-2.5 text-center text-[16px] uppercase text-black transition-colors hover:bg-[#6b6b6b] hover:text-[#82cfff]"
                                >
                                    Download PDF · {investigation.pdfSize}
                                </a>
                            </div>
                        </article>
                    )}
                </div>


                {/* SIDEBAR */}
                <aside className="space-y-10">
                    <div>
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

                    <div className="border-t border-white/10 pt-8">
                        <p className="mb-4 text-[12px] uppercase tracking-[0.15em] text-white/40">Details</p>
                        <dl className="space-y-3 text-[14px] uppercase">
                            {[
                                ["Category", investigation.category],
                                ["Published", investigation.date],
                                ["Video", investigation.duration],
                                ["Report", `${investigation.pages} pages`],
                                ["Read time", investigation.readTime],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between">
                                    <dt className="text-white/40">{label}</dt>
                                    <dd>{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </aside>

            </div>
        </section>
    )
}
