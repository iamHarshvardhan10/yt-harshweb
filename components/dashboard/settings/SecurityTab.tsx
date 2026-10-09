"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { KeyRound, LogOut, Monitor, Smartphone, ShieldCheck } from "lucide-react"

import { api, useAction } from "@/components/dashboard/home/api"
import { EditorSection, PrimaryButton, StatusText, inputClass, labelClass } from "@/components/dashboard/home/ui"
import { relativeTime } from "@/lib/format"
import type { Me, SessionRow } from "./SettingsManager"

const MIN_PASSWORD_LENGTH = 10

/** "Chrome on Windows" from a user-agent string — good enough to recognise a device */
function describeDevice(userAgent: string | null) {
    if (!userAgent) return { label: "Unknown device", mobile: false }
    const browser =
        /Edg\//.test(userAgent) ? "Edge"
            : /OPR\//.test(userAgent) ? "Opera"
                : /Firefox\//.test(userAgent) ? "Firefox"
                    : /Chrome\//.test(userAgent) ? "Chrome"
                        : /Safari\//.test(userAgent) ? "Safari"
                            : "Browser"
    const os =
        /iPhone|iPad/.test(userAgent) ? "iOS"
            : /Android/.test(userAgent) ? "Android"
                : /Windows/.test(userAgent) ? "Windows"
                    : /Mac OS X/.test(userAgent) ? "macOS"
                        : /Linux/.test(userAgent) ? "Linux"
                            : "unknown OS"
    return { label: `${browser} on ${os}`, mobile: /Mobile|iPhone|Android/.test(userAgent) }
}

export default function SecurityTab({ me, sessions }: { me: Me; sessions: SessionRow[] }) {
    const router = useRouter()

    const [current, setCurrent] = React.useState("")
    const [next, setNext] = React.useState("")
    const [confirm, setConfirm] = React.useState("")
    const password = useAction()

    const [busySession, setBusySession] = React.useState<string | null>(null)
    const [sessionError, setSessionError] = React.useState<string | null>(null)

    const [resetPassword, setResetPassword] = React.useState("")
    const reset = useAction()

    const mismatch = confirm.length > 0 && next !== confirm
    const others = sessions.filter((s) => !s.current)

    function changePassword(e: React.FormEvent) {
        e.preventDefault()
        password.run(async () => {
            if (next.length < MIN_PASSWORD_LENGTH) throw new Error(`Use at least ${MIN_PASSWORD_LENGTH} characters`)
            if (next !== confirm) throw new Error("The new passwords don't match")
            await api("/api/account/password", { method: "POST", json: { currentPassword: current, newPassword: next } })
            setCurrent("")
            setNext("")
            setConfirm("")
            router.refresh()
        }, "Password changed — your other sessions were signed out")
    }

    async function signOut(query: string, key: string) {
        setBusySession(key)
        setSessionError(null)
        try {
            await api(`/api/account/sessions?${query}`, { method: "DELETE" })
            router.refresh()
        } catch (err) {
            setSessionError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setBusySession(null)
        }
    }

    function resetAuthenticator() {
        if (!window.confirm("Remove your authenticator and sign out everywhere? You'll scan a new QR code at your next sign-in.")) return
        reset.run(async () => {
            await api("/api/account/two-factor", { method: "DELETE", json: { password: resetPassword } })
            window.location.replace("/login?next=/dashboard/settings%3Ftab%3Dsecurity")
        }, "Done — redirecting to sign in…")
    }

    return (
        <>
            <EditorSection number="01" title="Password" actions={<StatusText status={password.status} />}>
                <form onSubmit={changePassword} className="space-y-4">
                    <input type="email" value={me.email} autoComplete="username" readOnly hidden />
                    <div className="space-y-2">
                        <label className={labelClass} htmlFor="current-password">Current password</label>
                        <input id="current-password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className={labelClass} htmlFor="new-password">New password</label>
                            <input id="new-password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelClass} htmlFor="confirm-password">Confirm new password</label>
                            <input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} aria-invalid={mismatch} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <p className={`text-[11px] ${mismatch ? "text-red-500" : "text-zinc-500"}`}>
                            {mismatch ? "The new passwords don't match" : `At least ${MIN_PASSWORD_LENGTH} characters. Changing it signs out your other sessions.`}
                        </p>
                        <PrimaryButton type="submit" pending={password.pending} disabled={!current || !next || !confirm}>
                            <KeyRound size={15} />
                            Update password
                        </PrimaryButton>
                    </div>
                </form>
            </EditorSection>

            <EditorSection
                number="02"
                title={`Signed-in Sessions (${sessions.length})`}
                description="Browsers where you're signed in to the dashboard. Sign out any you don't recognise, then change your password."
                actions={
                    others.length > 0 ? (
                        <button
                            type="button"
                            disabled={busySession !== null}
                            onClick={() => signOut("others=1", "others")}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                        >
                            <LogOut size={13} />
                            Sign out all others
                        </button>
                    ) : undefined
                }
            >
                <div className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                    {sessions.map((session) => {
                        const device = describeDevice(session.userAgent)
                        const Icon = device.mobile ? Smartphone : Monitor
                        return (
                            <div key={session.id} className="flex items-center gap-3 px-4 py-3">
                                <Icon size={18} className="shrink-0 text-zinc-400" />
                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-2 text-sm font-medium">
                                        {device.label}
                                        {session.current && (
                                            <span className="rounded-md bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-600">This browser</span>
                                        )}
                                    </p>
                                    <p className="truncate text-xs text-zinc-500">
                                        Signed in {relativeTime(session.createdAt.toISOString())}
                                        {session.ipAddress && ` · ${session.ipAddress}`}
                                    </p>
                                </div>
                                {!session.current && (
                                    <button
                                        type="button"
                                        disabled={busySession !== null}
                                        onClick={() => signOut(`id=${encodeURIComponent(session.id)}`, session.id)}
                                        className="rounded-md px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-red-500 disabled:opacity-50 dark:hover:bg-zinc-900"
                                    >
                                        {busySession === session.id ? "Signing out…" : "Sign out"}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
                {sessionError && <p className="mt-2 text-xs text-red-500">{sessionError}</p>}
            </EditorSection>

            <EditorSection number="03" title="Two-factor Authentication" actions={<StatusText status={reset.status} />}>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-green-600" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Google Authenticator is {me.totpEnabled ? "on" : "not set up"}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Got a new phone? Remove the authenticator here, then scan a new QR code at your next sign-in.
                            You&apos;ll be signed out everywhere.
                        </p>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <input
                                type="password"
                                autoComplete="current-password"
                                placeholder="Current password"
                                value={resetPassword}
                                onChange={(e) => setResetPassword(e.target.value)}
                                className={`${inputClass} sm:max-w-xs`}
                                aria-label="Current password"
                            />
                            <button
                                type="button"
                                onClick={resetAuthenticator}
                                disabled={!resetPassword || reset.pending}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                            >
                                Set up on a new phone
                            </button>
                        </div>
                    </div>
                </div>
            </EditorSection>
        </>
    )
}
