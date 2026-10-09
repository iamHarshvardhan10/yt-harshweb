import { redirect } from "next/navigation"

import { getAdminUser } from "@/lib/auth/dal"
import { getInvestigationsAdmin } from "@/lib/investigations/queries"
import { getVideosByIds } from "@/lib/youtube"
import InvestigationList from "@/components/dashboard/investigations/InvestigationList"

export default async function InvestigationsPage() {
    // proxy.ts only checks that a cookie exists — confirm the session here
    if (!(await getAdminUser())) redirect("/login?next=/dashboard/investigations")

    const items = await getInvestigationsAdmin()
    const videos = await getVideosByIds(items.flatMap((item) => item.youtubeVideoId ?? []))

    return (
        <InvestigationList
            items={items}
            videoTitles={Object.fromEntries([...videos].map(([id, video]) => [id, video.title]))}
        />
    )
}
