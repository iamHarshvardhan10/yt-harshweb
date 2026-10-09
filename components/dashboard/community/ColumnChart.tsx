"use client"

import * as React from "react"
import { compact } from "@/lib/format"

/**
 * Single-series vertical bars (one measure across a few ordered categories,
 * e.g. weekdays). The tallest bar is labelled; hover / focus shows every value.
 * A visually hidden table carries the same numbers for screen readers.
 */

export type Column = { label: string; value: number | null; detail?: string }

const full = new Intl.NumberFormat("en")

function niceMax(value: number) {
    if (value <= 0) return 1
    const magnitude = 10 ** Math.floor(Math.log10(value))
    const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value)!
    return step * magnitude
}

export default function ColumnChart({
    columns,
    valueLabel,
    caption,
}: {
    columns: Column[]
    valueLabel: string
    caption: string
}) {
    const [active, setActive] = React.useState<number | null>(null)

    const values = columns.map((c) => c.value ?? 0)
    const max = niceMax(Math.max(...values))
    const best = values.indexOf(Math.max(...values))
    const ticks = [1, 0.5, 0]

    return (
        <div className="column-chart">
            <div className="relative flex h-44 gap-2 pl-9" onMouseLeave={() => setActive(null)}>
                {/* Recessive axis + gridlines */}
                <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 right-0">
                    {ticks.map((t) => (
                        <div key={t} className="absolute left-0 right-0 flex items-center gap-2" style={{ bottom: `${t * 100}%` }}>
                            <span className="w-7 translate-y-1/2 text-right text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400">
                                {compact(t * max)}
                            </span>
                            <span className={`h-px flex-1 ${t === 0 ? "bg-zinc-300 dark:bg-zinc-700" : "bg-zinc-100 dark:bg-zinc-800"}`} />
                        </div>
                    ))}
                </div>

                {columns.map((column, index) => {
                    const height = ((column.value ?? 0) / max) * 100
                    const isActive = active === index

                    return (
                        <button
                            key={column.label}
                            type="button"
                            onMouseEnter={() => setActive(index)}
                            onFocus={() => setActive(index)}
                            onBlur={() => setActive(null)}
                            aria-label={`${column.label}: ${column.value === null ? "no uploads" : `${full.format(Math.round(column.value))} ${valueLabel}`}`}
                            className="relative z-[1] flex flex-1 cursor-default flex-col justify-end focus:outline-none"
                        >
                            {/* Selective direct label: the best column only */}
                            {index === best && column.value !== null && (
                                <span className="mb-1 text-center text-[10px] font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                                    {compact(column.value)}
                                </span>
                            )}

                            <span
                                className={`block w-full rounded-t-[4px] transition-opacity ${active === null || isActive ? "opacity-100" : "opacity-40"}`}
                                style={{
                                    height: column.value === null ? 0 : `max(${height}%, 2px)`,
                                    background: "var(--series-1)",
                                }}
                            />

                            {isActive && (
                                <span
                                    role="tooltip"
                                    className="absolute bottom-full left-1/2 z-10 mb-2 w-44 -translate-x-1/2 rounded-lg border border-zinc-200 bg-white p-2.5 text-left text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
                                >
                                    <span className="block font-medium text-zinc-900 dark:text-zinc-100">{column.label}</span>
                                    <span className="mt-1 block tabular-nums text-zinc-900 dark:text-zinc-100">
                                        {column.value === null ? "No uploads" : `${full.format(Math.round(column.value))} ${valueLabel}`}
                                    </span>
                                    {column.detail && <span className="mt-0.5 block text-zinc-500 dark:text-zinc-400">{column.detail}</span>}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="mt-2 flex gap-2 pl-9">
                {columns.map((column) => (
                    <span key={column.label} className="flex-1 truncate text-center text-[10px] text-zinc-500 dark:text-zinc-400">
                        {column.label}
                    </span>
                ))}
            </div>

            <table className="sr-only">
                <caption>{caption}</caption>
                <tbody>
                    {columns.map((column) => (
                        <tr key={column.label}>
                            <th scope="row">{column.label}</th>
                            <td>{column.value === null ? "No uploads" : Math.round(column.value)}</td>
                            <td>{column.detail}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style>{`
                .column-chart { --series-1: #ef4444; }
                @media (prefers-color-scheme: dark) { :root:where(:not([data-theme="light"])) .column-chart { --series-1: #e66767; } }
                :root[data-theme="dark"] .column-chart, .dark .column-chart { --series-1: #e66767; }
            `}</style>
        </div>
    )
}
