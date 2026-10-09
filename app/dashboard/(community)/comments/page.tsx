import { redirect } from "next/navigation"

import { getAdminUser } from "@/lib/auth/dal"
import { getChannelComments } from "@/lib/youtube"
import { syncYouTube } from "@/app/dashboard/actions"
import CommentInbox from "@/components/dashboard/community/CommentInbox"

export default async function CommentsPage() {
    // proxy.ts only checks that a cookie exists — confirm the session here
    if (!(await getAdminUser())) redirect("/login?next=/dashboard/comments")

    return <CommentInbox result={await getChannelComments()} onRefresh={syncYouTube} />
}
