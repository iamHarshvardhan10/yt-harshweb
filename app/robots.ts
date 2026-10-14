import type { MetadataRoute } from "next";

import { getPublicSiteUrl, getSiteSettings } from "@/lib/settings";

// Follows Settings → Website → "Allow search engines"; refreshed when settings are saved
export default async function robots(): Promise<MetadataRoute.Robots> {
    const [settings, siteUrl] = await Promise.all([getSiteSettings(), getPublicSiteUrl()]);
    const privatePaths = ["/dashboard", "/api", "/login", "/invite", "/newsletter/unsubscribe", "/newsletter/status"];

    return {
        rules: settings.allowIndexing
            ? { userAgent: "*", allow: "/", disallow: privatePaths }
            : { userAgent: "*", disallow: "/" },
        ...(settings.allowIndexing && { sitemap: `${siteUrl}/sitemap.xml` }),
    };
}
