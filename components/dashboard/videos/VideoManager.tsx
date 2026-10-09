"use client"

import * as React from "react"
import Image from "next/image"

import {
    Search,
    RefreshCw,
    Video as VideoIcon,
    Play,
    Eye,
    EyeOff,
    Star,
    Home,
    ExternalLink,
    MoreHorizontal,
    Check,
    X,
    ArrowUpDown,
    Clock3,
    BarChart3,
    Film,
    Smartphone,
} from "lucide-react"

import type { YouTubeResult, YouTubeUpload, YouTubeUploads } from "@/lib/youtube"
import { compact, duration, relativeTime } from "@/lib/format"
import { DEFAULT_VIDEO_SETTINGS, VIDEO_CATEGORIES, type VideoWebsiteSettings } from "@/lib/videos/shared"
import { api } from "@/components/dashboard/home/api"
import YouTubeSetup from "@/components/dashboard/YouTubeSetup"


type VideoType = YouTubeUpload["type"]

type DashboardVideo = YouTubeUpload & VideoWebsiteSettings

type SortKey = "newest" | "views"

type SaveState = { type: "saving" | "saved" | "error"; text: string } | null

const full = new Intl.NumberFormat("en")


const noUploads: Omit<YouTubeUploads, "channel"> = { uploads: [], truncated: false, channelUrl: "https://www.youtube.com" }


export default function VideoManager({
    result,
    savedSettings,
    onSync,
}: {
    result: YouTubeResult<YouTubeUploads>
    savedSettings: Record<string, VideoWebsiteSettings>
    onSync: () => Promise<void>
}) {

    const { uploads, truncated, channelUrl } =
        result.status === "ok" ? result.data : noUploads

    // Website settings are kept per video id so a sync refreshes the YouTube
    // data without losing what was changed here
    const [settings, setSettings] =
        React.useState<Record<string, VideoWebsiteSettings>>(savedSettings)

    const [saveState, setSaveState] =
        React.useState<SaveState>(null)

    // Display order is typed, then saved when the field loses focus
    const [orderDraft, setOrderDraft] =
        React.useState<string | null>(null)

    const [activeTab, setActiveTab] =
        React.useState<"all" | VideoType>("all")

    const [search, setSearch] =
        React.useState("")

    const [sortBy, setSortBy] =
        React.useState<SortKey>("newest")

    const [selectedId, setSelectedId] =
        React.useState<string | null>(null)

    const [syncing, startSync] =
        React.useTransition()

    const [syncError, setSyncError] =
        React.useState<string | null>(null)


    const videos: DashboardVideo[] = uploads.map((video) => ({
        ...video,
        ...DEFAULT_VIDEO_SETTINGS,
        ...settings[video.id],
    }))

    const selectedVideo =
        videos.find((video) => video.id === selectedId) ?? null


    /* =========================================================
       FILTER + SORT
    ========================================================= */

    const query = search.trim().toLowerCase()

    const filteredVideos = videos.filter((video) => {

        const matchesType =
            activeTab === "all" ||
            video.type === activeTab

        const matchesSearch =
            video.title
                .toLowerCase()
                .includes(query)

        return matchesType && matchesSearch
    })

    // uploads arrive newest first
    if (sortBy === "views") {
        filteredVideos.sort((a, b) => b.views - a.views)
    }


    /* =========================================================
       STATS
    ========================================================= */

    const totalVideos =
        videos.filter((video) => video.type === "video").length

    const totalShorts =
        videos.filter((video) => video.type === "short").length

    const visibleVideos =
        videos.filter((video) => video.isVisible).length

    const hiddenVideos =
        videos.filter((video) => !video.isVisible).length


    /* =========================================================
       UPDATE VIDEO
    ========================================================= */

    /** Applies the change right away and saves it; puts the old values back if saving fails */
    async function updateVideo(
        id: string,
        updates: Partial<VideoWebsiteSettings>
    ) {

        const previous = settings[id] ?? DEFAULT_VIDEO_SETTINGS

        setSettings((current) => ({
            ...current,
            [id]: { ...(current[id] ?? DEFAULT_VIDEO_SETTINGS), ...updates },
        }))
        setSaveState({ type: "saving", text: "Saving…" })

        try {
            const { setting } = await api<{ setting: VideoWebsiteSettings }>(
                `/api/videos/${encodeURIComponent(id)}`,
                { method: "PATCH", json: updates }
            )
            setSettings((current) => ({ ...current, [id]: setting }))
            setSaveState({ type: "saved", text: "Saved — live on the website" })
        } catch (err) {
            setSettings((current) => ({ ...current, [id]: previous }))
            setSaveState({ type: "error", text: err instanceof Error ? err.message : "Couldn't save" })
        }
    }

    function openVideo(id: string | null) {
        setSelectedId(id)
        setOrderDraft(null)
        setSaveState(null)
    }

    function saveOrder(video: DashboardVideo) {
        if (orderDraft === null) return
        const value = orderDraft.trim() === "" ? null : Math.round(Number(orderDraft))
        setOrderDraft(null)
        if (value !== null && (!Number.isFinite(value) || value < 1)) {
            setSaveState({ type: "error", text: "Display order must be 1 or more" })
            return
        }
        if (value !== video.displayOrder) updateVideo(video.id, { displayOrder: value })
    }


    /* =========================================================
       SYNC YOUTUBE
    ========================================================= */

    function syncYouTube() {

        setSyncError(null)

        startSync(async () => {
            try {
                await onSync()
            } catch {
                setSyncError("Sync failed — try again")
            }
        })
    }


    return (

        <div className="min-h-full bg-zinc-50 dark:bg-black">


            {/* =====================================================
                HEADER
            ===================================================== */}

            <header
                className="
                    sticky
                    top-0
                    z-30
                    flex
                    h-16
                    items-center
                    justify-between
                    border-b
                    border-zinc-200
                    bg-white/95
                    px-6
                    backdrop-blur
                    dark:border-zinc-800
                    dark:bg-zinc-950/95
                "
            >

                <div>

                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                        Website
                    </p>

                    <h1 className="text-lg font-semibold">
                        Videos
                    </h1>

                </div>


                <div className="flex items-center gap-2">

                    <div className="hidden items-center gap-2 text-xs text-zinc-500 sm:flex">

                        {syncError ? (
                            <span className="text-red-500">{syncError}</span>
                        ) : (
                            <>
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${result.status === "ok" ? "bg-green-500" : "bg-zinc-400"}`}
                                />

                                {result.status === "ok"
                                    ? "YouTube connected"
                                    : "YouTube not connected"}
                            </>
                        )}

                    </div>


                    <button
                        type="button"
                        onClick={syncYouTube}
                        disabled={syncing || result.status === "unconfigured"}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-zinc-200
                            bg-white
                            px-3
                            py-2
                            text-sm
                            font-medium
                            transition
                            hover:bg-zinc-100
                            disabled:opacity-50
                            dark:border-zinc-800
                            dark:bg-zinc-900
                            dark:hover:bg-zinc-800
                        "
                    >

                        <RefreshCw
                            size={15}
                            className={syncing ? "animate-spin" : ""}
                        />

                        {syncing ? "Syncing..." : "Sync YouTube"}

                    </button>

                </div>

            </header>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="min-h-[calc(100vh-64px)]">

                <div className="mx-auto max-w-7xl px-6 py-8">

                    {result.status !== "ok" ? (

                        <YouTubeSetup
                            error={result.status === "error" ? result.message : null}
                            description="Your channel's videos and Shorts appear here once an API key is set."
                            className="rounded-xl"
                        />

                    ) : (<>


                    {/* =================================================
                        STATS
                    ================================================= */}

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        <StatCard
                            icon={<Film size={17} />}
                            label="Total Videos"
                            value={totalVideos}
                        />

                        <StatCard
                            icon={<Smartphone size={17} />}
                            label="Total Shorts"
                            value={totalShorts}
                        />

                        <StatCard
                            icon={<Eye size={17} />}
                            label="Visible on Website"
                            value={visibleVideos}
                        />

                        <StatCard
                            icon={<EyeOff size={17} />}
                            label="Hidden"
                            value={hiddenVideos}
                        />

                    </div>


                    {/* =================================================
                        CONTENT HEADER
                    ================================================= */}

                    <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">


                        {/* TABS */}

                        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">

                            <TabButton
                                active={activeTab === "all"}
                                onClick={() => setActiveTab("all")}
                            >
                                All
                            </TabButton>

                            <TabButton
                                active={activeTab === "video"}
                                onClick={() => setActiveTab("video")}
                            >
                                Videos
                            </TabButton>

                            <TabButton
                                active={activeTab === "short"}
                                onClick={() => setActiveTab("short")}
                            >
                                Shorts
                            </TabButton>

                        </div>


                        {/* SEARCH */}

                        <div className="relative w-full lg:w-72">

                            <Search
                                size={16}
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-zinc-400
                                "
                            />

                            <input
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search videos..."
                                className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-zinc-200
                                    bg-white
                                    py-2.5
                                    pl-9
                                    pr-3
                                    text-sm
                                    outline-none
                                    focus:border-red-500
                                    focus:ring-2
                                    focus:ring-red-500/10
                                    dark:border-zinc-800
                                    dark:bg-zinc-950
                                "
                            />

                        </div>

                    </div>


                    {/* =================================================
                        TOOLBAR
                    ================================================= */}

                    <div className="mt-4 flex items-center justify-between">

                        <p className="text-xs text-zinc-500">
                            {filteredVideos.length} content items
                        </p>


                        <button
                            type="button"
                            onClick={() =>
                                setSortBy(sortBy === "newest" ? "views" : "newest")
                            }
                            className="
                                inline-flex
                                items-center
                                gap-2
                                text-xs
                                font-medium
                                text-zinc-500
                                hover:text-zinc-900
                                dark:hover:text-white
                            "
                        >

                            <ArrowUpDown size={14} />

                            {sortBy === "newest" ? "Newest first" : "Most viewed"}

                        </button>

                    </div>


                    {/* =================================================
                        VIDEO TABLE
                    ================================================= */}

                    <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

                        {/* TABLE HEADER */}

                        <div
                            className="
                                hidden
                                grid-cols-[40px_minmax(0,1fr)_100px_110px_90px_50px]
                                gap-4
                                border-b
                                border-zinc-200
                                px-4
                                py-3
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-wider
                                text-zinc-400
                                md:grid
                                dark:border-zinc-800
                            "
                        >

                            <div />

                            <div>
                                Content
                            </div>

                            <div>
                                Type
                            </div>

                            <div>
                                Performance
                            </div>

                            <div>
                                Website
                            </div>

                            <div />

                        </div>


                        {/* VIDEO ROWS */}

                        {filteredVideos.map((video) => (

                            <VideoRow
                                key={video.id}
                                video={video}
                                onClick={() =>
                                    openVideo(video.id)
                                }
                                onVisibilityChange={(visible) =>
                                    updateVideo(
                                        video.id,
                                        {
                                            isVisible: visible,
                                        }
                                    )
                                }
                            />

                        ))}


                        {filteredVideos.length === 0 && (

                            <div className="px-6 py-16 text-center">

                                <VideoIcon
                                    size={28}
                                    className="mx-auto text-zinc-300 dark:text-zinc-700"
                                />

                                <p className="mt-3 text-sm font-medium">
                                    No videos found
                                </p>

                                <p className="mt-1 text-xs text-zinc-500">
                                    {videos.length
                                        ? "Try another search or tab."
                                        : "This channel has no public uploads yet."}
                                </p>

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        SYNC INFO
                    ================================================= */}

                    <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-500">

                        <Clock3 size={13} />

                        {truncated
                            ? `Showing your latest ${videos.length} uploads. `
                            : ""}
                        YouTube data refreshes every 10 minutes — use Sync YouTube to fetch it now.

                        {truncated && (
                            <a
                                href={`${channelUrl}/videos`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-red-500 hover:text-red-400"
                            >
                                See all on YouTube
                            </a>
                        )}

                    </div>

                    </>)}

                </div>

            </main>


            {/* =====================================================
                DETAIL PANEL
            ===================================================== */}

            {selectedVideo && (

                <div className="fixed inset-0 z-50">

                    {/* BACKDROP */}

                    <button
                        type="button"
                        aria-label="Close"
                        onClick={() => openVideo(null)}
                        className="
                            absolute
                            inset-0
                            cursor-default
                            bg-black/40
                            backdrop-blur-sm
                        "
                    />


                    {/* PANEL */}

                    <aside
                        className="
                            absolute
                            right-0
                            top-0
                            h-full
                            w-full
                            max-w-md
                            overflow-y-auto
                            border-l
                            border-zinc-200
                            bg-white
                            shadow-2xl
                            dark:border-zinc-800
                            dark:bg-zinc-950
                        "
                    >

                        {/* PANEL HEADER */}

                        <div
                            className="
                                sticky
                                top-0
                                z-10
                                flex
                                items-center
                                justify-between
                                border-b
                                border-zinc-200
                                bg-white/95
                                px-5
                                py-4
                                backdrop-blur
                                dark:border-zinc-800
                                dark:bg-zinc-950/95
                            "
                        >

                            <div>

                                <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                                    Content Settings
                                </p>

                                <h2 className="mt-1 text-sm font-semibold">
                                    Video Settings
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    openVideo(null)
                                }
                                className="
                                    rounded-lg
                                    p-2
                                    text-zinc-400
                                    hover:bg-zinc-100
                                    hover:text-zinc-900
                                    dark:hover:bg-zinc-900
                                    dark:hover:text-white
                                "
                            >

                                <X size={17} />

                            </button>

                        </div>


                        <div className="p-5">


                            {/* THUMBNAIL */}

                            <a
                                href={selectedVideo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative block aspect-video overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900"
                            >

                                {selectedVideo.thumbnail ? (
                                    <Image
                                        src={selectedVideo.thumbnail}
                                        alt=""
                                        fill
                                        sizes="448px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <Play
                                        size={30}
                                        className="absolute inset-0 m-auto text-zinc-400"
                                    />
                                )}

                                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white">
                                    {duration(selectedVideo.durationSeconds)}
                                </span>

                            </a>


                            {/* TITLE */}

                            <div className="mt-4">

                                <h3 className="text-base font-semibold leading-6">
                                    {selectedVideo.title}
                                </h3>

                                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">

                                    <span>
                                        {full.format(selectedVideo.views)} views
                                    </span>

                                    <span>•</span>

                                    <span>
                                        {relativeTime(selectedVideo.publishedAt)}
                                    </span>

                                </div>

                                <div className="mt-4 grid grid-cols-3 divide-x divide-zinc-200 rounded-lg border border-zinc-200 text-center dark:divide-zinc-800 dark:border-zinc-800">

                                    <PanelStat
                                        label="Views"
                                        value={compact(selectedVideo.views)}
                                    />

                                    <PanelStat
                                        label="Likes"
                                        value={selectedVideo.likes === null ? "Hidden" : compact(selectedVideo.likes)}
                                    />

                                    <PanelStat
                                        label="Comments"
                                        value={selectedVideo.comments === null ? "Off" : compact(selectedVideo.comments)}
                                    />

                                </div>

                            </div>


                            {/* TYPE */}

                            <div className="mt-6">

                                <label className="text-xs font-medium text-zinc-500">
                                    Content Type
                                </label>

                                <div className="mt-2 flex items-center gap-2">

                                    <span className="rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-medium dark:bg-zinc-900">

                                        {selectedVideo.type === "video"
                                            ? "YouTube Video"
                                            : "YouTube Short"}

                                    </span>

                                </div>

                            </div>


                            {/* WEBSITE SETTINGS */}

                            <div className="mt-7">

                                <div className="flex items-center justify-between">

                                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                        Website
                                    </p>

                                    {saveState && (
                                        <span
                                            role="status"
                                            className={`text-[11px] font-medium ${saveState.type === "error" ? "text-red-500" : saveState.type === "saved" ? "text-green-600" : "text-zinc-500"}`}
                                        >
                                            {saveState.text}
                                        </span>
                                    )}

                                </div>


                                <div className="mt-3 space-y-2">


                                    {/* SHOW ON WEBSITE */}

                                    <SettingRow
                                        icon={
                                            selectedVideo.isVisible
                                                ? <Eye size={16} />
                                                : <EyeOff size={16} />
                                        }
                                        title="Show on Website"
                                        description="List it on the website’s Videos page"
                                    >

                                        <Toggle
                                            checked={
                                                selectedVideo.isVisible
                                            }
                                            onChange={(checked) =>
                                                updateVideo(
                                                    selectedVideo.id,
                                                    {
                                                        isVisible: checked,
                                                    }
                                                )
                                            }
                                        />

                                    </SettingRow>


                                    {/* HOMEPAGE */}

                                    <SettingRow
                                        icon={<Home size={16} />}
                                        title="Show on Homepage"
                                        description="Pick the videos for the homepage section — if none are picked, the latest 6 show"
                                    >

                                        <Toggle
                                            checked={
                                                selectedVideo.showOnHome
                                            }
                                            onChange={(checked) =>
                                                updateVideo(
                                                    selectedVideo.id,
                                                    {
                                                        showOnHome: checked,
                                                    }
                                                )
                                            }
                                        />

                                    </SettingRow>


                                    {/* FEATURED */}

                                    <SettingRow
                                        icon={<Star size={16} />}
                                        title="Featured Video"
                                        description="Listed first on the website, with a Featured label"
                                    >

                                        <Toggle
                                            checked={
                                                selectedVideo.featured
                                            }
                                            onChange={(checked) =>
                                                updateVideo(
                                                    selectedVideo.id,
                                                    {
                                                        featured: checked,
                                                    }
                                                )
                                            }
                                        />

                                    </SettingRow>

                                </div>

                            </div>


                            {/* DISPLAY ORDER */}

                            <div className="mt-7">

                                <label className="text-xs font-medium text-zinc-500">
                                    Display Order
                                </label>

                                <input
                                    type="number"
                                    min={1}
                                    placeholder="Automatic (newest first)"
                                    value={orderDraft ?? selectedVideo.displayOrder ?? ""}
                                    onChange={(e) => setOrderDraft(e.target.value)}
                                    onBlur={() => saveOrder(selectedVideo)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") e.currentTarget.blur()
                                    }}
                                    className="
                                        mt-2
                                        w-full
                                        rounded-lg
                                        border
                                        border-zinc-200
                                        bg-white
                                        px-3
                                        py-2.5
                                        text-sm
                                        outline-none
                                        focus:border-red-500
                                        focus:ring-2
                                        focus:ring-red-500/10
                                        dark:border-zinc-800
                                        dark:bg-zinc-900
                                    "
                                />

                            </div>


                            {/* CATEGORY */}

                            <div className="mt-5">

                                <label className="text-xs font-medium text-zinc-500">
                                    Website Category
                                </label>

                                <select
                                    value={selectedVideo.category ?? ""}
                                    onChange={(e) =>
                                        updateVideo(
                                            selectedVideo.id,
                                            {
                                                category:
                                                    e.target.value || null,
                                            }
                                        )
                                    }
                                    className="
                                        mt-2
                                        w-full
                                        rounded-lg
                                        border
                                        border-zinc-200
                                        bg-white
                                        px-3
                                        py-2.5
                                        text-sm
                                        outline-none
                                        focus:border-red-500
                                        focus:ring-2
                                        focus:ring-red-500/10
                                        dark:border-zinc-800
                                        dark:bg-zinc-900
                                    "
                                >

                                    <option value="">
                                        Uncategorised
                                    </option>

                                    {/* keep a saved category that's no longer in the list */}
                                    {selectedVideo.category && !(VIDEO_CATEGORIES as readonly string[]).includes(selectedVideo.category) && (
                                        <option>{selectedVideo.category}</option>
                                    )}

                                    {VIDEO_CATEGORIES.map((category) => (
                                        <option key={category}>
                                            {category}
                                        </option>
                                    ))}

                                </select>

                            </div>


                            {/* YOUTUBE */}

                            <div className="mt-7 border-t border-zinc-200 pt-6 dark:border-zinc-800">

                                <a
                                    href={selectedVideo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                        flex
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        border
                                        border-zinc-200
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-medium
                                        hover:bg-zinc-100
                                        dark:border-zinc-800
                                        dark:hover:bg-zinc-900
                                    "
                                >

                                    <ExternalLink size={15} />

                                    Open on YouTube

                                </a>

                            </div>


                            {/* SAVE */}

                            <button
                                type="button"
                                onClick={() =>
                                    openVideo(null)
                                }
                                className="
                                    mt-3
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    bg-red-600
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-white
                                    hover:bg-red-700
                                "
                            >

                                <Check size={15} />

                                Done

                            </button>

                        </div>

                    </aside>

                </div>

            )}

        </div>
    )
}


/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: number
}) {

    return (

        <div
            className="
                rounded-xl
                border
                border-zinc-200
                bg-white
                p-4
                dark:border-zinc-800
                dark:bg-zinc-950
            "
        >

            <div className="flex items-center justify-between">

                <div className="text-zinc-400">
                    {icon}
                </div>

                <BarChart3
                    size={14}
                    className="text-zinc-300 dark:text-zinc-700"
                />

            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight">
                {value}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
                {label}
            </p>

        </div>
    )
}


/* =============================================================
   TAB BUTTON
============================================================= */

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {

    return (

        <button
            type="button"
            onClick={onClick}
            className={`
                rounded-md
                px-4
                py-2
                text-xs
                font-medium
                transition

                ${active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }
            `}
        >

            {children}

        </button>
    )
}


/* =============================================================
   VIDEO ROW
============================================================= */

function VideoRow({
    video,
    onClick,
    onVisibilityChange,
}: {
    video: DashboardVideo
    onClick: () => void
    onVisibilityChange: (value: boolean) => void
}) {

    return (

        <div
            className="
                group
                grid
                gap-4
                border-b
                border-zinc-200
                px-4
                py-4
                transition
                last:border-b-0
                hover:bg-zinc-50
                md:grid-cols-[40px_minmax(0,1fr)_100px_110px_90px_50px]
                md:items-center
                dark:border-zinc-800
                dark:hover:bg-zinc-900/50
            "
        >

            {/* CHECKBOX */}

            <div className="hidden md:block">

                <input
                    type="checkbox"
                    className="h-4 w-4 accent-red-600"
                />

            </div>


            {/* CONTENT */}

            <button
                type="button"
                onClick={onClick}
                className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                    text-left
                "
            >

                <div
                    className="
                        relative
                        h-16
                        w-28
                        shrink-0
                        overflow-hidden
                        rounded-md
                        bg-zinc-900
                    "
                >

                    {video.thumbnail ? (
                        <Image
                            src={video.thumbnail}
                            alt=""
                            fill
                            sizes="112px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">

                            <Play
                                size={18}
                                className="text-white/70"
                                fill="currentColor"
                            />

                        </div>
                    )}


                    <span
                        className="
                            absolute
                            bottom-1
                            right-1
                            rounded
                            bg-black/80
                            px-1
                            py-0.5
                            text-[9px]
                            font-medium
                            tabular-nums
                            text-white
                        "
                    >
                        {duration(video.durationSeconds)}
                    </span>

                </div>


                <div className="min-w-0">

                    <p className="truncate text-sm font-medium">
                        {video.title}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">

                        <span>
                            {compact(video.views)} views
                        </span>

                        <span>•</span>

                        <span>
                            {relativeTime(video.publishedAt)}
                        </span>

                    </div>


                    {video.featured && (

                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-red-500">

                            <Star size={10} fill="currentColor" />

                            Featured

                        </div>

                    )}

                </div>

            </button>


            {/* TYPE */}

            <div className="hidden md:block">

                <span
                    className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-md
                        bg-zinc-100
                        px-2
                        py-1
                        text-[10px]
                        font-medium
                        dark:bg-zinc-900
                    "
                >

                    {video.type === "video" ? (
                        <VideoIcon size={11} />
                    ) : (
                        <Smartphone size={11} />
                    )}

                    {video.type === "video"
                        ? "Video"
                        : "Short"}

                </span>

            </div>


            {/* PERFORMANCE */}

            <div className="hidden md:flex md:items-center md:gap-1.5 text-xs text-zinc-500">

                <BarChart3 size={13} />

                <span className="tabular-nums">
                    {full.format(video.views)}
                </span>

            </div>


            {/* VISIBILITY */}

            <div className="flex items-center justify-between md:justify-center">

                <span className="mr-3 text-xs text-zinc-500 md:hidden">
                    Website
                </span>

                <button
                    type="button"
                    onClick={() =>
                        onVisibilityChange(!video.isVisible)
                    }
                    className={`
                        relative
                        h-5
                        w-9
                        rounded-full
                        transition

                        ${video.isVisible
                            ? "bg-red-600"
                            : "bg-zinc-300 dark:bg-zinc-700"
                        }
                    `}
                    aria-label={
                        video.isVisible
                            ? "Hide from website"
                            : "Show on website"
                    }
                >

                    <span
                        className={`
                            absolute
                            top-0.5
                            h-4
                            w-4
                            rounded-full
                            bg-white
                            shadow
                            transition

                            ${video.isVisible
                                ? "left-[18px]"
                                : "left-0.5"
                            }
                        `}
                    />

                </button>

            </div>


            {/* MORE */}

            <button
                type="button"
                onClick={onClick}
                className="
                    hidden
                    rounded-lg
                    p-2
                    text-zinc-400
                    hover:bg-zinc-100
                    hover:text-zinc-900
                    md:block
                    dark:hover:bg-zinc-800
                    dark:hover:text-white
                "
            >

                <MoreHorizontal size={16} />

            </button>

        </div>
    )
}


/* =============================================================
   PANEL STAT
============================================================= */

function PanelStat({
    label,
    value,
}: {
    label: string
    value: string
}) {

    return (

        <div className="px-3 py-2.5">

            <p className="text-sm font-semibold tabular-nums">
                {value}
            </p>

            <p className="mt-0.5 text-[10px] text-zinc-500">
                {label}
            </p>

        </div>
    )
}


/* =============================================================
   SETTING ROW
============================================================= */

function SettingRow({
    icon,
    title,
    description,
    children,
}: {
    icon: React.ReactNode
    title: string
    description: string
    children: React.ReactNode
}) {

    return (

        <div
            className="
                flex
                items-center
                gap-3
                rounded-lg
                border
                border-zinc-200
                p-3
                dark:border-zinc-800
            "
        >

            <div className="text-zinc-400">
                {icon}
            </div>


            <div className="min-w-0 flex-1">

                <p className="text-xs font-medium">
                    {title}
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-zinc-500">
                    {description}
                </p>

            </div>


            {children}

        </div>
    )
}


/* =============================================================
   TOGGLE
============================================================= */

function Toggle({
    checked,
    onChange,
}: {
    checked: boolean
    onChange: (value: boolean) => void
}) {

    return (

        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`
                relative
                h-5
                w-9
                shrink-0
                rounded-full
                transition

                ${checked
                    ? "bg-red-600"
                    : "bg-zinc-300 dark:bg-zinc-700"
                }
            `}
        >

            <span
                className={`
                    absolute
                    top-0.5
                    h-4
                    w-4
                    rounded-full
                    bg-white
                    shadow
                    transition

                    ${checked
                        ? "left-[18px]"
                        : "left-0.5"
                    }
                `}
            />

        </button>
    )
}
