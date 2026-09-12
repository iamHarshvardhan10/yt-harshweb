"use client"

import * as React from "react"

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


type VideoType = "video" | "short"


type YouTubeVideo = {
    id: string
    title: string
    thumbnail: string
    type: VideoType
    views: string
    publishedAt: string
    duration: string
    isVisible: boolean
    showOnHome: boolean
    featured: boolean
    displayOrder: number
    category: string
}


const initialVideos: YouTubeVideo[] = [
    {
        id: "1",
        title: "Why Mumbai Floods Every Monsoon",
        thumbnail: "/thumbnails/mumbai-floods.webp",
        type: "video",
        views: "1.2M",
        publishedAt: "2 days ago",
        duration: "08:42",
        isVisible: true,
        showOnHome: true,
        featured: true,
        displayOrder: 1,
        category: "Investigations",
    },
    {
        id: "2",
        title: "The Truth Behind India's E20 Fuel",
        thumbnail: "/thumbnails/e20.webp",
        type: "video",
        views: "842K",
        publishedAt: "5 days ago",
        duration: "10:18",
        isVisible: true,
        showOnHome: true,
        featured: false,
        displayOrder: 2,
        category: "Explainers",
    },
    {
        id: "3",
        title: "What Happened in Nepal?",
        thumbnail: "/thumbnails/nepal.webp",
        type: "short",
        views: "421K",
        publishedAt: "1 week ago",
        duration: "00:48",
        isVisible: true,
        showOnHome: false,
        featured: false,
        displayOrder: 3,
        category: "Shorts",
    },
    {
        id: "4",
        title: "Can One Glacier Cause a Flash Flood?",
        thumbnail: "/thumbnails/glacier.webp",
        type: "short",
        views: "287K",
        publishedAt: "1 week ago",
        duration: "00:52",
        isVisible: false,
        showOnHome: false,
        featured: false,
        displayOrder: 4,
        category: "Shorts",
    },
    {
        id: "5",
        title: "How Dependent Is Tripura on Bangladesh?",
        thumbnail: "/thumbnails/tripura.webp",
        type: "video",
        views: "196K",
        publishedAt: "2 weeks ago",
        duration: "07:34",
        isVisible: true,
        showOnHome: false,
        featured: false,
        displayOrder: 5,
        category: "Explainers",
    },
]


export default function Video() {

    const [videos, setVideos] =
        React.useState<YouTubeVideo[]>(initialVideos)

    const [activeTab, setActiveTab] =
        React.useState<"all" | VideoType>("all")

    const [search, setSearch] =
        React.useState("")

    const [selectedVideo, setSelectedVideo] =
        React.useState<YouTubeVideo | null>(null)

    const [syncing, setSyncing] =
        React.useState(false)


    /* =========================================================
       FILTER
    ========================================================= */

    const filteredVideos = videos.filter((video) => {

        const matchesType =
            activeTab === "all" ||
            video.type === activeTab

        const matchesSearch =
            video.title
                .toLowerCase()
                .includes(search.toLowerCase())

        return matchesType && matchesSearch
    })


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

    function updateVideo(
        id: string,
        updates: Partial<YouTubeVideo>
    ) {

        setVideos((current) =>
            current.map((video) =>
                video.id === id
                    ? { ...video, ...updates }
                    : video
            )
        )

        setSelectedVideo((current) =>
            current?.id === id
                ? { ...current, ...updates }
                : current
        )
    }


    /* =========================================================
       SYNC YOUTUBE
    ========================================================= */

    function syncYouTube() {

        setSyncing(true)

        setTimeout(() => {
            setSyncing(false)
        }, 1200)
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

                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                        YouTube connected

                    </div>


                    <button
                        type="button"
                        onClick={syncYouTube}
                        disabled={syncing}
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

                            Sort

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
                                    setSelectedVideo(video)
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
                                    Try another search or tab.
                                </p>

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        SYNC INFO
                    ================================================= */}

                    <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-500">

                        <Clock3 size={13} />

                        Last synced with YouTube recently

                    </div>

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
                        onClick={() => setSelectedVideo(null)}
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
                                    setSelectedVideo(null)
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

                            <div className="overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">

                                <div className="flex aspect-video items-center justify-center">

                                    <Play
                                        size={30}
                                        className="text-zinc-400"
                                    />

                                </div>

                            </div>


                            {/* TITLE */}

                            <div className="mt-4">

                                <h3 className="text-base font-semibold leading-6">
                                    {selectedVideo.title}
                                </h3>

                                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">

                                    <span>
                                        {selectedVideo.views} views
                                    </span>

                                    <span>•</span>

                                    <span>
                                        {selectedVideo.publishedAt}
                                    </span>

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

                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Website
                                </p>


                                <div className="mt-3 space-y-2">


                                    {/* SHOW ON WEBSITE */}

                                    <SettingRow
                                        icon={
                                            selectedVideo.isVisible
                                                ? <Eye size={16} />
                                                : <EyeOff size={16} />
                                        }
                                        title="Show on Website"
                                        description="Display this content on your website"
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
                                        description="Display this content in the homepage video section"
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
                                        description="Highlight this content on your website"
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
                                    value={selectedVideo.displayOrder}
                                    onChange={(e) =>
                                        updateVideo(
                                            selectedVideo.id,
                                            {
                                                displayOrder:
                                                    Number(e.target.value),
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
                                />

                            </div>


                            {/* CATEGORY */}

                            <div className="mt-5">

                                <label className="text-xs font-medium text-zinc-500">
                                    Website Category
                                </label>

                                <select
                                    value={selectedVideo.category}
                                    onChange={(e) =>
                                        updateVideo(
                                            selectedVideo.id,
                                            {
                                                category:
                                                    e.target.value,
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

                                    <option>
                                        Investigations
                                    </option>

                                    <option>
                                        Explainers
                                    </option>

                                    <option>
                                        Shorts
                                    </option>

                                    <option>
                                        Climate
                                    </option>

                                    <option>
                                        Technology
                                    </option>

                                </select>

                            </div>


                            {/* YOUTUBE */}

                            <div className="mt-7 border-t border-zinc-200 pt-6 dark:border-zinc-800">

                                <button
                                    type="button"
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

                                </button>

                            </div>


                            {/* SAVE */}

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedVideo(null)
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

                                Save Changes

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
    video: YouTubeVideo
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

                    <div className="flex h-full items-center justify-center">

                        <Play
                            size={18}
                            className="text-white/70"
                            fill="currentColor"
                        />

                    </div>


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
                            text-white
                        "
                    >
                        {video.duration}
                    </span>

                </div>


                <div className="min-w-0">

                    <p className="truncate text-sm font-medium">
                        {video.title}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">

                        <span>
                            {video.views} views
                        </span>

                        <span>•</span>

                        <span>
                            {video.publishedAt}
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

                {video.views}

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
