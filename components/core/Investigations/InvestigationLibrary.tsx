"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { investigations } from "@/app/utils/constant";

type Tab = "watch" | "read";

const tabs: { id: Tab, label: string }[] = [
    { id: "watch", label: "Watch" },
    { id: "read", label: "Read Reports" },
];

export default function InvestigationLibrary() {
    const [activeTab, setActiveTab] = useState<Tab>("watch");
    const [category, setCategory] = useState("All");

    const categories = ["All", ...new Set(investigations.map((item) => item.category))];
    const items = investigations.filter((item) => category === "All" || item.category === category);

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
                            <span className="ml-2 text-[12px] text-[#82CFFF]">{String(investigations.length).padStart(2, "0")}</span>
                        </button>
                    ))}
                </div>

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
            </div>


            {/* WATCH */}
            {activeTab === "watch" && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <Link key={item.slug} href={`/investigations/${item.slug}`} className="group block">
                            <div className="mb-3 mt-10 flex items-center justify-between">
                                <p className="text-[12px] uppercase tracking-[0.15em]">{item.category}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] text-[#82CFFF]">{item.duration}</span>
                                    <span className="text-[12px]">{item.date}</span>
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
                            </div>
                        </Link>
                    ))}
                </div>
            )}


            {/* READ */}
            {activeTab === "read" && (
                <div className="pt-6">
                    {items.map((item, index) => (
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
                                    <span className="text-[#82CFFF]">{item.pages} pages</span>
                                    <span className="text-white/40">{item.readTime} read</span>
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

                            <div className="flex gap-3 md:flex-col">
                                <Link
                                    href={`/investigations/${item.slug}?tab=read`}
                                    className="rounded-full border border-white px-6 py-2 text-center text-[12px] uppercase transition-colors hover:bg-white hover:text-black"
                                >
                                    Read
                                </Link>
                                <a
                                    href={item.pdfUrl}
                                    download
                                    className="rounded-full bg-[#82cfff] px-6 py-2 text-center text-[12px] uppercase text-black transition-colors hover:bg-[#6b6b6b] hover:text-[#82cfff]"
                                >
                                    PDF · {item.pdfSize}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {items.length === 0 && (
                <p className="py-20 text-center text-[16px] uppercase text-white/40">Nothing here yet.</p>
            )}

        </section>
    )
}
