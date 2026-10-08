"use client"

import * as React from "react"
import { RotateCcw, Save } from "lucide-react"
import type { HomeSectionKey } from "@prisma/client"
import { defaultSections } from "@/lib/home/defaults"
import { api, useAction, type SectionWithMedia } from "./api"
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

function toForm(sectionKey: HomeSectionKey, section: SectionWithMedia | undefined) {
    const source = section ?? defaultSections[sectionKey]
    return {
        eyebrow: source.eyebrow ?? "",
        title: source.title,
        description: source.description ?? "",
        isVisible: section?.isVisible ?? true,
    }
}

export default function SectionEditor({
    sectionKey,
    initialSection,
    number = "01",
    imageLabel,
}: {
    sectionKey: HomeSectionKey
    initialSection: SectionWithMedia | undefined
    number?: string
    /** Show an image upload for this section (e.g. About centre image) */
    imageLabel?: string
}) {
    const [section, setSection] = React.useState(initialSection)
    const [form, setForm] = React.useState(() => toForm(sectionKey, initialSection))
    const { pending, status, run } = useAction()
    const endpoint = `/api/home/sections/${sectionKey}`

    const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
        setForm((current) => ({ ...current, [key]: value }))

    async function put(data: object) {
        const res = await api<{ section: SectionWithMedia }>(endpoint, { method: "PUT", json: data })
        setSection(res.section)
    }

    function reset() {
        if (!confirm("Reset this section header to the default copy?")) return
        return run(async () => {
            await api(endpoint, { method: "DELETE" })
            setSection(undefined)
            setForm(toForm(sectionKey, undefined))
        }, "Reset to default")
    }

    return (
        <EditorSection
            number={number}
            title="Section Header"
            description={section ? undefined : "Not saved yet — the site shows this default copy."}
            actions={
                <>
                    <StatusText status={status} />
                    {section && (
                        <SecondaryButton onClick={reset} disabled={pending}>
                            <RotateCcw size={14} />
                            Reset
                        </SecondaryButton>
                    )}
                    <PrimaryButton onClick={() => run(() => put(form), "Section saved")} pending={pending}>
                        <Save size={16} />
                        Save
                    </PrimaryButton>
                </>
            }
        >
            <div className="space-y-5">
                <TextField
                    label="Eyebrow"
                    value={form.eyebrow}
                    onChange={(v) => set("eyebrow", v)}
                    maxLength={40}
                />

                <TextField
                    label="Title"
                    value={form.title}
                    onChange={(v) => set("title", v)}
                    maxLength={120}
                />

                <TextAreaField
                    label="Description"
                    value={form.description}
                    onChange={(v) => set("description", v)}
                    rows={3}
                    maxLength={400}
                />

                {imageLabel && (
                    <div className="space-y-2">
                        <p className={labelClass}>{imageLabel}</p>
                        <MediaUpload
                            kind="image"
                            media={section?.media}
                            onUploaded={(media) => put({ ...form, mediaId: media.id })}
                            onRemove={() => put({ ...form, mediaId: null })}
                        />
                    </div>
                )}

                <ToggleRow
                    title="Show Section"
                    description="Display this section on the website"
                    checked={form.isVisible}
                    onChange={(v) => set("isVisible", v)}
                />
            </div>
        </EditorSection>
    )
}
