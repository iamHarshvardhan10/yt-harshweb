import type { Metadata } from "next"
import Link from "next/link"

import { findInvite } from "@/lib/auth/invites"
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password"
import AcceptInviteForm from "./AcceptInviteForm"

export const metadata: Metadata = {
    title: "Accept invite - Harsh Bhosale",
    robots: { index: false, follow: false },
}

/** Where team invite emails link to: set a password, then sign in. */
export default async function InvitePage({ searchParams }: PageProps<"/invite">) {
    const { token } = await searchParams
    const value = typeof token === "string" ? token : ""
    const invite = await findInvite(value)

    return (
        <main className="flex min-h-screen items-center justify-center px-6 py-12">
            <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-medium uppercase tracking-widest text-red-500">Creator Dashboard</p>

                {invite ? (
                    <>
                        <h1 className="mt-2 text-xl font-semibold">Welcome, {invite.name.split(/\s+/)[0]}</h1>
                        <p className="mt-2 text-sm text-zinc-500">
                            Set a password for <span className="font-medium text-zinc-900 dark:text-white">{invite.email}</span>.
                            After that you&apos;ll set up Google Authenticator on your first sign-in.
                        </p>
                        <AcceptInviteForm token={value} email={invite.email} minLength={MIN_PASSWORD_LENGTH} />
                    </>
                ) : (
                    <>
                        <h1 className="mt-2 text-xl font-semibold">This invite link doesn&apos;t work</h1>
                        <p className="mt-2 text-sm text-zinc-500">
                            It has expired, was already used, or was replaced by a newer invite. Ask the person who invited you to send a new one.
                        </p>
                        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-red-500 hover:text-red-400">
                            Go to sign in
                        </Link>
                    </>
                )}
            </div>
        </main>
    )
}
