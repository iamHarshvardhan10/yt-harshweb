"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { BarChart3, ExternalLink, Link2, Save } from "lucide-react"
import type { Media } from "@prisma/client"

import { api, useAction } from "@/components/dashboard/home/api"
import {
    EditorSection,
    MediaUpload,
    PrimaryButton,
    StatusText,
    TextAreaField,
    TextField,
    ToggleRow,
} from "@/components/dashboard/home/ui"
import type { SiteSettingsWithMedia } from "@/lib/settings"

export async function patchSettings(json: Record<string, unknown>) {
    return api<{ settings: SiteSettingsWithMedia }>("/api/settings", { method: "PATCH", json })
}

export default function WebsiteTab({ settings }: { settings: SiteSettingsWithMedia }) {
    const router = useRouter()

    const [siteTitle, setSiteTitle] = React.useState(settings.siteTitle)
    const [siteDescription, setSiteDescription] = React.useState(settings.siteDescription)
    const [siteUrl, setSiteUrl] = React.useState(settings.siteUrl ?? "")
    const [logo, setLogo] = React.useState<Media | null>(settings.logo)
    const [favicon, setFavicon] = React.useState<Media | null>(settings.favicon)
    const [allowIndexing, setAllowIndexing] = React.useState(settings.allowIndexing)
    const [maintenanceMode, setMaintenanceMode] = React.useState(settings.maintenanceMode)
    const [maintenanceMessage, setMaintenanceMessage] = React.useState(settings.maintenanceMessage ?? "")
    const [gaId, setGaId] = React.useState(settings.googleAnalyticsId ?? "")

    const seo = useAction()
    const visibility = useAction()
    const analytics = useAction()

    async function patch(json: Record<string, unknown>) {
        await patchSettings(json)
        router.refresh()
    }

    /** Toggles save straight away; the switch flips back if saving fails */
    function toggle(field: "allowIndexing" | "maintenanceMode", value: boolean, set: (v: boolean) => void) {
        set(value)
        visibility.run(async () => {
            try {
                await patch({ [field]: value })
            } catch (err) {
                set(!value)
                throw err
            }
        }, field === "maintenanceMode" ? (value ? "Maintenance mode is on (visitors see it within 15 seconds)" : "Maintenance mode is off") : "Saved")
    }

    return (
        <>
            <EditorSection
                number="01"
                title="Search & Sharing"
                description="Used as the browser tab title and in Google results and link previews."
                actions={
                    <>
                        <StatusText status={seo.status} />
                        <PrimaryButton
                            pending={seo.pending}
                            disabled={!siteTitle.trim() || !siteDescription.trim()}
                            onClick={() => seo.run(() => patch({ siteTitle, siteDescription, siteUrl }))}
                        >
                            <Save size={15} />
                            Save
                        </PrimaryButton>
                    </>
                }
            >
                <div className="space-y-4">
                    <TextField label="Site Title" value={siteTitle} onChange={setSiteTitle} maxLength={70} />
                    <TextAreaField label="Meta Description" value={siteDescription} onChange={setSiteDescription} rows={3} maxLength={200} />
                    <TextField
                        label="Site URL"
                        value={siteUrl}
                        onChange={setSiteUrl}
                        placeholder="https://harshbhosale.com"
                        icon={<Link2 size={15} />}
                    />
                    <p className="-mt-2 text-[11px] text-zinc-500">
                        Your live address — used for links in newsletter, invite and reminder emails, and for link previews.
                    </p>
                </div>
            </EditorSection>

            <EditorSection number="02" title="Branding" description="Saved as soon as you upload.">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Logo</p>
                        <MediaUpload
                            kind="image"
                            media={logo}
                            onUploaded={async (media) => {
                                await patch({ logoId: media.id })
                                setLogo(media)
                            }}
                            onRemove={logo ? async () => {
                                await patch({ logoId: null })
                                setLogo(null)
                            } : undefined}
                        />
                        <p className="text-[11px] text-zinc-500">Shown next to the site title in the navbar. A transparent PNG or SVG works best.</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Favicon</p>
                        <MediaUpload
                            kind="image"
                            media={favicon}
                            onUploaded={async (media) => {
                                await patch({ faviconId: media.id })
                                setFavicon(media)
                            }}
                            onRemove={favicon ? async () => {
                                await patch({ faviconId: null })
                                setFavicon(null)
                            } : undefined}
                        />
                        <p className="text-[11px] text-zinc-500">The browser tab icon. Use a square PNG, at least 64 × 64.</p>
                    </div>
                </div>
            </EditorSection>

            <EditorSection
                number="03"
                title="Visibility"
                actions={<StatusText status={visibility.status} />}
            >
                <div className="space-y-3">
                    <ToggleRow
                        title="Allow search engines"
                        description="Let Google and others list your website. Turning this off adds noindex and blocks crawlers in robots.txt."
                        checked={allowIndexing}
                        onChange={(v) => toggle("allowIndexing", v, setAllowIndexing)}
                    />
                    <ToggleRow
                        title="Maintenance mode"
                        description="Visitors see a “back soon” page. You can still browse the site while signed in to the dashboard."
                        checked={maintenanceMode}
                        onChange={(v) => toggle("maintenanceMode", v, setMaintenanceMode)}
                    />

                    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                        <TextAreaField
                            label="Maintenance message"
                            value={maintenanceMessage}
                            onChange={setMaintenanceMessage}
                            rows={2}
                            maxLength={300}
                            placeholder="We're making some improvements to the site. Please check back soon."
                        />
                        <div className="mt-2 flex items-center justify-between gap-3">
                            <a href="/maintenance" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-400">
                                Preview the page <ExternalLink size={12} />
                            </a>
                            <button
                                type="button"
                                onClick={() => visibility.run(() => patch({ maintenanceMessage }), "Message saved")}
                                disabled={visibility.pending}
                                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                            >
                                Save message
                            </button>
                        </div>
                    </div>
                </div>
            </EditorSection>

            <EditorSection
                number="04"
                title="Google Analytics"
                description="Adds Google Analytics to every public page. Find the ID in Analytics → Admin → Data streams."
                actions={
                    <>
                        <StatusText status={analytics.status} />
                        <PrimaryButton pending={analytics.pending} onClick={() => analytics.run(() => patch({ googleAnalyticsId: gaId.trim().toUpperCase() }))}>
                            <Save size={15} />
                            Save
                        </PrimaryButton>
                    </>
                }
            >
                <TextField
                    label="Measurement ID"
                    value={gaId}
                    onChange={setGaId}
                    placeholder="G-XXXXXXXXXX"
                    maxLength={30}
                    icon={<BarChart3 size={15} />}
                />
                <p className="mt-2 text-[11px] text-zinc-500">Leave empty to turn tracking off.</p>
            </EditorSection>
        </>
    )
}
