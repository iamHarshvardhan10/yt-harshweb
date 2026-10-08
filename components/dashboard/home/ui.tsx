"use client"

import * as React from "react"
import { Image as ImageIcon, Loader2, Trash2, Upload, Video } from "lucide-react"
import type { Media } from "@prisma/client"
import { uploadMedia, type Status } from "./api"

export const inputClass = `
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
`

export const labelClass = "text-xs font-medium text-zinc-600 dark:text-zinc-400"


/* =============================================================
   EDITOR SECTION
============================================================= */

export function EditorSection({
    number,
    title,
    description,
    actions,
    children,
}: {
    number: string
    title: string
    description?: string
    actions?: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <section className="mb-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">

            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold tracking-widest text-red-500">
                            {number}
                        </span>

                        <h2 className="text-sm font-semibold">
                            {title}
                        </h2>
                    </div>

                    {description && (
                        <p className="mt-1 text-xs text-zinc-500">{description}</p>
                    )}
                </div>

                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>

            {children}

        </section>
    )
}


/* =============================================================
   FIELDS
============================================================= */

export function TextField({
    label,
    value,
    onChange,
    placeholder,
    maxLength,
    icon,
}: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    maxLength?: number
    icon?: React.ReactNode
}) {
    return (
        <div className="space-y-2">
            <label className={labelClass}>{label}</label>

            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</span>
                )}

                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`${inputClass} ${icon ? "pl-9" : ""}`}
                />
            </div>
        </div>
    )
}

export function TextAreaField({
    label,
    value,
    onChange,
    rows = 3,
    maxLength,
    placeholder,
}: {
    label: string
    value: string
    onChange: (value: string) => void
    rows?: number
    maxLength?: number
    placeholder?: string
}) {
    return (
        <div className="space-y-2">
            <label className={labelClass}>{label}</label>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                maxLength={maxLength}
                placeholder={placeholder}
                className={`${inputClass} resize-none leading-6`}
            />

            {maxLength && (
                <div className="flex justify-end text-[11px] text-zinc-400">
                    {value.length}/{maxLength}
                </div>
            )}
        </div>
    )
}


/* =============================================================
   TOGGLE
============================================================= */

export function Toggle({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`
                relative
                h-5
                w-9
                shrink-0
                rounded-full
                transition
                disabled:opacity-50

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

export function ToggleRow({
    title,
    description,
    checked,
    onChange,
}: {
    title: string
    description: string
    checked: boolean
    onChange: (checked: boolean) => void
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs text-zinc-500">{description}</p>
            </div>

            <Toggle checked={checked} onChange={onChange} />
        </div>
    )
}


/* =============================================================
   BUTTONS
============================================================= */

export function PrimaryButton({
    pending,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pending?: boolean }) {
    return (
        <button
            type="button"
            {...props}
            disabled={pending || props.disabled}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
        >
            {pending && <Loader2 size={15} className="animate-spin" />}
            {children}
        </button>
    )
}

export function SecondaryButton({
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            {...props}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
            {children}
        </button>
    )
}

export function IconButton({
    label,
    danger,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; danger?: boolean }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            {...props}
            className={`rounded-md p-1.5 text-zinc-400 transition disabled:opacity-30 ${danger ? "hover:text-red-500" : "hover:text-zinc-900 dark:hover:text-white"}`}
        >
            {children}
        </button>
    )
}

export function StatusText({ status }: { status: Status }) {
    if (!status) return null

    return (
        <span className={`text-xs ${status.type === "error" ? "text-red-500" : "text-green-600"}`}>
            {status.text}
        </span>
    )
}


/* =============================================================
   MEDIA UPLOAD
============================================================= */

export function MediaUpload({
    kind,
    media,
    onUploaded,
    onRemove,
    compact,
}: {
    kind: "image" | "video"
    media: Media | null | undefined
    onUploaded: (media: Media) => void | Promise<void>
    onRemove?: () => void | Promise<void>
    compact?: boolean
}) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [busy, setBusy] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const KindIcon = kind === "video" ? Video : ImageIcon

    async function handleFile(file: File | undefined) {
        if (!file) return
        setBusy(true)
        setError(null)
        try {
            await onUploaded(await uploadMedia(file))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed")
        } finally {
            setBusy(false)
            if (inputRef.current) inputRef.current.value = ""
        }
    }

    async function handleRemove() {
        if (!onRemove) return
        setBusy(true)
        setError(null)
        try {
            await onRemove()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remove")
        } finally {
            setBusy(false)
        }
    }

    const picker = (
        <input
            ref={inputRef}
            type="file"
            accept={`${kind}/*`}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
        />
    )

    const chooseButton = (
        <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {media ? "Replace" : `Upload ${kind}`}
        </button>
    )

    return (
        <div>
            {picker}

            {media ? (
                <div className="flex items-center gap-3 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-900 ${compact ? "h-10 w-10" : "h-12 w-20"}`}>
                        {media.resourceType === "VIDEO" ? (
                            <video src={media.secureUrl} muted className="h-full w-full object-cover" />
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={media.secureUrl} alt="" className="h-full w-full object-cover" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                            {media.originalName ?? media.publicId}
                        </p>
                        <p className="mt-1 text-[10px] text-zinc-500">
                            {[
                                media.width && media.height ? `${media.width} × ${media.height}` : null,
                                media.duration ? `${Math.round(media.duration)}s` : null,
                                media.format?.toUpperCase(),
                            ].filter(Boolean).join(" · ")}
                        </p>
                    </div>

                    {chooseButton}

                    {onRemove && (
                        <IconButton label="Remove" danger disabled={busy} onClick={handleRemove}>
                            <Trash2 size={15} />
                        </IconButton>
                    )}
                </div>
            ) : compact ? (
                chooseButton
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
                    <KindIcon size={24} className="text-zinc-400" />
                    <p className="mt-3 text-sm font-medium">Upload {kind}</p>
                    <p className="mb-4 mt-1 text-xs text-zinc-500">
                        {kind === "video" ? "MP4 / WebM recommended" : "JPG, PNG or WebP"}
                    </p>
                    {chooseButton}
                </div>
            )}

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
    )
}
