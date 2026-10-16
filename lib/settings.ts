import { cache } from "react";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export const SITE_SETTINGS_ID = "site";

export const defaultSiteSettings = {
    siteTitle: "Harshwardhan Bhosale - YouTube",
    siteDescription: "Stories that deserve a closer look",
};

const withMedia = { logo: true, favicon: true } as const;

/** The settings row, created with defaults on first use. Cached per request. */
export const getSiteSettings = cache(async () => {
    const existing = await prisma.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID }, include: withMedia });
    if (existing) return existing;

    return prisma.siteSettings.upsert({
        where: { id: SITE_SETTINGS_ID },
        update: {},
        create: { id: SITE_SETTINGS_ID, ...defaultSiteSettings },
        include: withMedia,
    });
});

export type SiteSettingsWithMedia = Awaited<ReturnType<typeof getSiteSettings>>;

/**
 * Public site address for links in emails: SITE_URL env, then the Site URL
 * from Settings, then the address of the current request.
 */
export async function getSiteUrl(requestOrigin: string) {
    const configured = process.env.SITE_URL || (await getSiteSettings()).siteUrl || requestOrigin;
    return configured.replace(/\/$/, "");
}

/**
 * Public site address for canonical links, the sitemap and structured data:
 * SITE_URL env, then the Site URL from Settings, then the Vercel production
 * domain. Falls back to localhost so metadata never breaks in development.
 */
export async function getPublicSiteUrl() {
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    const configured =
        process.env.SITE_URL ||
        (await getSiteSettings()).siteUrl ||
        (vercel ? `https://${vercel}` : "http://localhost:3000");
    return configured.replace(/\/$/, "");
}

/** Every public page shows the title, favicon, logo and analytics settings. */
export function revalidateWebsite() {
    revalidatePath("/", "layout");
}
