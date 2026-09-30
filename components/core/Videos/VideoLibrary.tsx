"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { videos, ContentType } from "@/app/utils/constant";

const tabs: { id: ContentType, label: string }[] = [
    { id: "video", label: "Videos" },
    { id: "short", label: "Shorts" },
];

export default function VideoLibrary() {
    const [activeTab, setActiveTab] = useState<ContentType>("video");
    const [category, setCategory] = useState("All");

    const tabItems = videos.filter((video) => video.type === activeTab);
    const categories = ["All", ...new Set(tabItems.map((video) => video.category))];
    const items = tabItems.filter((video) => category === "All" || video.category === category);

    return (
        <section className="bg-background px-6 pb-30 pt-10 text-white md:px-20 lg:px-49">

            {/* TABS */}
            <div className="flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-8">
                    {tabs.map((tab) => {
                        const count = videos.filter((video) => video.type === tab.id).length;
                        const active = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setCategory("All");
                                }}
                                className={`cursor-pointer border-b pb-2 text-[16px] uppercase transition-colors ${active ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/70"}`}
                            >
                                {tab.label}
                                <span className="ml-2 text-[12px] text-[#82CFFF]">{String(count).padStart(2, "0")}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-wrap gap-2">
                    {categories.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setCategory(item)}
                            className={`cursor-pointer rounded-full border px-4 py-1 text-[12px] uppercase tracking-[0.1em] transition-colors ${category === item ? "border-white bg-white text-black" : "border-white/25 text-white/60 hover:border-white/50"}`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>


            {/* GRID */}
            {activeTab === "video" ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((video) => (
                        <Link
                            href={video.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={video.id}
                            className="group block"
                        >
                            <div className="mb-3 mt-10 flex items-center justify-between">
                                <p className="text-[12px] uppercase tracking-[0.15em]">{video.category}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] text-[#82CFFF]">{video.duration}</span>
                                    <span className="text-[12px]">{video.publishedAt}</span>
                                </div>
                            </div>

                            <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                                <Image
                                    src={video.thumbnail}
                                    alt={video.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                />
                                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                            </div>

                            <div className="mt-3">
                                <h3 className="text-[16px] font-medium leading-snug tracking-tight transition-colors duration-200 group-hover:text-neutral-500">
                                    {video.title}
                                </h3>
                                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                                    {video.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 pt-16 sm:grid-cols-3 lg:grid-cols-5">
                    {items.map((short) => (
                        <Link
                            href={short.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={short.id}
                            className="group block"
                        >
                            <div className="relative aspect-9/16 w-full overflow-hidden bg-neutral-900">
                                <Image
                                    src={short.thumbnail}
                                    alt={short.title}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

                                <span className="absolute right-2 top-2 bg-black/70 px-1.5 py-0.5 text-[10px] text-[#82CFFF]">
                                    {short.duration}
                                </span>

                                <h3 className="absolute inset-x-3 bottom-3 text-[14px] font-medium uppercase leading-snug">
                                    {short.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {items.length === 0 && (
                <p className="py-20 text-center text-[16px] uppercase text-white/40">Nothing here yet.</p>
            )}

        </section>
    )
}
