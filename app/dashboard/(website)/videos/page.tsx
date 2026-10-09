import { redirect } from "next/navigation"

import { getAdminUser } from "@/lib/auth/dal"
import { getChannelUploads } from "@/lib/youtube"
import { getVideoSettings } from "@/lib/videos/queries"
import VideoManager from "@/components/dashboard/videos/VideoManager"
import { syncYouTube } from "@/app/dashboard/actions"

export default async function VideosPage() {
    // proxy.ts only checks that a cookie exists — confirm the session here
    if (!(await getAdminUser())) redirect("/login?next=/dashboard/videos")

    const [result, settings] = await Promise.all([getChannelUploads(), getVideoSettings()])

    return <VideoManager result={result} savedSettings={settings} onSync={syncYouTube} />
}
