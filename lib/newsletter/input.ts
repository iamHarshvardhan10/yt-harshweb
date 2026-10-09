import type { Prisma } from "@prisma/client";

import { parseBody, type Spec } from "@/lib/home/validation";
import { NEWSLETTER_TOPICS } from "@/lib/newsletter/shared";

const campaignSpec: Spec = {
    subject: { type: "string", required: true, max: 200 },
    preview: { type: "string", max: 200 },
    body: { type: "string", required: true, max: 50_000 },
    topics: { type: "strings", maxItems: NEWSLETTER_TOPICS.length, max: 40 },
    // SENDING / SENT are set by the send step only
    status: { type: "enum", values: ["DRAFT", "SCHEDULED"] },
    scheduledAt: { type: "datetime" },
    showOnWebsite: { type: "boolean" },
};

/** Validates a campaign create / update; a SCHEDULED campaign needs a future time. */
export function parseCampaign(
    body: unknown,
    { partial, current }: { partial: boolean; current?: { status: string; scheduledAt: Date | null } }
): { data: Prisma.CampaignUpdateInput; error?: undefined } | { error: string } {
    const parsed = parseBody(body, campaignSpec, { partial });
    if (parsed.error !== undefined) return { error: parsed.error };
    const data = parsed.data;

    const topics = data.topics as string[] | undefined;
    const unknown = topics?.find((topic) => !(NEWSLETTER_TOPICS as readonly string[]).includes(topic));
    if (unknown) return { error: `Unknown topic "${unknown}"` };

    const status = (data.status as string | undefined) ?? current?.status ?? "DRAFT";
    const scheduledAt = data.scheduledAt !== undefined ? (data.scheduledAt as Date | null) : current?.scheduledAt ?? null;

    if (status === "SCHEDULED") {
        if (!scheduledAt) return { error: "Pick a date and time to schedule it" };
        if (scheduledAt.getTime() < Date.now() - 60_000) return { error: "The scheduled time is in the past" };
    }

    return { data };
}
