import { redirect } from "next/navigation"

import { getAdminUser } from "@/lib/auth/dal"
import { getChannelComments, getChannelUploads } from "@/lib/youtube"
import AudienceInsights from "@/components/dashboard/community/AudienceInsights"

// Built from public YouTube data (API key). Age, gender, countries, devices and
// traffic sources need YouTube Analytics with the channel owner's Google sign-in.

export default async function AudiencePage() {
    // proxy.ts only checks that a cookie exists — confirm the session here
    if (!(await getAdminUser())) redirect("/login?next=/dashboard/audience")

    const [uploads, comments] = await Promise.all([getChannelUploads(), getChannelComments()])

    return <AudienceInsights uploads={uploads} comments={comments.status === "ok" ? comments.data : null} />
}
