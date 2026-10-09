import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/lib/settings";

// Follows Settings → Website → "Allow search engines"; refreshed when settings are saved
export default async function robots(): Promise<MetadataRoute.Robots> {
    const settings = await getSiteSettings();
    const privatePaths = ["/dashboard", "/api", "/login", "/invite", "/newsletter/unsubscribe", "/newsletter/status"];

    return {
        rules: settings.allowIndexing
            ? { userAgent: "*", allow: "/", disallow: privatePaths }
            : { userAgent: "*", disallow: "/" },
    };
}
