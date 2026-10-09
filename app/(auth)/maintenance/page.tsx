import type { Metadata } from "next"

import { getSiteSettings } from "@/lib/settings"

export const metadata: Metadata = {
    title: "Back soon",
    robots: { index: false, follow: false },
}

/** Shown to visitors while Settings → Website → Maintenance mode is on (see proxy.ts). */
export default async function MaintenancePage() {
    const settings = await getSiteSettings()

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
            <span className="relative flex h-12 w-12 items-center justify-center">
                <span className="absolute h-3 w-3 animate-pulse rounded-full bg-[#82CFFF]" />
            </span>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#82CFFF]">{settings.siteTitle}</p>
            <h1 className="mt-4 text-4xl uppercase md:text-6xl">We&apos;ll be right back</h1>
            <p className="mt-6 max-w-xl whitespace-pre-line text-base uppercase text-zinc-400">
                {settings.maintenanceMessage || "We're making some improvements to the site. Please check back soon."}
            </p>
        </main>
    )
}
