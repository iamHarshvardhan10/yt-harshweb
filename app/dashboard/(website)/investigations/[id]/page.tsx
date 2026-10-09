import { notFound, redirect } from "next/navigation"

import { getAdminUser } from "@/lib/auth/dal"
import { prisma } from "@/lib/prisma"
import { getInvestigationAdmin } from "@/lib/investigations/queries"
import { getChannelUploads } from "@/lib/youtube"
import InvestigationEditor from "@/components/dashboard/investigations/InvestigationEditor"

/** /dashboard/investigations/new creates; any other id edits. */
export default async function InvestigationEditPage({ params }: PageProps<"/dashboard/investigations/[id]">) {
    const { id } = await params

    // proxy.ts only checks that a cookie exists — confirm the session here
    if (!(await getAdminUser())) redirect(`/login?next=/dashboard/investigations/${id}`)

    const isNew = id === "new"

    const [investigation, uploads, categories] = await Promise.all([
        isNew ? null : getInvestigationAdmin(id),
        getChannelUploads(),
        prisma.investigation.findMany({ distinct: ["category"], select: { category: true } }),
    ])

    if (!isNew && !investigation) notFound()

    return (
        <InvestigationEditor
            investigation={investigation}
            channelVideos={
                uploads.status === "ok"
                    ? uploads.data.uploads.map(({ id, title, type, publishedAt }) => ({ id, title, type, publishedAt }))
                    : []
            }
            channelError={uploads.status === "error" ? uploads.message : null}
            categories={categories.map((c) => c.category)}
        />
    )
}
