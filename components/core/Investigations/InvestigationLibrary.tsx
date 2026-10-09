"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { PublicInvestigation } from "@/lib/investigations/queries";
import { languageLabels } from "@/lib/investigations/shared";
import { duration } from "@/lib/format";
import { displayDate } from "@/components/core/Investigations/format";

type Tab = "watch" | "read";

export default function InvestigationLibrary({ investigations }: { investigations: PublicInvestigation[] }) {
    const [activeTab, setActiveTab] = useState<Tab>("watch");
    const [category, setCategory] = useState("All");

    const categories = ["All", ...new Set(investigations.map((item) => item.category))];
    const items = investigations.filter((item) => category === "All" || item.category === category);

    // Watch lists investigations with a video, Read lists those with a document
    const watchItems = items.filter((item) => item.video);
    const readItems = items.filter((item) => item.documents.length > 0);

    const tabs: { id: Tab, label: string, count: number }[] = [
        { id: "watch", label: "Watch", count: investigations.filter((item) => item.video).length },
        { id: "read", label: "Read Reports", count: investigations.filter((item) => item.documents.length).length },
    ];

    const visible = activeTab === "watch" ? watchItems : readItems;

    return (
        <section className="bg-background px-6 pb-30 pt-10 text-white md:px-20 lg:px-49">

            {/* TABS */}
            <div className="flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`cursor-pointer border-b pb-2 text-[16px] uppercase transition-colors ${activeTab === tab.id ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/70"}`}
                        >
                            {tab.label}
                            <span className="ml-2 text-[12px] text-[#82CFFF]">{String(tab.count).padStart(2, "0")}</span>
                        </button>
                    ))}
                </div>

                {categories.length > 2 && (
                    <div className="flex flex-wrap gap-2">
                        {categories.map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setCategory(item)}
                                className={`cursor-pointer rounded-full border px-4 py-1 text-[12px] uppercase tracking-widest transition-colors ${category === item ? "border-white bg-white text-black" : "border-white/25 text-white/60 hover:border-white/50"}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                )}
            </div>


            {/* WATCH */}
            {activeTab === "watch" && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                    {watchItems.map((item) => (
                        <Link key={item.slug} href={`/investigations/${item.slug}`} className="group block">
                            <div className="mb-3 mt-10 flex items-center justify-between">
                                <p className="text-[12px] uppercase tracking-[0.15em]">{item.category}</p>
                                <div className="flex items-center gap-3">
                                    {item.video?.durationSeconds ? (
                                        <span className="text-[12px] text-[#82CFFF]">{duration(item.video.durationSeconds)}</span>
                                    ) : null}
                                    {item.publishedAt && <span className="text-[12px]">{displayDate(item.publishedAt)}</span>}
                                </div>
                            </div>

                            <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                                <Image
                                    src={item.thumbnail}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                            </div>

                            <div className="mt-3">
                                <h3 className="text-[16px] font-medium leading-snug tracking-tight transition-colors duration-200 group-hover:text-neutral-500">
                                    {item.title}
                                </h3>
                                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                                    {item.summary}
                                </p>
                                {item.documents.length > 0 && (
                                    <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-[#82CFFF]">
                                        Report · {item.documents.map((doc) => languageLabels[doc.language].native).join(" / ")}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}


            {/* READ */}
            {activeTab === "read" && (
                <div className="pt-6">
                    {readItems.map((item, index) => (
                        <div
                            key={item.slug}
                            className="grid grid-cols-1 gap-6 border-b border-white/10 py-10 md:grid-cols-[80px_1fr_auto] md:items-center"
                        >
                            <span className="text-[44px] leading-none tracking-[-2.2px] text-white/30">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <div>
                                <div className="mb-3 flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.15em]">
                                    <span>{item.category}</span>
                                    {item.publishedAt && <span className="text-white/40">{displayDate(item.publishedAt)}</span>}
                                </div>

                                <Link href={`/investigations/${item.slug}?tab=read`} className="group">
                                    <h3 className="text-2xl uppercase transition-colors group-hover:text-neutral-500 md:text-3xl">
                                        {item.title}
                                    </h3>
                                </Link>

                                <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-[#c9c9c9]">
                                    {item.summary}
                                </p>
                            </div>

                            {/* One button per language version */}
                            <div className="flex flex-wrap gap-3 md:flex-col">
                                <Link
                                    href={`/investigations/${item.slug}?tab=read`}
                                    className="rounded-full border border-white px-6 py-2 text-center text-[12px] uppercase transition-colors hover:bg-white hover:text-black"
                                >
                                    Read
                                </Link>
                                {item.documents.map((doc) => (
                                    <a
                                        key={doc.language}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        lang={languageLabels[doc.language].htmlLang}
                                        className="rounded-full bg-[#82cfff] px-6 py-2 text-center text-[12px] uppercase text-black transition-colors hover:bg-[#6b6b6b] hover:text-[#82cfff]"
                                    >
                                        {languageLabels[doc.language].native}
                                        {doc.pages ? ` · ${doc.pages} pp` : ""}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {visible.length === 0 && (
                <p className="py-20 text-center text-[16px] uppercase text-white/40">Nothing here yet.</p>
            )}

        </section>
    )
}
