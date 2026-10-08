"use client"

import * as React from "react"
import { Image as ImageIcon, Link2, RotateCcw, Save, Video } from "lucide-react"
import type { HeroBackgroundType, HomeHeroMediaRole } from "@prisma/client"
import { defaultHero } from "@/lib/home/defaults"
import { api, useAction, type HeroWithMedia } from "./api"
import {
    EditorSection,
    MediaUpload,
    PrimaryButton,
    SecondaryButton,
    StatusText,
    TextAreaField,
    TextField,
    ToggleRow,
    labelClass,
} from "./ui"

function toForm(hero: HeroWithMedia | null) {
    const source = hero ?? defaultHero
    return {
        eyebrow: source.eyebrow ?? "",
        headline: source.headline,
        description: source.description,
        primaryButtonName: source.primaryButtonName ?? "",
        primaryButtonUrl: source.primaryButtonUrl ?? "",
        secondaryButtonName: source.secondaryButtonName ?? "",
        secondaryButtonUrl: source.secondaryButtonUrl ?? "",
        backgroundType: (hero?.backgroundType ?? "IMAGE") as HeroBackgroundType,
        darkOverlay: source.darkOverlay,
        overlayOpacity: source.overlayOpacity,
        isVisible: source.isVisible,
        autoplay: source.autoplay,
        loop: source.loop,
    }
}

export default function HeroEditor({ initialHero }: { initialHero: HeroWithMedia | null }) {
    const [hero, setHero] = React.useState(initialHero)
    const [form, setForm] = React.useState(() => toForm(initialHero))
    const { pending, status, run } = useAction()

    const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
        setForm((current) => ({ ...current, [key]: value }))

    const mediaFor = (role: HomeHeroMediaRole) => hero?.media.find((m) => m.role === role)?.media

    function save() {
        return run(async () => {
            const res = await api<{ hero: HeroWithMedia }>("/api/home/hero", { method: "PUT", json: form })
            setHero(res.hero)
        }, "Hero saved")
    }

    function reset() {
        if (!hero || !confirm("Delete the saved hero? The site will fall back to the default copy.")) return
        return run(async () => {
            await api("/api/home/hero", { method: "DELETE" })
            setHero(null)
            setForm(toForm(null))
        }, "Hero reset to default")
    }

    async function attach(role: HomeHeroMediaRole, mediaId: string) {
        const res = await api<{ hero: HeroWithMedia }>("/api/home/hero/media", {
            method: "POST",
            json: { mediaId, role },
        })
        setHero(res.hero)
    }

    async function detach(role: HomeHeroMediaRole) {
        const res = await api<{ hero: HeroWithMedia }>(`/api/home/hero/media?role=${role}`, { method: "DELETE" })
        setHero(res.hero)
    }

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold">Homepage Hero</p>
                    <p className="mt-1 text-xs text-zinc-500">
                        {hero ? "Edit the first section visitors see." : "Not saved yet — the site shows this default copy."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <StatusText status={status} />
                    {hero && (
                        <SecondaryButton onClick={reset} disabled={pending}>
                            <RotateCcw size={14} />
                            Reset
                        </SecondaryButton>
                    )}
                    <PrimaryButton onClick={save} pending={pending}>
                        <Save size={16} />
                        Save Hero
                    </PrimaryButton>
                </div>
            </div>


            {/* CONTENT */}
            <EditorSection number="01" title="Content">
                <div className="space-y-5">
                    <TextField
                        label="Eyebrow"
                        value={form.eyebrow}
                        onChange={(v) => set("eyebrow", v)}
                        placeholder="New Videos"
                        maxLength={40}
                    />

                    <TextAreaField
                        label="Headline (new lines are kept)"
                        value={form.headline}
                        onChange={(v) => set("headline", v)}
                        rows={3}
                        maxLength={100}
                    />

                    <TextAreaField
                        label="Description"
                        value={form.description}
                        onChange={(v) => set("description", v)}
                        rows={4}
                        maxLength={400}
                    />
                </div>
            </EditorSection>


            {/* CTA */}
            <EditorSection number="02" title="Call to Action" description="Leave a button empty to hide it.">
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-3">
                        <TextField
                            label="Primary Button"
                            value={form.primaryButtonName}
                            onChange={(v) => set("primaryButtonName", v)}
                            placeholder="Button text"
                            maxLength={40}
                        />
                        <TextField
                            label="Primary URL"
                            value={form.primaryButtonUrl}
                            onChange={(v) => set("primaryButtonUrl", v)}
                            placeholder="/videos"
                            icon={<Link2 size={15} />}
                        />
                    </div>

                    <div className="space-y-3">
                        <TextField
                            label="Secondary Button"
                            value={form.secondaryButtonName}
                            onChange={(v) => set("secondaryButtonName", v)}
                            placeholder="Button text"
                            maxLength={40}
                        />
                        <TextField
                            label="Secondary URL"
                            value={form.secondaryButtonUrl}
                            onChange={(v) => set("secondaryButtonUrl", v)}
                            placeholder="https://youtube.com/..."
                            icon={<Link2 size={15} />}
                        />
                    </div>
                </div>
            </EditorSection>


            {/* BACKGROUND */}
            <EditorSection
                number="03"
                title="Background"
                description="Uploads are attached immediately. The image is also used as the video poster."
            >
                <div className="grid grid-cols-2 gap-3">
                    {(["IMAGE", "VIDEO"] as const).map((type) => {
                        const Icon = type === "IMAGE" ? ImageIcon : Video
                        const active = form.backgroundType === type
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => set("backgroundType", type)}
                                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium capitalize transition ${active
                                    ? "border-red-500 bg-red-500/5 text-red-500"
                                    : "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                    }`}
                            >
                                <Icon size={17} />
                                {type.toLowerCase()}
                            </button>
                        )
                    })}
                </div>

                <div className="mt-5 space-y-4">
                    <div className="space-y-2">
                        <p className={labelClass}>Background image</p>
                        <MediaUpload
                            kind="image"
                            media={mediaFor("BACKGROUND_IMAGE")}
                            onUploaded={(media) => attach("BACKGROUND_IMAGE", media.id)}
                            onRemove={() => detach("BACKGROUND_IMAGE")}
                        />
                    </div>

                    {form.backgroundType === "VIDEO" && (
                        <div className="space-y-2">
                            <p className={labelClass}>Background video</p>
                            <MediaUpload
                                kind="video"
                                media={mediaFor("BACKGROUND_VIDEO")}
                                onUploaded={(media) => attach("BACKGROUND_VIDEO", media.id)}
                                onRemove={() => detach("BACKGROUND_VIDEO")}
                            />
                        </div>
                    )}
                </div>

                <div className="mt-5 space-y-3">
                    <ToggleRow
                        title="Dark Overlay"
                        description="Darken the background so text stays readable"
                        checked={form.darkOverlay}
                        onChange={(v) => set("darkOverlay", v)}
                    />

                    {form.darkOverlay && (
                        <div>
                            <div className="mb-2 flex justify-between">
                                <label className={labelClass}>Overlay Opacity</label>
                                <span className="text-xs font-medium">{form.overlayOpacity}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={form.overlayOpacity}
                                onChange={(e) => set("overlayOpacity", Number(e.target.value))}
                                className="w-full accent-red-600"
                            />
                        </div>
                    )}
                </div>
            </EditorSection>


            {/* SETTINGS */}
            <EditorSection number="04" title="Hero Settings">
                <div className="space-y-4">
                    <ToggleRow
                        title="Show Hero Section"
                        description="Display hero on homepage"
                        checked={form.isVisible}
                        onChange={(v) => set("isVisible", v)}
                    />
                    <ToggleRow
                        title="Autoplay Video"
                        description="Automatically play background video"
                        checked={form.autoplay}
                        onChange={(v) => set("autoplay", v)}
                    />
                    <ToggleRow
                        title="Loop Video"
                        description="Repeat background video"
                        checked={form.loop}
                        onChange={(v) => set("loop", v)}
                    />
                </div>
            </EditorSection>
        </div>
    )
}
