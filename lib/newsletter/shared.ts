/** Newsletter helpers that are safe to import from client components. */

import type { CampaignStatus, SubscriberStatus } from "@prisma/client";

/** Topics readers can pick on the sign-up form (and campaigns can target) */
export const NEWSLETTER_TOPICS = ["Investigations", "Explainers", "Climate", "Policy", "Behind the Scenes"] as const;

export const subscriberStatusLabels: Record<SubscriberStatus, string> = {
    PENDING: "Unconfirmed",
    ACTIVE: "Active",
    UNSUBSCRIBED: "Unsubscribed",
};

export const campaignStatusLabels: Record<CampaignStatus, string> = {
    DRAFT: "Draft",
    SCHEDULED: "Scheduled",
    SENDING: "Sending",
    SENT: "Sent",
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Segment = { text: string; href?: string };

const URL_PATTERN = /(https?:\/\/[^\s<>"')\]]+)/g;

/**
 * Plain-text body → paragraphs of text and links. Blank lines separate
 * paragraphs; single line breaks are kept; http(s) URLs become links.
 */
export function bodyParagraphs(body: string): Segment[][] {
    return body
        .replace(/\r\n/g, "\n")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((paragraph) =>
            paragraph.split(URL_PATTERN).filter(Boolean).map((part) =>
                /^https?:\/\//.test(part) ? { text: part, href: part } : { text: part }
            )
        );
}

/** First ~140 characters of the body, for previews */
export const excerpt = (body: string, length = 140) => {
    const flat = body.replace(/\s+/g, " ").trim();
    return flat.length > length ? `${flat.slice(0, length).trimEnd()}…` : flat;
};
