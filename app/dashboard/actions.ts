"use server"

import { refresh, updateTag } from "next/cache"

import { getAdminUser } from "@/lib/auth/dal"
import { YOUTUBE_CACHE_TAG } from "@/lib/youtube"

/** Drops the cached YouTube responses so the next render re-fetches the channel. */
export async function syncYouTube() {
    if (!(await getAdminUser())) throw new Error("Unauthorized")

    updateTag(YOUTUBE_CACHE_TAG)
    refresh()
}
