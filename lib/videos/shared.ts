/** Video website settings — safe to import from client components. */

import type { YouTubeUpload } from "@/lib/youtube";

export const VIDEO_CATEGORIES = ["Investigations", "Explainers", "Climate", "Technology"] as const;

export type VideoWebsiteSettings = {
    isVisible: boolean;
    showOnHome: boolean;
    featured: boolean;
    /** lower comes first; null = by publish date */
    displayOrder: number | null;
    category: string | null;
};

/** What a video without a saved row looks like */
export const DEFAULT_VIDEO_SETTINGS: VideoWebsiteSettings = {
    isVisible: true,
    showOnHome: false,
    featured: false,
    displayOrder: null,
    category: null,
};

/** A YouTube upload as the website shows it */
export type PublicVideo = YouTubeUpload & Pick<VideoWebsiteSettings, "featured" | "category">;

/** "12 Aug 2026" */
export const videoDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
