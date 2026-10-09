import { redirect } from "next/navigation"

import { getAdminUser } from "@/lib/auth/dal"
import { getContentIdeas } from "@/lib/ideas/queries"
import IdeaBoard from "@/components/dashboard/ideas/IdeaBoard"

export default async function IdeasPage() {
    // proxy.ts only checks that a cookie exists — confirm the session here
    if (!(await getAdminUser())) redirect("/login?next=/dashboard/ideas")

    return <IdeaBoard ideas={await getContentIdeas()} />
}
