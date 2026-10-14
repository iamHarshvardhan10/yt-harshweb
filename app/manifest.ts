import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/lib/settings";
import { SITE_NAME } from "@/lib/seo";

// Name, description and icon follow Settings → Website (saving there refreshes it)
export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const settings = await getSiteSettings();

    return {
        name: settings.siteTitle,
        short_name: SITE_NAME,
        description: settings.siteDescription,
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        icons: [{ src: settings.favicon?.secureUrl ?? "/favicon.ico", sizes: "any" }],
    };
}
