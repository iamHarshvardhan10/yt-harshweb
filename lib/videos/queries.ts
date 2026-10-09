import { cache } from "react";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getChannelUploads } from "@/lib/youtube";
import { DEFAULT_VIDEO_SETTINGS, type PublicVideo, type VideoWebsiteSettings } from "@/lib/videos/shared";

const HOME_VIDEO_LIMIT = 6;
const HOME_PICKED_LIMIT = 9;

/** Saved settings keyed by YouTube video id (videos without a row use the defaults). */
export async function getVideoSettings(): Promise<Record<string, VideoWebsiteSettings>> {
    const rows = await prisma.videoSetting.findMany({ omit: { updatedAt: true } });
    return Object.fromEntries(rows.map(({ videoId, ...settings }) => [videoId, settings]));
}

/** Website pages that list channel videos. */
export function revalidateVideoPages() {
    revalidatePath("/");
    revalidatePath("/videos");
}

type ChannelVideos = {
    videos: PublicVideo[];
    /** null when YouTube isn't configured or couldn't be reached */
    channelUrl: string | null;
};

/**
 * Every upload marked visible, featured first, then by display order, then
 * newest first. YouTube responses are cached for 10 minutes (lib/youtube.ts).
 */
export const getPublicVideos = cache(async (): Promise<ChannelVideos & { home: PublicVideo[] }> => {
    const [result, settings] = await Promise.all([getChannelUploads(), getVideoSettings()]);
    if (result.status !== "ok") return { videos: [], home: [], channelUrl: null };

    const rank = (order: number | null) => order ?? Number.MAX_SAFE_INTEGER;

    const withSettings = result.data.uploads.map((upload, index) => ({
        upload,
        index, // uploads arrive newest first
        settings: settings[upload.id] ?? DEFAULT_VIDEO_SETTINGS,
    }));

    const visible = withSettings
        .filter((v) => v.settings.isVisible)
        .sort(
            (a, b) =>
                Number(b.settings.featured) - Number(a.settings.featured) ||
                rank(a.settings.displayOrder) - rank(b.settings.displayOrder) ||
                a.index - b.index
        );

    const toPublic = (v: (typeof visible)[number]): PublicVideo => ({
        ...v.upload,
        featured: v.settings.featured,
        category: v.settings.category,
    });

    // Picked in the dashboard ("Show on Homepage"); otherwise the latest long videos
    const picked = visible.filter((v) => v.settings.showOnHome).slice(0, HOME_PICKED_LIMIT);
    const home = picked.length
        ? picked
        : visible.filter((v) => v.upload.type === "video").slice(0, HOME_VIDEO_LIMIT);

    return {
        videos: visible.map(toPublic),
        home: home.map(toPublic),
        channelUrl: result.data.channelUrl,
    };
});
