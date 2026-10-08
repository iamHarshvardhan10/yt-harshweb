"use client"

import * as React from "react"
import type { YouTubeVideo } from "@/lib/youtube"
import { compact } from "@/lib/format"

/**
 * Views per recent upload — single series, horizontal bars (long titles read
 * left of the bar). Values at the bar tips; hover/focus shows the details.
 * The Recent Videos table on the same page is this chart's table view.
 */

const full = new Intl.NumberFormat("en")

function niceMax(value: number) {
    if (value <= 0) return 1
    const magnitude = 10 ** Math.floor(Math.log10(value))
    const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value)!
    return step * magnitude
}

export default function UploadViewsChart({ videos }: { videos: YouTubeVideo[] }) {
    const [active, setActive] = React.useState<string | null>(null)

    const max = niceMax(Math.max(...videos.map((v) => v.views)))
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max)
    const average = videos.reduce((sum, v) => sum + v.views, 0) / videos.length

    return (
        <div className="viz-root">
            {/* Axis ticks */}
            <div className="ml-[38%] grid grid-cols-[repeat(4,1fr)_0] pb-2 text-[10px] text-zinc-500 dark:text-zinc-400 sm:ml-[34%]">
                {ticks.map((t) => (
                    <span key={t} className="-translate-x-1/2 tabular-nums">{compact(t)}</span>
                ))}
            </div>

            <ul className="relative space-y-2" onMouseLeave={() => setActive(null)}>
                {/* Gridlines */}
                <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[38%] right-0 sm:left-[34%]">
                    {ticks.map((t) => (
                        <span
                            key={t}
                            className="absolute inset-y-0 w-px bg-zinc-100 dark:bg-zinc-800"
                            style={{ left: `${(t / max) * 100}%` }}
                        />
                    ))}
                    {/* Recent average reference */}
                    <span
                        className="absolute inset-y-0 w-px border-l border-dashed border-zinc-400 dark:border-zinc-500"
                        style={{ left: `${(average / max) * 100}%` }}
                    />
                </div>

                {videos.map((video) => {
                    const share = (video.views / max) * 100
                    const isActive = active === video.id

                    return (
                        <li
                            key={video.id}
                            className="relative grid grid-cols-[38%_1fr] items-center gap-3 sm:grid-cols-[34%_1fr]"
                            onMouseEnter={() => setActive(video.id)}
                        >
                            <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onFocus={() => setActive(video.id)}
                                onBlur={() => setActive(null)}
                                className="truncate text-right text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                title={video.title}
                            >
                                {video.title}
                            </a>

                            {/* Hit target = the full row height, bigger than the 16px bar */}
                            <div className="relative flex h-7 items-center">
                                <div
                                    className={`h-4 rounded-r-[4px] transition-opacity ${isActive || !active ? "opacity-100" : "opacity-40"}`}
                                    style={{ width: `${Math.max(share, 0.5)}%`, background: "var(--series-1)" }}
                                />
                                <span className="ml-2 text-xs font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                                    {compact(video.views)}
                                </span>

                                {isActive && (
                                    <div
                                        role="tooltip"
                                        className="absolute bottom-full z-10 mb-1 w-60 rounded-lg border border-zinc-200 bg-white p-3 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
                                        style={{ left: `min(${share}%, calc(100% - 15rem))` }}
                                    >
                                        <p className="line-clamp-2 font-medium text-zinc-900 dark:text-zinc-100">{video.title}</p>
                                        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-zinc-500 dark:text-zinc-400">
                                            <dt>Views</dt>
                                            <dd className="text-right tabular-nums text-zinc-900 dark:text-zinc-100">{full.format(video.views)}</dd>
                                            <dt>Likes</dt>
                                            <dd className="text-right tabular-nums text-zinc-900 dark:text-zinc-100">{video.likes === null ? "hidden" : full.format(video.likes)}</dd>
                                            <dt>Comments</dt>
                                            <dd className="text-right tabular-nums text-zinc-900 dark:text-zinc-100">{video.comments === null ? "off" : full.format(video.comments)}</dd>
                                            <dt>vs. average</dt>
                                            <dd className="text-right tabular-nums text-zinc-900 dark:text-zinc-100">{(video.views / average).toFixed(1)}×</dd>
                                        </dl>
                                    </div>
                                )}
                            </div>
                        </li>
                    )
                })}
            </ul>

            <p className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span aria-hidden className="inline-block h-3 w-0 border-l border-dashed border-zinc-400" />
                Dashed line: average of these uploads ({compact(Math.round(average))} views)
            </p>

            <style>{`
                .viz-root { --series-1: #ef4444; }
                @media (prefers-color-scheme: dark) { :root:where(:not([data-theme="light"])) .viz-root { --series-1: #e66767; } }
                :root[data-theme="dark"] .viz-root, .dark .viz-root { --series-1: #e66767; }
            `}</style>
        </div>
    )
}
