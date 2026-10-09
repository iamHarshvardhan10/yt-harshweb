import { prisma } from "@/lib/prisma";

/** Marks the subscriber with this token as unsubscribed. False for an unknown token. */
export async function unsubscribeByToken(token: string) {
    if (!token) return false;
    const result = await prisma.subscriber.updateMany({
        where: { token, status: { not: "UNSUBSCRIBED" } },
        data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
    });
    if (result.count > 0) return true;
    // Already unsubscribed still counts as success
    return (await prisma.subscriber.count({ where: { token } })) > 0;
}

/** Sent issues for the public /newsletter page, newest first. */
export function getPublishedIssues(take?: number) {
    return prisma.campaign.findMany({
        where: { status: "SENT", showOnWebsite: true },
        orderBy: { sentAt: "desc" },
        select: { id: true, subject: true, preview: true, body: true, sentAt: true },
        take,
    });
}

/** Issue numbers count every sent campaign shown on the site, oldest = #1. */
export async function issueNumbers() {
    const issues = await prisma.campaign.findMany({
        where: { status: "SENT", showOnWebsite: true },
        orderBy: { sentAt: "asc" },
        select: { id: true },
    });
    return new Map(issues.map((issue, index) => [issue.id, index + 1]));
}

export function getActiveSubscriberCount() {
    return prisma.subscriber.count({ where: { status: "ACTIVE" } });
}
