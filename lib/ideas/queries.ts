import { prisma } from "@/lib/prisma";
import { youtubeIdFromUrl } from "@/lib/investigations/shared";

/** Ideas for the board: scheduled ones first by upload time, then newest. */
export function getContentIdeas() {
    return prisma.contentIdea.findMany({
        orderBy: [{ uploadAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    });
}

/** Lets the API accept a pasted YouTube link as well as a bare video id. */
export function normalizeVideoLink(body: unknown) {
    if (!body || typeof body !== "object" || Array.isArray(body)) return body;

    const input = body as Record<string, unknown>;
    if (typeof input.youtubeVideoId !== "string" || !input.youtubeVideoId.trim()) return body;

    return { ...input, youtubeVideoId: youtubeIdFromUrl(input.youtubeVideoId) ?? input.youtubeVideoId };
}
