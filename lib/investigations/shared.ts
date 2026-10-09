/** Investigation helpers that are safe to import from client components. */

import type { DocumentLanguage, InvestigationStatus } from "@prisma/client";

export const LANGUAGES = ["EN", "HI"] as const satisfies readonly DocumentLanguage[];

export const languageLabels: Record<DocumentLanguage, { name: string; native: string; htmlLang: string }> = {
    EN: { name: "English", native: "English", htmlLang: "en" },
    HI: { name: "Hindi", native: "हिन्दी", htmlLang: "hi" },
};

export const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const satisfies readonly InvestigationStatus[];

export const statusLabels: Record<InvestigationStatus, string> = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
};

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Why Mumbai Floods?" → "why-mumbai-floods" */
export function slugify(text: string) {
    return text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

const VIDEO_ID = /^[\w-]{11}$/;

/** Accepts a bare id or any youtube.com / youtu.be watch, shorts, live or embed link. */
export function youtubeIdFromUrl(input: string): string | null {
    const value = input.trim();
    if (VIDEO_ID.test(value)) return value;

    try {
        const url = new URL(value);
        const host = url.hostname.replace(/^(www|m)\./, "");

        if (host === "youtu.be") {
            const id = url.pathname.slice(1);
            return VIDEO_ID.test(id) ? id : null;
        }
        if (host === "youtube.com" || host === "youtube-nocookie.com") {
            const id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{11})/)?.[1];
            return id && VIDEO_ID.test(id) ? id : null;
        }
    } catch {
        // not a URL
    }
    return null;
}

export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** Works without an API key; hqdefault exists for every video. */
export const youtubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
