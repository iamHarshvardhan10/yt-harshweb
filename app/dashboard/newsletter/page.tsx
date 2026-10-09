import { redirect } from "next/navigation"

import { getAdminUser } from "@/lib/auth/dal"
import { prisma } from "@/lib/prisma"
import { getReminderRecipients, isMailConfigured } from "@/lib/mail"
import NewsletterManager from "@/components/dashboard/newsletter/NewsletterManager"

export default async function NewsletterPage() {
    // proxy.ts only checks that a cookie exists — confirm the session here
    if (!(await getAdminUser())) redirect("/login?next=/dashboard/newsletter")

    const [subscribers, campaigns, testRecipients] = await Promise.all([
        prisma.subscriber.findMany({
            orderBy: { createdAt: "desc" },
            // The token is a secret for the reader's links — the dashboard never needs it
            omit: { token: true },
        }),
        prisma.campaign.findMany({ orderBy: { createdAt: "desc" } }),
        getReminderRecipients(),
    ])

    return (
        <NewsletterManager
            subscribers={subscribers}
            campaigns={campaigns}
            mail={{ configured: isMailConfigured(), testRecipients }}
        />
    )
}
