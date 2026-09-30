"use client"

import * as React from "react"

import {
    Users,
    UserPlus,
    Clock3,
    Eye,
    Globe,
    Smartphone,
    Monitor,
    Tablet,
    TrendingUp,
    MousePointerClick,
} from "lucide-react"


const stats = [
    { label: "Subscribers", value: "12.4K", change: "+8.2%", icon: Users },
    { label: "New Subscribers", value: "+1,284", change: "+14.1%", icon: UserPlus },
    { label: "Unique Viewers", value: "286K", change: "+18.4%", icon: Eye },
    { label: "Avg. View Duration", value: "6:42", change: "+0:38", icon: Clock3 },
]


const ageGroups = [
    { label: "13–17", value: 6 },
    { label: "18–24", value: 34 },
    { label: "25–34", value: 38 },
    { label: "35–44", value: 14 },
    { label: "45–54", value: 5 },
    { label: "55+", value: 3 },
]


const countries = [
    { label: "India", value: 78 },
    { label: "United States", value: 6 },
    { label: "United Arab Emirates", value: 4 },
    { label: "United Kingdom", value: 3 },
    { label: "Nepal", value: 2 },
]


const trafficSources = [
    { label: "Browse features", value: 41 },
    { label: "YouTube search", value: 24 },
    { label: "Suggested videos", value: 19 },
    { label: "External (website, social)", value: 11 },
    { label: "Direct / unknown", value: 5 },
]


const devices = [
    { label: "Mobile", value: 72, icon: Smartphone },
    { label: "Desktop", value: 18, icon: Monitor },
    { label: "Tablet", value: 6, icon: Tablet },
    { label: "TV", value: 4, icon: Monitor },
]


const topTopics = [
    { topic: "Government & Policy", views: "412K", retention: "58%" },
    { topic: "Climate & Disasters", views: "298K", retention: "54%" },
    { topic: "Urban Infrastructure", views: "218K", retention: "51%" },
    { topic: "Education", views: "98K", retention: "47%" },
]


const activeHours = [2, 1, 1, 1, 2, 3, 5, 7, 8, 7, 6, 6, 7, 6, 6, 7, 8, 10, 13, 15, 14, 11, 7, 4]


export default function AudiencePage() {

    const [range, setRange] =
        React.useState("Last 28 days")

    const peak = Math.max(...activeHours)


    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                        Community
                    </p>

                    <h1 className="text-lg font-semibold">
                        Audience
                    </h1>
                </div>

                <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                    <option>Last 7 days</option>
                    <option>Last 28 days</option>
                    <option>Last 90 days</option>
                    <option>Last year</option>
                </select>

            </header>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="min-h-[calc(100vh-64px)]">

                <div className="mx-auto max-w-7xl px-6 py-8">

                    {/* STATS */}

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        {stats.map((stat) => {
                            const Icon = stat.icon
                            return (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-medium text-zinc-500">
                                            {stat.label}
                                        </p>
                                        <Icon size={17} className="text-zinc-400" />
                                    </div>
                                    <p className="mt-4 text-2xl font-semibold tracking-tight">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-red-500">
                                        {stat.change}
                                    </p>
                                </div>
                            )
                        })}

                    </div>


                    {/* ACTIVE HOURS + DEVICES */}

                    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">

                        <Panel
                            title="When Your Viewers Are Online"
                            subtitle="Average activity by hour (IST)"
                        >

                            <div className="flex h-44 items-end gap-1">
                                {activeHours.map((value, hour) => (
                                    <div
                                        key={hour}
                                        className="group relative flex flex-1 flex-col items-center justify-end"
                                        style={{ height: "100%" }}
                                    >
                                        <div
                                            className={`w-full rounded-t ${value === peak
                                                ? "bg-red-500"
                                                : "bg-zinc-200 group-hover:bg-red-500/60 dark:bg-zinc-800"
                                                }`}
                                            style={{ height: `${(value / peak) * 100}%` }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
                                <span>12 AM</span>
                                <span>6 AM</span>
                                <span>12 PM</span>
                                <span>6 PM</span>
                                <span>11 PM</span>
                            </div>

                            <div className="mt-5 rounded-lg bg-red-500/5 p-3">
                                <p className="text-xs font-medium text-red-500">
                                    Best time to publish
                                </p>
                                <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                                    Your audience peaks around 7–8 PM IST. Publishing at 6 PM gives the algorithm an hour to pick up momentum.
                                </p>
                            </div>

                        </Panel>


                        <Panel title="Devices" subtitle="How viewers watch">

                            <div className="space-y-5">
                                {devices.map((device) => {
                                    const Icon = device.icon
                                    return (
                                        <div key={device.label}>
                                            <div className="mb-2 flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-2 text-zinc-500">
                                                    <Icon size={14} />
                                                    {device.label}
                                                </span>
                                                <span className="font-medium">
                                                    {device.value}%
                                                </span>
                                            </div>
                                            <Bar value={device.value} />
                                        </div>
                                    )
                                })}
                            </div>

                        </Panel>

                    </div>


                    {/* DEMOGRAPHICS */}

                    <div className="mt-6 grid gap-6 lg:grid-cols-3">

                        <Panel title="Age" subtitle="Viewer age distribution">
                            <BarList items={ageGroups} />
                            <div className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-800">
                                <p className="text-xs text-zinc-500">
                                    Gender
                                </p>
                                <div className="mt-3 flex h-2 overflow-hidden rounded-full">
                                    <div className="w-[82%] bg-red-500" />
                                    <div className="w-[17%] bg-zinc-400" />
                                    <div className="w-[1%] bg-zinc-200 dark:bg-zinc-700" />
                                </div>
                                <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
                                    <span>Male 82%</span>
                                    <span>Female 17%</span>
                                    <span>Other 1%</span>
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Top Countries" subtitle="Where viewers are located">
                            <div className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
                                <Globe size={14} />
                                Viewers from 64 countries
                            </div>
                            <BarList items={countries} />
                        </Panel>

                        <Panel title="Traffic Sources" subtitle="How viewers find you">
                            <div className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
                                <MousePointerClick size={14} />
                                Website drove 11% of views
                            </div>
                            <BarList items={trafficSources} />
                        </Panel>

                    </div>


                    {/* TOP TOPICS */}

                    <section className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

                        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                            <h2 className="font-semibold">
                                Topics Your Audience Loves
                            </h2>
                            <p className="mt-1 text-xs text-zinc-500">
                                Views and retention by topic
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Topic</th>
                                        <th className="px-5 py-3 font-medium">Views</th>
                                        <th className="px-5 py-3 font-medium">Avg. Retention</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {topTopics.map((row, index) => (
                                        <tr key={row.topic} className="transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                            <td className="px-5 py-4 font-medium">
                                                <span className="mr-3 text-[10px] font-semibold tracking-widest text-red-500">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                                {row.topic}
                                            </td>
                                            <td className="px-5 py-4">{row.views}</td>
                                            <td className="px-5 py-4 text-zinc-500">{row.retention}</td>
                                            <td className="px-5 py-4 text-right">
                                                {index === 0 && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                                                        <TrendingUp size={13} /> Top
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </section>

                </div>

            </main>

        </div>
    )
}


/* =============================================================
   PANEL
============================================================= */

function Panel({
    title,
    subtitle,
    children,
}: {
    title: string
    subtitle: string
    children: React.ReactNode
}) {

    return (
        <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                <h2 className="font-semibold">
                    {title}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                    {subtitle}
                </p>
            </div>

            <div className="p-5">
                {children}
            </div>

        </section>
    )
}


/* =============================================================
   BAR
============================================================= */

function Bar({ value }: { value: number }) {

    return (
        <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
                className="h-full rounded-full bg-red-500"
                style={{ width: `${value}%` }}
            />
        </div>
    )
}


function BarList({
    items,
}: {
    items: { label: string, value: number }[]
}) {

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.label}>
                    <div className="mb-2 flex justify-between text-xs">
                        <span className="text-zinc-500">
                            {item.label}
                        </span>
                        <span className="font-medium">
                            {item.value}%
                        </span>
                    </div>
                    <Bar value={item.value} />
                </div>
            ))}
        </div>
    )
}
