"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Click-to-play YouTube player. Shows the thumbnail until it's clicked, so the
 * page doesn't load YouTube's ~1MB of player scripts up front (better Core Web Vitals).
 */
export default function YouTubeEmbed({
    id,
    title,
    thumbnail,
    vertical = false,
    priority = false,
}: {
    id: string,
    title: string,
    thumbnail: string,
    /** Shorts are 9:16 */
    vertical?: boolean,
    /** Above the fold: load the thumbnail right away */
    priority?: boolean,
}) {
    const [playing, setPlaying] = useState(false);

    return (
        <div className={`relative w-full overflow-hidden bg-neutral-900 ${vertical ? "mx-auto aspect-9/16 max-w-sm" : "aspect-video"}`}>
            {playing ? (
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                />
            ) : (
                <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    aria-label={`Play video: ${title}`}
                    className="group absolute inset-0 cursor-pointer"
                >
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        sizes={vertical ? "384px" : "(max-width: 1024px) 100vw, 900px"}
                        loading={priority ? "eager" : "lazy"}
                        fetchPriority={priority ? "high" : undefined}
                        className="object-cover"
                    />
                    <span className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/10" />
                    <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-black/60 transition-transform group-hover:scale-110 md:h-20 md:w-20">
                        <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-white md:h-8 md:w-8" aria-hidden>
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </span>
                </button>
            )}
        </div>
    );
}
