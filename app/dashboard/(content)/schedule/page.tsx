import { redirect } from "next/navigation"

import { getAdminUser } from "@/lib/auth/dal"
import { getContentIdeas } from "@/lib/ideas/queries"
import { getReminderRecipients, isMailConfigured } from "@/lib/mail"
import ScheduleCalendar from "@/components/dashboard/schedule/ScheduleCalendar"
import { sendTestEmail } from "./actions"

// Scheduled posts are content ideas with a planned upload time — the same
// records as /dashboard/ideas, so both pages always agree.

export default async function SchedulePage() {
    // proxy.ts only checks that a cookie exists — confirm the session here
    if (!(await getAdminUser())) redirect("/login?next=/dashboard/schedule")

    const [ideas, recipients] = await Promise.all([getContentIdeas(), getReminderRecipients()])

    return (
        <ScheduleCalendar
            ideas={ideas}
            mail={{ configured: isMailConfigured(), recipients }}
            onSendTest={sendTestEmail}
        />
    )
}
