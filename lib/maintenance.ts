import { prisma } from "@/lib/prisma";
// Same id as lib/settings.ts (not imported, so the proxy bundle stays free of next/cache)
const SITE_SETTINGS_ID = "site";

/**
 * Maintenance flag for proxy.ts, which runs on every public request — so it's
 * read from the DB at most every 15 seconds. Turning maintenance on or off in
 * Settings takes up to 15 seconds to reach visitors.
 */

const TTL_MS = 15_000;
let cached: { on: boolean; at: number } | null = null;

export async function isMaintenanceOn() {
    if (cached && Date.now() - cached.at < TTL_MS) return cached.on;

    try {
        const row = await prisma.siteSettings.findUnique({
            where: { id: SITE_SETTINGS_ID },
            select: { maintenanceMode: true },
        });
        cached = { on: row?.maintenanceMode ?? false, at: Date.now() };
    } catch (err) {
        // If the DB is unreachable, keep serving the site rather than locking everyone out
        console.error("[maintenance] flag lookup failed:", err);
        cached = { on: cached?.on ?? false, at: Date.now() };
    }
    return cached.on;
}
