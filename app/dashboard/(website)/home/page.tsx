
"use client"

import * as React from "react"

import {
    Image as ImageIcon,
    Video,
    Upload,
    Link2,
    Save,
    Plus,
    Trash2,
} from "lucide-react"


export default function Home() {
    const [backgroundType, setBackgroundType] = React.useState<
        "image" | "video"
    >("video")

    const [headline, setHeadline] = React.useState(
        "Stories that deserve a closer look"
    )

    const [description, setDescription] = React.useState(
        "Behind every issue is a story of decisions, systems, and consequences. We investigate the facts that matter."
    )

    const [primaryCTA, setPrimaryCTA] = React.useState(
        "Explore Investigations"
    )

    const [primaryCTAUrl, setPrimaryCTAUrl] = React.useState(
        "/investigations"
    )

    const [secondaryCTA, setSecondaryCTA] = React.useState(
        "Watch on YouTube"
    )

    const [secondaryCTAUrl, setSecondaryCTAUrl] = React.useState(
        "https://youtube.com"
    )

    const [overlay, setOverlay] = React.useState(65)


    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* =========================================================
                HEADER
            ========================================================= */}

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                        Website
                    </p>

                    <h1 className="text-lg font-semibold">
                        Home Page
                    </h1>
                </div>


                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-red-600
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-red-700
                        "
                    >
                        <Save size={16} />

                        Save Changes
                    </button>

                </div>

            </header>


            {/* =========================================================
                MAIN EDITOR
            ========================================================= */}

            <main className="min-h-[calc(100vh-64px)]">

                <div className="mx-auto w-full max-w-5xl px-6 py-8">

                    {/* =================================================
                        PAGE STATUS
                    ================================================= */}

                    <div className="mb-8 flex items-center justify-between">

                        <div>
                            <p className="text-sm font-semibold">
                                Homepage Hero
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                                Edit the first section visitors see.
                            </p>
                        </div>


                        <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] font-medium text-green-600">

                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                            Published

                        </div>

                    </div>


                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    <EditorSection
                        number="01"
                        title="Content"
                    >

                        {/* HEADLINE */}

                        <div className="space-y-2">

                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                Headline
                            </label>

                            <textarea
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                rows={3}
                                maxLength={100}
                                className="
                                    w-full
                                    resize-none
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

                            <div className="flex justify-between text-[11px] text-zinc-400">

                                <span>
                                    Recommended: 40–70 characters
                                </span>

                                <span>
                                    {headline.length}/100
                                </span>

                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="mt-5 space-y-2">

                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                className="
                                    w-full
                                    resize-none
                                    rounded-lg
                                    border
                                    border-zinc-200
                                    bg-white
                                    px-3
                                    py-2.5
                                    text-sm
                                    leading-6
                                    outline-none
                                    focus:border-red-500
                                    focus:ring-2
                                    focus:ring-red-500/10
                                    dark:border-zinc-800
                                    dark:bg-zinc-900
                                "
                            />

                        </div>

                    </EditorSection>


                    {/* =================================================
                        CTA
                    ================================================= */}

                    <EditorSection
                        number="02"
                        title="Call to Action"
                    >

                        <div className="space-y-5">

                            {/* PRIMARY CTA */}

                            <div className="space-y-3">

                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Primary Button
                                </label>

                                <input
                                    value={primaryCTA}
                                    onChange={(e) =>
                                        setPrimaryCTA(e.target.value)
                                    }
                                    placeholder="Button text"
                                    className="
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


                                <div className="relative">

                                    <Link2
                                        size={15}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                                    />

                                    <input
                                        value={primaryCTAUrl}
                                        onChange={(e) =>
                                            setPrimaryCTAUrl(e.target.value)
                                        }
                                        placeholder="/investigations"
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
                                            dark:bg-zinc-900
                                        "
                                    />

                                </div>

                            </div>


                            {/* SECONDARY CTA */}

                            <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">

                                <label className="mb-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Secondary Button
                                </label>


                                <div className="space-y-3">

                                    <input
                                        value={secondaryCTA}
                                        onChange={(e) =>
                                            setSecondaryCTA(e.target.value)
                                        }
                                        placeholder="Button text"
                                        className="
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


                                    <div className="relative">

                                        <Link2
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                                        />

                                        <input
                                            value={secondaryCTAUrl}
                                            onChange={(e) =>
                                                setSecondaryCTAUrl(e.target.value)
                                            }
                                            placeholder="https://youtube.com/..."
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
                                                dark:bg-zinc-900
                                            "
                                        />

                                    </div>

                                </div>

                            </div>

                        </div>

                    </EditorSection>


                    {/* =================================================
                        BACKGROUND
                    ================================================= */}

                    <EditorSection
                        number="03"
                        title="Background"
                    >

                        {/* MEDIA TYPE */}

                        <div className="grid grid-cols-2 gap-3">

                            <button
                                type="button"
                                onClick={() => setBackgroundType("image")}
                                className={`
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    border
                                    px-3
                                    py-3
                                    text-sm
                                    font-medium
                                    transition

                                    ${backgroundType === "image"
                                        ? "border-red-500 bg-red-500/5 text-red-500"
                                        : "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                    }
                                `}
                            >
                                <ImageIcon size={17} />

                                Image
                            </button>


                            <button
                                type="button"
                                onClick={() => setBackgroundType("video")}
                                className={`
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    border
                                    px-3
                                    py-3
                                    text-sm
                                    font-medium
                                    transition

                                    ${backgroundType === "video"
                                        ? "border-red-500 bg-red-500/5 text-red-500"
                                        : "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                    }
                                `}
                            >
                                <Video size={17} />

                                Video
                            </button>

                        </div>


                        {/* MEDIA UPLOAD */}

                        <div className="mt-4">

                            <div className="overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">

                                <div className="flex flex-col items-center justify-center px-6 py-10 text-center">

                                    {backgroundType === "video" ? (
                                        <Video
                                            size={24}
                                            className="text-zinc-400"
                                        />
                                    ) : (
                                        <ImageIcon
                                            size={24}
                                            className="text-zinc-400"
                                        />
                                    )}


                                    <p className="mt-3 text-sm font-medium">
                                        Upload {backgroundType}
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        or select from media library
                                    </p>


                                    <button
                                        type="button"
                                        className="
                                            mt-4
                                            inline-flex
                                            items-center
                                            gap-2
                                            rounded-lg
                                            bg-zinc-900
                                            px-3
                                            py-2
                                            text-xs
                                            font-medium
                                            text-white
                                            hover:bg-zinc-800
                                            dark:bg-white
                                            dark:text-black
                                            dark:hover:bg-zinc-200
                                        "
                                    >
                                        <Upload size={14} />

                                        Choose Media
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* CURRENT MEDIA */}

                        <div className="mt-5">

                            <p className="mb-2 text-xs font-medium text-zinc-500">
                                Current background
                            </p>

                            <div className="flex items-center gap-3 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">

                                <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-md bg-zinc-900">

                                    {backgroundType === "video" ? (
                                        <Video
                                            size={17}
                                            className="text-white"
                                        />
                                    ) : (
                                        <ImageIcon
                                            size={17}
                                            className="text-white"
                                        />
                                    )}

                                </div>


                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-xs font-medium">
                                        hero-background.mp4
                                    </p>

                                    <p className="mt-1 text-[10px] text-zinc-500">
                                        1920 × 1080 · 12.4 MB
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="text-zinc-400 transition hover:text-red-500"
                                >
                                    <Trash2 size={15} />
                                </button>

                            </div>

                        </div>


                        {/* OVERLAY */}

                        <div className="mt-5">

                            <div className="mb-2 flex justify-between">

                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Dark Overlay
                                </label>

                                <span className="text-xs font-medium">
                                    {overlay}%
                                </span>

                            </div>


                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={overlay}
                                onChange={(e) =>
                                    setOverlay(Number(e.target.value))
                                }
                                className="w-full accent-red-600"
                            />

                        </div>

                    </EditorSection>


                    {/* =================================================
                        HERO SETTINGS
                    ================================================= */}

                    <EditorSection
                        number="04"
                        title="Hero Settings"
                    >

                        <div className="space-y-4">

                            {/* SHOW HERO */}

                            <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">

                                <div>
                                    <p className="text-sm font-medium">
                                        Show Hero Section
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        Display hero on homepage
                                    </p>
                                </div>

                                <Toggle defaultChecked />

                            </div>


                            {/* AUTOPLAY */}

                            <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">

                                <div>
                                    <p className="text-sm font-medium">
                                        Autoplay Video
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        Automatically play background video
                                    </p>
                                </div>

                                <Toggle defaultChecked />

                            </div>


                            {/* LOOP */}

                            <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">

                                <div>
                                    <p className="text-sm font-medium">
                                        Loop Video
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        Repeat background video
                                    </p>
                                </div>

                                <Toggle defaultChecked />

                            </div>

                        </div>

                    </EditorSection>




                </div>

            </main>

        </div>
    )
}


/* =============================================================
   EDITOR SECTION
============================================================= */

function EditorSection({
    number,
    title,
    children,
}: {
    number: string
    title: string
    children: React.ReactNode
}) {

    return (
        <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">

            <div className="mb-5 flex items-center gap-3">

                <span className="text-[10px] font-semibold tracking-widest text-red-500">
                    {number}
                </span>

                <h2 className="text-sm font-semibold">
                    {title}
                </h2>

            </div>

            {children}

        </section>
    )
}


/* =============================================================
   TOGGLE
============================================================= */

function Toggle({
    defaultChecked = false,
}: {
    defaultChecked?: boolean
}) {

    const [checked, setChecked] = React.useState(defaultChecked)

    return (
        <button
            type="button"
            onClick={() => setChecked(!checked)}
            className={`
                relative
                h-5
                w-9
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
