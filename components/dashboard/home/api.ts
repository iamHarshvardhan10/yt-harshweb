"use client"

import * as React from "react"
import type {
    HomeAboutItem,
    HomeFaq,
    HomeHero,
    HomeHeroMedia,
    HomeMetric,
    HomeSection,
    HomeTestimonial,
    Media,
} from "@prisma/client"

/* =============================================================
   TYPES (shape of /api/home?scope=admin)
============================================================= */

export type HeroWithMedia = HomeHero & { media: (HomeHeroMedia & { media: Media })[] }
export type SectionWithMedia = HomeSection & { media: Media | null }
export type TestimonialWithAvatar = HomeTestimonial & { avatar: Media | null }

export type HomeAdminData = {
    hero: HeroWithMedia | null
    sections: SectionWithMedia[]
    metrics: HomeMetric[]
    aboutItems: HomeAboutItem[]
    testimonials: TestimonialWithAvatar[]
    faqs: HomeFaq[]
}

/* =============================================================
   FETCH HELPER
============================================================= */

export async function api<T>(
    url: string,
    { json, ...init }: RequestInit & { json?: unknown } = {}
): Promise<T> {
    const res = await fetch(url, {
        ...init,
        headers: json !== undefined ? { "Content-Type": "application/json" } : init.headers,
        body: json !== undefined ? JSON.stringify(json) : init.body,
    })

    if (res.status === 401) {
        // Session expired or revoked — back to login, then return here
        window.location.replace(`/login?next=${encodeURIComponent(location.pathname + location.search)}`)
        throw new Error("Your session expired. Redirecting to login…")
    }

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`)
    return data as T
}

export async function uploadMedia(file: File) {
    const body = new FormData()
    body.append("file", file)
    const { media } = await api<{ media: Media }>("/api/media/upload", { method: "POST", body })
    return media
}

/* =============================================================
   ACTION STATE (pending + success / error message)
============================================================= */

export type Status = { type: "success" | "error"; text: string } | null

export function useAction() {
    const [pending, setPending] = React.useState(false)
    const [status, setStatus] = React.useState<Status>(null)

    /** Runs `fn`, reporting the outcome in `status`. Resolves to true on success. */
    async function run(fn: () => Promise<void>, successText = "Saved") {
        setPending(true)
        setStatus(null)
        try {
            await fn()
            setStatus({ type: "success", text: successText })
            return true
        } catch (err) {
            setStatus({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" })
            return false
        } finally {
            setPending(false)
        }
    }

    return { pending, status, run }
}
