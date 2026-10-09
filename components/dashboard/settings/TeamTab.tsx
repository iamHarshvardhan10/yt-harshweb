"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Check, Copy, KeyRound, Lock, Mail, RotateCw, Send, ShieldCheck, Trash2, UserPlus } from "lucide-react"

import { api } from "@/components/dashboard/home/api"
import { EditorSection, inputClass } from "@/components/dashboard/home/ui"
import { relativeTime } from "@/lib/format"
import type { Member } from "./SettingsManager"

type InviteResult = { inviteUrl: string; emailed: boolean; emailError: string | null }

export default function TeamTab({ members, meId }: { members: Member[]; meId: number }) {
    const router = useRouter()

    const [name, setName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [pending, setPending] = React.useState<string | null>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [invite, setInvite] = React.useState<(InviteResult & { email: string }) | null>(null)

    const active = members.filter((m) => m.accepted)
    const invited = members.filter((m) => !m.accepted)

    async function run(key: string, fn: () => Promise<void>) {
        setPending(key)
        setError(null)
        try {
            await fn()
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setPending(null)
        }
    }

    function sendInvite(e: React.FormEvent) {
        e.preventDefault()
        run("invite", async () => {
            const result = await api<InviteResult>("/api/team", { method: "POST", json: { name, email } })
            setInvite({ ...result, email: email.trim().toLowerCase() })
            setName("")
            setEmail("")
        })
    }

    function resend(member: Member) {
        run(`resend-${member.id}`, async () => {
            const result = await api<InviteResult>(`/api/team/${member.id}`, { method: "POST" })
            setInvite({ ...result, email: member.email })
        })
    }

    function remove(member: Member) {
        const message = member.accepted
            ? `Remove ${member.name} (${member.email})? They're signed out right away and can't sign in again.`
            : `Revoke the invite for ${member.email}? The link stops working.`
        if (!window.confirm(message)) return
        run(`remove-${member.id}`, () => api(`/api/team/${member.id}`, { method: "DELETE" }).then(() => {
            if (invite?.email === member.email) setInvite(null)
        }))
    }

    return (
        <>
            <EditorSection
                number="01"
                title="Invite to Dashboard"
                description="They get an email with a link to set a password, then set up Google Authenticator on their first sign-in. Everyone on the team has full access."
            >
                <form onSubmit={sendInvite} className="flex flex-col gap-2 sm:flex-row">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" maxLength={80} className={`${inputClass} sm:w-44`} aria-label="Name" />
                    <div className="relative flex-1">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={`${inputClass} pl-9`} aria-label="Email" />
                    </div>
                    <button
                        type="submit"
                        disabled={pending !== null || !name.trim() || !email.trim()}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        <Send size={15} />
                        {pending === "invite" ? "Inviting…" : "Invite"}
                    </button>
                </form>

                {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

                {invite && <InviteLink invite={invite} />}
            </EditorSection>

            <EditorSection number="02" title={`Members (${active.length})`}>
                <div className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                    {active.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                            <MemberAvatar member={member} />

                            <div className="min-w-0 flex-1">
                                <p className="flex items-center gap-2 truncate text-sm font-medium">
                                    {member.name}
                                    {member.id === meId && (
                                        <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-500">You</span>
                                    )}
                                </p>
                                <p className="truncate text-xs text-zinc-500">
                                    {member.email} · {member.lastLoginAt ? `last signed in ${relativeTime(member.lastLoginAt.toISOString())}` : "hasn't signed in yet"}
                                </p>
                            </div>

                            <span
                                title={member.totpEnabled ? "Google Authenticator is set up" : "Sets up Google Authenticator on first sign-in"}
                                className={`hidden shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium sm:inline-flex ${member.totpEnabled ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}
                            >
                                {member.totpEnabled ? <ShieldCheck size={11} /> : <KeyRound size={11} />}
                                {member.totpEnabled ? "2FA on" : "2FA pending"}
                            </span>

                            {member.id !== meId && (
                                <button
                                    type="button"
                                    aria-label={`Remove ${member.name}`}
                                    title="Remove access"
                                    disabled={pending !== null}
                                    onClick={() => remove(member)}
                                    className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-950/30"
                                >
                                    <Trash2 size={15} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </EditorSection>

            <EditorSection number="03" title={`Pending Invites (${invited.length})`}>
                {invited.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-300 px-5 py-8 text-center dark:border-zinc-700">
                        <UserPlus size={20} className="mx-auto text-zinc-400" />
                        <p className="mt-2 text-xs text-zinc-500">No pending invites.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {invited.map((member) => {
                            const expired = !member.inviteExpiresAt || member.inviteExpiresAt < new Date()
                            return (
                                <div key={member.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                                    <MemberAvatar member={member} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{member.name} · <span className="font-normal text-zinc-500">{member.email}</span></p>
                                        <p className={`text-xs ${expired ? "text-red-500" : "text-zinc-500"}`}>
                                            {expired
                                                ? "Invite expired — resend it"
                                                : `Invited ${relativeTime(member.createdAt.toISOString())} · link expires ${member.inviteExpiresAt!.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => resend(member)}
                                        disabled={pending !== null}
                                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:hover:bg-zinc-900 dark:hover:text-white"
                                    >
                                        <RotateCw size={12} className={pending === `resend-${member.id}` ? "animate-spin" : ""} />
                                        Resend
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Revoke invite for ${member.email}`}
                                        title="Revoke invite"
                                        onClick={() => remove(member)}
                                        disabled={pending !== null}
                                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-950/30"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </EditorSection>

            <EditorSection number="04" title="Sign-in Rules">
                <ul className="space-y-3 text-sm">
                    <Rule>Only people on this list can sign in — there&apos;s no public sign-up.</Rule>
                    <Rule>Everyone needs their password <em>and</em> a Google Authenticator code, every time.</Rule>
                    <Rule>5 wrong attempts lock the account for 15 minutes.</Rule>
                </ul>
            </EditorSection>
        </>
    )
}

function InviteLink({ invite }: { invite: InviteResult & { email: string } }) {
    const [copied, setCopied] = React.useState(false)

    return (
        <div className={`mt-4 rounded-lg border p-4 text-xs ${invite.emailed ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
            <p className="font-medium">
                {invite.emailed ? `Invite emailed to ${invite.email}.` : `Invite created for ${invite.email}, but it wasn't emailed.`}
            </p>
            {!invite.emailed && invite.emailError && <p className="mt-1 text-zinc-500">{invite.emailError}</p>}
            <p className="mt-2 text-zinc-500">You can also share this link directly — it works once, for 7 days:</p>
            <div className="mt-2 flex gap-2">
                <input readOnly value={invite.inviteUrl} onFocus={(e) => e.target.select()} className={`${inputClass} font-mono text-[11px]`} aria-label="Invite link" />
                <button
                    type="button"
                    onClick={async () => {
                        await navigator.clipboard.writeText(invite.inviteUrl)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1500)
                    }}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
        </div>
    )
}

function MemberAvatar({ member }: { member: Member }) {
    return member.avatar ? (
        <Image src={member.avatar.secureUrl} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover" />
    ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-900">
            {member.name.charAt(0).toUpperCase()}
        </div>
    )
}

function Rule({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            <Lock size={14} className="mt-0.5 shrink-0 text-green-600" />
            <span>{children}</span>
        </li>
    )
}
