"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, KeyRound, Loader2, Lock, Smartphone } from "lucide-react"
import { safeNextPath } from "@/lib/auth/constants"

type Step = "checking" | "credentials" | "setup" | "verify"

type SetupData = { qrCode: string; secret: string; account: string; issuer: string }

async function post<T>(url: string, body?: object) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`)
    return data as T
}

const inputClass = `
    w-full
    rounded-lg
    border
    border-zinc-200
    bg-white
    px-3
    py-2.5
    text-sm
    outline-none
    focus:border-red-500
    focus:ring-2
    focus:ring-red-500/10
    dark:border-zinc-800
    dark:bg-zinc-900
`


export default function LoginPage() {
    return (
        <React.Suspense>
            <LoginFlow />
        </React.Suspense>
    )
}


function LoginFlow() {
    const next = safeNextPath(useSearchParams().get("next"))

    const [step, setStep] = React.useState<Step>("checking")
    const [setup, setSetup] = React.useState<SetupData | null>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [pending, setPending] = React.useState(false)

    // Already signed in? Skip the form.
    React.useEffect(() => {
        let ignore = false
        fetch("/api/auth/me").then((res) => {
            if (ignore) return
            if (res.ok) window.location.replace(next)
            else setStep("credentials")
        }, () => !ignore && setStep("credentials"))
        return () => {
            ignore = true
        }
    }, [next])

    async function submit(action: () => Promise<void>) {
        setPending(true)
        setError(null)
        try {
            await action()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setPending(false)
        }
    }

    function signIn(email: string, password: string) {
        return submit(async () => {
            const res = await post<{ next: "setup" | "verify" }>("/api/auth/login", { email, password })

            if (res.next === "setup") {
                const response = await fetch("/api/auth/2fa/setup")
                const data = await response.json()
                if (!response.ok) throw new Error(data.error ?? "Could not start authenticator setup")
                setSetup(data)
            }

            setStep(res.next)
        })
    }

    function verify(code: string) {
        return submit(async () => {
            await post("/api/auth/2fa/verify", { code })
            // Full navigation so proxy.ts sees the new session cookie
            window.location.replace(next)
        })
    }

    function restart() {
        setStep("credentials")
        setSetup(null)
        setError(null)
    }


    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">

                <div className="mb-8 text-center">
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                        Dashboard
                    </p>
                    <h1 className="mt-1 text-xl font-semibold">
                        {step === "setup" ? "Set up two-factor authentication" : step === "verify" ? "Two-factor authentication" : "Sign in"}
                    </h1>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">

                    {step === "checking" && (
                        <div className="flex justify-center py-8 text-zinc-400">
                            <Loader2 size={20} className="animate-spin" />
                        </div>
                    )}

                    {step === "credentials" && <CredentialsForm pending={pending} onSubmit={signIn} />}

                    {step === "setup" && setup && (
                        <div>
                            <ol className="space-y-1.5 text-xs leading-5 text-zinc-500">
                                <li>1. Open <strong className="text-zinc-700 dark:text-zinc-300">Google Authenticator</strong> on your phone.</li>
                                <li>2. Tap <strong className="text-zinc-700 dark:text-zinc-300">+</strong> and scan this QR code.</li>
                                <li>3. Enter the 6-digit code it shows.</li>
                            </ol>

                            <div className="my-5 flex justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={setup.qrCode}
                                    alt="QR code for Google Authenticator"
                                    width={180}
                                    height={180}
                                    className="rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800"
                                />
                            </div>

                            <details className="mb-5 text-xs text-zinc-500">
                                <summary className="cursor-pointer select-none">Can&apos;t scan? Enter the key manually</summary>
                                <p className="mt-2">Account: {setup.account}</p>
                                <code className="mt-1 block break-all rounded-md bg-zinc-100 px-2 py-1.5 font-mono text-[13px] tracking-wider text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                                    {setup.secret.match(/.{1,4}/g)?.join(" ")}
                                </code>
                            </details>

                            <CodeForm pending={pending} onSubmit={verify} submitLabel="Verify & finish setup" />
                        </div>
                    )}

                    {step === "verify" && (
                        <div>
                            <div className="mb-5 flex items-start gap-3 text-xs leading-5 text-zinc-500">
                                <Smartphone size={18} className="mt-0.5 shrink-0 text-red-500" />
                                Open Google Authenticator and enter the 6-digit code for this dashboard.
                            </div>

                            <CodeForm pending={pending} onSubmit={verify} submitLabel="Verify" />
                        </div>
                    )}

                    {error && (
                        <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">
                            {error}
                        </p>
                    )}

                    {(step === "setup" || step === "verify") && (
                        <button
                            type="button"
                            onClick={restart}
                            className="mt-5 inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                        >
                            <ArrowLeft size={13} />
                            Back to sign in
                        </button>
                    )}
                </div>

                <p className="mt-6 text-center text-[11px] text-zinc-400">
                    Lost access to your authenticator? Ask an admin to run <code>npm run admin reset-2fa</code>.
                </p>
            </div>
        </main>
    )
}


function CredentialsForm({
    pending,
    onSubmit,
}: {
    pending: boolean
    onSubmit: (email: string, password: string) => void
}) {
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")

    return (
        <form
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit(email, password)
            }}
        >
            <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                />
            </div>

            <SubmitButton pending={pending} icon={<Lock size={15} />}>
                Continue
            </SubmitButton>
        </form>
    )
}


function CodeForm({
    pending,
    onSubmit,
    submitLabel,
}: {
    pending: boolean
    onSubmit: (code: string) => void
    submitLabel: string
}) {
    const [code, setCode] = React.useState("")

    function change(value: string) {
        const digits = value.replace(/\D/g, "").slice(0, 6)
        setCode(digits)
        // Submit as soon as the 6th digit is typed or pasted
        if (digits.length === 6 && !pending) onSubmit(digits)
    }

    return (
        <form
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit(code)
            }}
        >
            <input
                aria-label="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                placeholder="000000"
                value={code}
                onChange={(e) => change(e.target.value)}
                className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em]`}
            />

            <SubmitButton pending={pending} disabled={code.length !== 6} icon={<KeyRound size={15} />}>
                {submitLabel}
            </SubmitButton>
        </form>
    )
}


function SubmitButton({
    pending,
    disabled,
    icon,
    children,
}: {
    pending: boolean
    disabled?: boolean
    icon: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <button
            type="submit"
            disabled={pending || disabled}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
        >
            {pending ? <Loader2 size={15} className="animate-spin" /> : icon}
            {children}
        </button>
    )
}
