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
    Loader2,
    Check,
    AlertCircle,
} from "lucide-react"

/* =============================================================
   TYPES — mirror the Prisma models
============================================================= */

type MediaResourceType = "IMAGE" | "VIDEO"
type HomeHeroMediaRole = "BACKGROUND_IMAGE" | "BACKGROUND_VIDEO"

interface MediaRecord {
    id: string
    publicId: string
    secureUrl: string
    resourceType: MediaResourceType
    originalName: string | null
    format: string | null
    width: number | null
    height: number | null
    duration: number | null
}

interface HomeHeroMediaRecord {
    id: string
    role: HomeHeroMediaRole
    media: MediaRecord
}

interface HomeHeroRecord {
    id: string
    headline: string
    description: string
    primaryButtonName: string | null
    primaryButtonUrl: string | null
    secondaryButtonName: string | null
    secondaryButtonUrl: string | null
    backgroundType: "IMAGE" | "VIDEO"
    darkOverlay: boolean
    media: HomeHeroMediaRecord[]
}

type SaveState = "idle" | "saving" | "saved" | "error"

/* =============================================================
   HOME
============================================================= */

export default function Home() {
    const [heroId, setHeroId] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [saveState, setSaveState] = React.useState<SaveState>("idle")
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

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

    // Currently attached background media (image or video)
    const [currentMedia, setCurrentMedia] = React.useState<MediaRecord | null>(
        null
    )

    // Upload state
    const [uploading, setUploading] = React.useState(false)
    const [uploadError, setUploadError] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Local-only toggles — no schema field yet, see note above the code
    const [showHero, setShowHero] = React.useState(true)
    const [autoplay, setAutoplay] = React.useState(true)
    const [loop, setLoop] = React.useState(true)

    /* =========================================================
        LOAD EXISTING HERO ON MOUNT
        Assumes a single "homepage hero" record — takes the most
        recently created one. Adjust if you support multiple heroes.
    ========================================================= */

    React.useEffect(() => {
        async function loadHero() {
            try {
                const res = await fetch("/api/hero")
                if (!res.ok) throw new Error("Failed to load hero")

                const data = await res.json()
                const hero: HomeHeroRecord | undefined = data.heroes?.[0]

                if (hero) {
                    setHeroId(hero.id)
                    setHeadline(hero.headline)
                    setDescription(hero.description)
                    setPrimaryCTA(hero.primaryButtonName ?? "")
                    setPrimaryCTAUrl(hero.primaryButtonUrl ?? "")
                    setSecondaryCTA(hero.secondaryButtonName ?? "")
                    setSecondaryCTAUrl(hero.secondaryButtonUrl ?? "")
                    setBackgroundType(
                        hero.backgroundType === "VIDEO" ? "video" : "image"
                    )
                    setOverlay(hero.darkOverlay ? 65 : 0)

                    const activeRole: HomeHeroMediaRole =
                        hero.backgroundType === "VIDEO"
                            ? "BACKGROUND_VIDEO"
                            : "BACKGROUND_IMAGE"

                    const attached = hero.media?.find(
                        (m) => m.role === activeRole
                    )
                    setCurrentMedia(attached?.media ?? null)
                }
            } catch (err) {
                console.error(err)
                setErrorMsg("Couldn't load existing hero content.")
            } finally {
                setLoading(false)
            }
        }

        loadHero()
    }, [])

    /* =========================================================
        SAVE HERO (create or update)
    ========================================================= */

    async function handleSave() {
        setSaveState("saving")
        setErrorMsg(null)

        const payload = {
            headline,
            description,
            primaryButtonName: primaryCTA || null,
            primaryButtonUrl: primaryCTAUrl || null,
            secondaryButtonName: secondaryCTA || null,
            secondaryButtonUrl: secondaryCTAUrl || null,
            backgroundType: backgroundType === "video" ? "VIDEO" : "IMAGE",
            darkOverlay: overlay > 0,
        }

        try {
            let activeHeroId = heroId

            if (activeHeroId) {
                const res = await fetch(`/api/hero/${activeHeroId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                if (!res.ok) throw new Error("Failed to update hero")
            } else {
                const res = await fetch("/api/hero", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                if (!res.ok) throw new Error("Failed to create hero")
                const data = await res.json()
                activeHeroId = data.hero.id
                setHeroId(activeHeroId)
            }

            setSaveState("saved")
            setTimeout(() => setSaveState("idle"), 2000)
        } catch (err) {
            console.error(err)
            setSaveState("error")
            setErrorMsg("Couldn't save changes. Please try again.")
        }
    }

    /* =========================================================
        UPLOAD MEDIA
        1. Uploads file to /api/media/upload -> gets Media row
        2. If a hero already exists, attaches it immediately
        3. If not, hero must be saved first (media attach needs heroId)
    ========================================================= */

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadError(null)

        const expectsVideo = backgroundType === "video"
        const isVideo = file.type.startsWith("video/")
        const isImage = file.type.startsWith("image/")

        if (expectsVideo && !isVideo) {
            setUploadError("Please select a video file for a video background.")
            return
        }
        if (!expectsVideo && !isImage) {
            setUploadError("Please select an image file for an image background.")
            return
        }

        setUploading(true)

        try {
            // 1. Upload to Cloudinary via the generic media endpoint
            const formData = new FormData()
            formData.append("file", file)
            formData.append("folder", "hero")

            const uploadRes = await fetch("/api/media/upload", {
                method: "POST",
                body: formData,
            })

            if (!uploadRes.ok) {
                const err = await uploadRes.json().catch(() => null)
                throw new Error(err?.error ?? "Upload failed")
            }

            const { media } = (await uploadRes.json()) as { media: MediaRecord }

            // 2. Need a hero to attach media to — save one first if it doesn't exist yet
            let activeHeroId = heroId

            if (!activeHeroId) {
                const createRes = await fetch("/api/hero", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        headline,
                        description,
                        primaryButtonName: primaryCTA || null,
                        primaryButtonUrl: primaryCTAUrl || null,
                        secondaryButtonName: secondaryCTA || null,
                        secondaryButtonUrl: secondaryCTAUrl || null,
                        backgroundType:
                            backgroundType === "video" ? "VIDEO" : "IMAGE",
                        darkOverlay: overlay > 0,
                    }),
                })
                if (!createRes.ok) throw new Error("Failed to create hero")
                const createData = await createRes.json()
                activeHeroId = createData.hero.id
                setHeroId(activeHeroId)
            }

            // 3. Attach the uploaded media to the hero
            const role: HomeHeroMediaRole =
                backgroundType === "video"
                    ? "BACKGROUND_VIDEO"
                    : "BACKGROUND_IMAGE"

            const attachRes = await fetch(`/api/hero/${activeHeroId}/media`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mediaId: media.id, role }),
            })

            if (!attachRes.ok) {
                const err = await attachRes.json().catch(() => null)
                throw new Error(err?.error ?? "Failed to attach media")
            }

            setCurrentMedia(media)
        } catch (err) {
            console.error(err)
            setUploadError(
                err instanceof Error ? err.message : "Upload failed"
            )
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    /* =========================================================
        REMOVE CURRENT MEDIA
    ========================================================= */

    async function handleRemoveMedia() {
        if (!heroId || !currentMedia) return

        const role: HomeHeroMediaRole =
            backgroundType === "video" ? "BACKGROUND_VIDEO" : "BACKGROUND_IMAGE"

        try {
            const res = await fetch(
                `/api/hero/${heroId}/media?role=${role}`,
                { method: "DELETE" }
            )
            if (!res.ok) throw new Error("Failed to remove media")
            setCurrentMedia(null)
        } catch (err) {
            console.error(err)
            setUploadError("Couldn't remove media. Please try again.")
        }
    }

    function formatFileSize(bytes: number | null) {
        if (!bytes) return ""
        const mb = bytes / (1024 * 1024)
        return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <Loader2 className="animate-spin text-zinc-400" size={28} />
            </div>
        )
    }

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

                    {errorMsg && (
                        <span className="flex items-center gap-1.5 text-xs text-red-500">
                            <AlertCircle size={14} />
                            {errorMsg}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saveState === "saving"}
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
                            disabled:opacity-60
                        "
                    >
                        {saveState === "saving" ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : saveState === "saved" ? (
                            <Check size={16} />
                        ) : (
                            <Save size={16} />
                        )}

                        {saveState === "saving"
                            ? "Saving..."
                            : saveState === "saved"
                                ? "Saved"
                                : "Save Changes"}
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

                            {heroId ? "Published" : "Draft — not saved yet"}

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

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={
                                    backgroundType === "video"
                                        ? "video/*"
                                        : "image/*"
                                }
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <div className="overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">

                                <div className="flex flex-col items-center justify-center px-6 py-10 text-center">

                                    {uploading ? (
                                        <Loader2
                                            size={24}
                                            className="animate-spin text-zinc-400"
                                        />
                                    ) : backgroundType === "video" ? (
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
                                        {uploading
                                            ? "Uploading..."
                                            : `Upload ${backgroundType}`}
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        or select from media library
                                    </p>

                                    {uploadError && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {uploadError}
                                        </p>
                                    )}


                                    <button
                                        type="button"
                                        disabled={uploading}
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
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
                                            disabled:opacity-60
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

                        {currentMedia && (
                            <div className="mt-5">

                                <p className="mb-2 text-xs font-medium text-zinc-500">
                                    Current background
                                </p>

                                <div className="flex items-center gap-3 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">

                                    <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-md bg-zinc-900">

                                        {currentMedia.resourceType === "IMAGE" ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={currentMedia.secureUrl}
                                                alt={currentMedia.originalName ?? "background"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Video
                                                size={17}
                                                className="text-white"
                                            />
                                        )}

                                    </div>


                                    <div className="min-w-0 flex-1">

                                        <p className="truncate text-xs font-medium">
                                            {currentMedia.originalName ?? currentMedia.publicId}
                                        </p>

                                        <p className="mt-1 text-[10px] text-zinc-500">
                                            {currentMedia.width && currentMedia.height
                                                ? `${currentMedia.width} × ${currentMedia.height}`
                                                : currentMedia.duration
                                                    ? `${Math.round(currentMedia.duration)}s`
                                                    : ""}
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={handleRemoveMedia}
                                        className="text-zinc-400 transition hover:text-red-500"
                                    >
                                        <Trash2 size={15} />
                                    </button>

                                </div>

                            </div>
                        )}


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

                            <p className="mt-1.5 text-[11px] text-zinc-400">
                                Saved as on/off — add an `overlayOpacity` field to the schema to persist the exact percentage.
                            </p>

                        </div>

                    </EditorSection>


                    {/* =================================================
                        HERO SETTINGS
                        NOTE: these three toggles are local-only until
                        matching columns exist on HomeHero.
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

                                <Toggle
                                    checked={showHero}
                                    onChange={setShowHero}
                                />

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

                                <Toggle
                                    checked={autoplay}
                                    onChange={setAutoplay}
                                />

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

                                <Toggle
                                    checked={loop}
                                    onChange={setLoop}
                                />

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