import { cache } from "react";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export const SITE_SETTINGS_ID = "site";

export const defaultSiteSettings = {
    siteTitle: "Harsh Bhosale - YouTube",
    siteDescription: "Stories that deserves a closer look",
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

/** Every public page shows the title, favicon, logo and analytics settings. */
export function revalidateWebsite() {
    revalidatePath("/", "layout");
}
