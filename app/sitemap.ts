import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { getPublicSiteUrl, getSiteSettings } from "@/lib/settings";
import { getPublicVideos } from "@/lib/videos/queries";

// Dashboard changes refresh it right away (revalidatePath("/sitemap.xml"));
// new YouTube uploads show up within the hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const settings = await getSiteSettings();
    if (!settings.allowIndexing) return [];

    const [origin, investigations, issues, { videos }] = await Promise.all([
        getPublicSiteUrl(),
        prisma.investigation.findMany({
            where: { status: "PUBLISHED" },
            select: { slug: true, updatedAt: true },
            orderBy: { publishedAt: { sort: "desc", nulls: "last" } },
        }),
        prisma.campaign.findMany({
            where: { status: "SENT", showOnWebsite: true },
            select: { id: true, updatedAt: true },
            orderBy: { sentAt: "desc" },
        }),
        getPublicVideos(),
    ]);

    const latest = (dates: Date[]) =>
        dates.length ? new Date(Math.max(...dates.map((date) => date.getTime()))) : undefined;

    const pages: MetadataRoute.Sitemap = [
        { url: origin, changeFrequency: "weekly", priority: 1 },
        {
            url: `${origin}/investigations`,
            lastModified: latest(investigations.map((item) => item.updatedAt)),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${origin}/videos`,
            lastModified: videos[0] ? new Date(videos[0].publishedAt) : undefined,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        { url: `${origin}/newsletter`, changeFrequency: "weekly", priority: 0.6 },
        { url: `${origin}/about`, changeFrequency: "monthly", priority: 0.6 },
        { url: `${origin}/contact`, changeFrequency: "yearly", priority: 0.4 },
        { url: `${origin}/privacy`, changeFrequency: "yearly", priority: 0.1 },
        { url: `${origin}/terms`, changeFrequency: "yearly", priority: 0.1 },
    ];

    return [
        ...pages,
        ...investigations.map((item) => ({
            url: `${origin}/investigations/${item.slug}`,
            lastModified: item.updatedAt,
            changeFrequency: "monthly" as const,
            priority: 0.8,
        })),
        ...videos.map((video) => ({
            url: `${origin}/videos/${video.id}`,
            lastModified: new Date(video.publishedAt),
            changeFrequency: "monthly" as const,
            priority: 0.6,
        })),
        ...issues.map((issue) => ({
            url: `${origin}/newsletter/issues/${issue.id}`,
            lastModified: issue.updatedAt,
            changeFrequency: "yearly" as const,
            priority: 0.4,
        })),
    ];
}
