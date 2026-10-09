import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/auth/dal";
import { prismaErrorResponse } from "@/lib/home/collections";
import { parseBody, readJson, type Spec } from "@/lib/home/validation";
import { getSiteSettings, revalidateWebsite, SITE_SETTINGS_ID } from "@/lib/settings";

/** PATCH /api/settings — website and notification settings (partial update). */

const settingsSpec: Spec = {
    siteTitle: { type: "string", required: true, max: 70 },
    siteDescription: { type: "string", required: true, max: 200 },
    siteUrl: { type: "url" },
    allowIndexing: { type: "boolean" },
    maintenanceMode: { type: "boolean" },
    maintenanceMessage: { type: "string", max: 300 },
    logoId: { type: "string" },
    faviconId: { type: "string" },
    googleAnalyticsId: {
        type: "string",
        max: 30,
        pattern: /^G-[A-Z0-9]{4,20}$/,
        patternMessage: "Google Analytics ID looks like G-XXXXXXXXXX (Admin → Data streams)",
    },
    notifyNewSubscriber: { type: "boolean" },
    notifyUploadReminders: { type: "boolean" },
    notifyNewComments: { type: "boolean" },
    notifyWeeklySummary: { type: "boolean" },
};

export const PATCH = withAdmin(async (req: NextRequest) => {
    const parsed = parseBody(await readJson(req), settingsSpec, { partial: true });
    if (parsed.error !== undefined) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const data = parsed.data;
    if (typeof data.siteUrl === "string") data.siteUrl = data.siteUrl.replace(/\/+$/, "");

    try {
        const before = await getSiteSettings(); // creates the row on first save
        // Turning the comment digest on starts counting from now, not from the channel's first comment
        if (data.notifyNewComments === true && !before.notifyNewComments) data.commentsCheckedAt = new Date();

        const settings = await prisma.siteSettings.update({
            where: { id: SITE_SETTINGS_ID },
            data,
            include: { logo: true, favicon: true },
        });
        revalidateWebsite();
        return NextResponse.json({ settings });
    } catch (err) {
        return prismaErrorResponse(err, "settings");
    }
});
