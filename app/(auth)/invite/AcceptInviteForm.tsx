"use client"

import * as React from "react"
import { Loader2, Lock } from "lucide-react"

const inputClass =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-zinc-800 dark:bg-zinc-900"

export default function AcceptInviteForm({ token, email, minLength }: { token: string; email: string; minLength: number }) {
    const [password, setPassword] = React.useState("")
    const [confirm, setConfirm] = React.useState("")
    const [error, setError] = React.useState<string | null>(null)
    const [pending, setPending] = React.useState(false)

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        if (password.length < minLength) return setError(`Use at least ${minLength} characters`)
        if (password !== confirm) return setError("The passwords don't match")

        setPending(true)
        setError(null)
        try {
            const res = await fetch("/api/auth/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.error ?? "Something went wrong")
            window.location.replace(`/login?email=${encodeURIComponent(email)}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
            setPending(false)
        }
    }

    return (
        <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Lets password managers save the login under the right email */}
            <input type="email" value={email} autoComplete="username" readOnly hidden />

            <div className="space-y-2">
                <label htmlFor="invite-password" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">New password</label>
                <input id="invite-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-2">
                <label htmlFor="invite-confirm" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Confirm password</label>
                <input id="invite-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
            </div>

            {error && <p role="alert" className="text-xs text-red-500">{error}</p>}

            <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
                {pending ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                Set password
            </button>
            <p className="text-center text-[11px] text-zinc-500">At least {minLength} characters.</p>
        </form>
    )
}
