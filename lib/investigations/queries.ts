import { revalidatePath } from "next/cache";
import type { DocumentLanguage, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getVideosByIds } from "@/lib/youtube";
import { LANGUAGES, youtubeThumbnail, youtubeWatchUrl } from "@/lib/investigations/shared";

const withDocuments = { documents: true } satisfies Prisma.InvestigationInclude;

const ordered: Prisma.InvestigationOrderByWithRelationInput[] = [
    { order: "asc" },
    { publishedAt: { sort: "desc", nulls: "last" } },
    { createdAt: "desc" },
];

export type InvestigationWithDocuments = Prisma.InvestigationGetPayload<{ include: typeof withDocuments }>;

/* =============================================================
   DASHBOARD
============================================================= */

/** Every investigation, any status, for the dashboard. */
export function getInvestigationsAdmin() {
    return prisma.investigation.findMany({ include: withDocuments, orderBy: ordered });
}

export function getInvestigationAdmin(id: string) {
    return prisma.investigation.findUnique({ where: { id }, include: withDocuments });
}

/** Public pages that show investigations. */
export function revalidateInvestigations() {
    revalidatePath("/investigations");
    revalidatePath("/investigations/[slug]", "page");
}

/* =============================================================
   WEBSITE
============================================================= */

export type PublicDocument = {
    language: DocumentLanguage;
    title: string;
    description: string | null;
    url: string;
    pages: number | null;
    readMinutes: number | null;
};

export type PublicInvestigation = {
    slug: string;
    title: string;
    summary: string;
    category: string;
    publishedAt: string | null; // YYYY-MM-DD
    keyFindings: string[];
    tags: string[];
    featured: boolean;
    thumbnail: string;
    video: { id: string; url: string; title: string | null; durationSeconds: number | null } | null;
    documents: PublicDocument[]; // English first
    metaTitle: string | null;
    metaDescription: string | null;
};

async function toPublic(items: InvestigationWithDocuments[]): Promise<PublicInvestigation[]> {
    // One YouTube call for every linked video; the page still works if it fails
    const videos = await getVideosByIds(items.flatMap((item) => item.youtubeVideoId ?? []));

    return items.map((item) => {
        const videoId = item.youtubeVideoId;
        const video = videoId ? videos.get(videoId) : undefined;

        return {
            slug: item.slug,
            title: item.title,
            summary: item.summary,
            category: item.category,
            publishedAt: item.publishedAt?.toISOString().slice(0, 10) ?? null,
            keyFindings: item.keyFindings,
            tags: item.tags,
            featured: item.featured,
            thumbnail: videoId ? youtubeThumbnail(videoId) : "/hero.webp",
            video: videoId
                ? {
                    id: videoId,
                    url: youtubeWatchUrl(videoId),
                    title: video?.title ?? null,
                    durationSeconds: video?.durationSeconds ?? null,
                }
                : null,
            documents: [...item.documents]
                .sort((a, b) => LANGUAGES.indexOf(a.language) - LANGUAGES.indexOf(b.language))
                .map((doc) => ({
                    language: doc.language,
                    title: doc.title ?? item.title,
                    description: doc.description,
                    url: doc.url,
                    pages: doc.pages,
                    readMinutes: doc.readMinutes,
                })),
            metaTitle: item.metaTitle,
            metaDescription: item.metaDescription,
        };
    });
}

/** Published investigations for /investigations. */
export async function getPublishedInvestigations() {
    const items = await prisma.investigation.findMany({
        where: { status: "PUBLISHED" },
        include: withDocuments,
        orderBy: ordered,
    });
    return toPublic(items);
}

/** A single published investigation, or null. */
export async function getPublishedInvestigation(slug: string) {
    const item = await prisma.investigation.findFirst({
        where: { slug, status: "PUBLISHED" },
        include: withDocuments,
    });
    return item ? (await toPublic([item]))[0] : null;
}
