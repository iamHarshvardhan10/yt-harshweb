"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react"
import type { Media } from "@prisma/client"
import { api, useAction } from "./api"
import {
    EditorSection,
    IconButton,
    MediaUpload,
    PrimaryButton,
    SecondaryButton,
    StatusText,
    TextAreaField,
    TextField,
    labelClass,
} from "./ui"

type BaseItem = { id: string; order: number; isVisible: boolean }

export type FieldDef = {
    name: string
    label: string
    type: "text" | "textarea" | "avatar"
    maxLength?: number
    placeholder?: string
}

type Draft = Record<string, unknown>

/** Empty draft for a new item */
function emptyDraft(fields: FieldDef[]): Draft {
    return Object.fromEntries(fields.map((f) => [f.name, f.type === "avatar" ? null : ""]))
}

/** Draft from an existing item (avatar fields also keep the Media for preview) */
function toDraft(fields: FieldDef[], item: Draft): Draft {
    const draft: Draft = {}
    for (const f of fields) {
        draft[f.name] = item[f.name] ?? (f.type === "avatar" ? null : "")
        if (f.type === "avatar") draft.avatar = item.avatar ?? null
    }
    return draft
}

/** Only send the API fields, never the preview objects */
function toPayload(fields: FieldDef[], draft: Draft) {
    return Object.fromEntries(fields.map((f) => [f.name, draft[f.name]]))
}

export default function CollectionEditor<T extends BaseItem>({
    endpoint,
    number,
    title,
    description,
    itemName,
    initialItems,
    fields,
    summary,
    maxItems,
}: {
    endpoint: string
    number: string
    title: string
    description?: string
    itemName: string
    initialItems: T[]
    fields: FieldDef[]
    /** `image`: thumbnail URL; pass null to show initials, omit for no thumbnail */
    summary: (item: T) => { primary: string; secondary?: string; image?: string | null }
    /** Layout only shows this many visible items */
    maxItems?: number
}) {
    const [items, setItems] = React.useState(initialItems)
    const [adding, setAdding] = React.useState(false)
    const { pending, status, run } = useAction()

    const visibleCount = items.filter((i) => i.isVisible).length

    function replace(updated: T) {
        setItems((current) => current.map((i) => (i.id === updated.id ? updated : i)))
    }

    function create(draft: Draft) {
        return run(async () => {
            const { item } = await api<{ item: T }>(endpoint, { method: "POST", json: toPayload(fields, draft) })
            setItems((current) => [...current, item])
            setAdding(false)
        }, `${itemName} added`)
    }

    function update(id: string, data: object, successText = `${itemName} saved`) {
        return run(async () => {
            const { item } = await api<{ item: T }>(`${endpoint}/${id}`, { method: "PATCH", json: data })
            replace(item)
        }, successText)
    }

    function remove(item: T) {
        if (!confirm(`Delete this ${itemName.toLowerCase()}?`)) return
        return run(async () => {
            await api(`${endpoint}/${item.id}`, { method: "DELETE" })
            setItems((current) => current.filter((i) => i.id !== item.id))
        }, `${itemName} deleted`)
    }

    function move(index: number, direction: -1 | 1) {
        const next = [...items]
        const [moved] = next.splice(index, 1)
        next.splice(index + direction, 0, moved)
        setItems(next)

        return run(async () => {
            const res = await api<{ items: T[] }>(endpoint, {
                method: "PUT",
                json: { ids: next.map((i) => i.id) },
            })
            setItems(res.items)
        }, "Order saved")
    }

    return (
        <EditorSection
            number={number}
            title={title}
            description={
                maxItems
                    ? `${description ?? ""} The layout shows the first ${maxItems} visible items (${visibleCount} visible).`.trim()
                    : description
            }
            actions={
                <>
                    <StatusText status={status} />
                    {!adding && (
                        <PrimaryButton onClick={() => setAdding(true)}>
                            <Plus size={16} />
                            Add {itemName}
                        </PrimaryButton>
                    )}
                </>
            }
        >
            <div className="space-y-2">
                {items.length === 0 && !adding && (
                    <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-xs text-zinc-500 dark:border-zinc-700">
                        No {itemName.toLowerCase()}s yet — this section is hidden on the site until you add one.
                    </div>
                )}

                {items.map((item, index) => (
                    <ItemRow
                        key={item.id}
                        index={index}
                        total={items.length}
                        item={item}
                        fields={fields}
                        summary={summary(item)}
                        pending={pending}
                        onSave={(draft) => update(item.id, toPayload(fields, draft))}
                        onToggleVisible={() =>
                            update(item.id, { isVisible: !item.isVisible }, item.isVisible ? "Hidden" : "Visible")
                        }
                        onMove={(direction) => move(index, direction)}
                        onDelete={() => remove(item)}
                    />
                ))}

                {adding && (
                    <div className="rounded-lg border border-red-500/40 p-4">
                        <ItemForm
                            fields={fields}
                            initial={emptyDraft(fields)}
                            submitLabel={`Add ${itemName}`}
                            pending={pending}
                            onSubmit={create}
                            onCancel={() => setAdding(false)}
                        />
                    </div>
                )}
            </div>
        </EditorSection>
    )
}


/* =============================================================
   ROW
============================================================= */

function ItemRow<T extends BaseItem>({
    index,
    total,
    item,
    fields,
    summary,
    pending,
    onSave,
    onToggleVisible,
    onMove,
    onDelete,
}: {
    index: number
    total: number
    item: T
    fields: FieldDef[]
    summary: { primary: string; secondary?: string; image?: string | null }
    pending: boolean
    onSave: (draft: Draft) => Promise<boolean>
    onToggleVisible: () => void
    onMove: (direction: -1 | 1) => void
    onDelete: () => void
}) {
    const [editing, setEditing] = React.useState(false)

    if (editing) {
        return (
            <div className="rounded-lg border border-red-500/40 p-4">
                <ItemForm
                    fields={fields}
                    initial={toDraft(fields, item as unknown as Draft)}
                    submitLabel="Save"
                    pending={pending}
                    onSubmit={async (draft) => {
                        if (await onSave(draft)) setEditing(false)
                    }}
                    onCancel={() => setEditing(false)}
                />
            </div>
        )
    }

    return (
        <div className={`flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800 ${item.isVisible ? "" : "opacity-50"}`}>
            <span className="w-6 text-[10px] font-semibold tracking-widest text-red-500">
                {String(index + 1).padStart(2, "0")}
            </span>

            {summary.image !== undefined && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-semibold dark:bg-zinc-800">
                    {summary.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={summary.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                        summary.primary.slice(0, 2).toUpperCase()
                    )}
                </div>
            )}

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{summary.primary}</p>
                {summary.secondary && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{summary.secondary}</p>
                )}
            </div>

            <div className="flex items-center">
                <IconButton label="Move up" disabled={pending || index === 0} onClick={() => onMove(-1)}>
                    <ArrowUp size={15} />
                </IconButton>
                <IconButton label="Move down" disabled={pending || index === total - 1} onClick={() => onMove(1)}>
                    <ArrowDown size={15} />
                </IconButton>
                <IconButton label={item.isVisible ? "Hide" : "Show"} disabled={pending} onClick={onToggleVisible}>
                    {item.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                </IconButton>
                <IconButton label="Edit" disabled={pending} onClick={() => setEditing(true)}>
                    <Pencil size={15} />
                </IconButton>
                <IconButton label="Delete" danger disabled={pending} onClick={onDelete}>
                    <Trash2 size={15} />
                </IconButton>
            </div>
        </div>
    )
}


/* =============================================================
   FORM
============================================================= */

function ItemForm({
    fields,
    initial,
    submitLabel,
    pending,
    onSubmit,
    onCancel,
}: {
    fields: FieldDef[]
    initial: Draft
    submitLabel: string
    pending: boolean
    onSubmit: (draft: Draft) => unknown
    onCancel: () => void
}) {
    const [draft, setDraft] = React.useState(initial)
    const set = (name: string, value: unknown) => setDraft((current) => ({ ...current, [name]: value }))

    return (
        <form
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit(draft)
            }}
        >
            {fields.map((field) => {
                if (field.type === "avatar") {
                    return (
                        <div key={field.name} className="space-y-2">
                            <p className={labelClass}>{field.label}</p>
                            <MediaUpload
                                kind="image"
                                compact
                                media={draft.avatar as Media | null}
                                onUploaded={(media) => setDraft((d) => ({ ...d, [field.name]: media.id, avatar: media }))}
                                onRemove={() => setDraft((d) => ({ ...d, [field.name]: null, avatar: null }))}
                            />
                        </div>
                    )
                }

                const Field = field.type === "textarea" ? TextAreaField : TextField
                return (
                    <Field
                        key={field.name}
                        label={field.label}
                        value={(draft[field.name] as string) ?? ""}
                        onChange={(v) => set(field.name, v)}
                        maxLength={field.maxLength}
                        placeholder={field.placeholder}
                    />
                )
            })}

            <div className="flex justify-end gap-2">
                <SecondaryButton onClick={onCancel}>
                    <X size={14} />
                    Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" pending={pending}>
                    {submitLabel}
                </PrimaryButton>
            </div>
        </form>
    )
}
