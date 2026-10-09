"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { EMAIL_PATTERN, NEWSLETTER_TOPICS as topics } from "@/lib/newsletter/shared";

export default function SubscribeForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState(""); // honeypot — stays empty for people
    const [selected, setSelected] = useState<string[]>(["Investigations"]);
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);
    // null = not subscribed yet; otherwise whether they need to confirm by email
    const [subscribed, setSubscribed] = useState<{ confirm: boolean } | null>(null);

    function toggleTopic(topic: string) {
        setSelected((current) =>
            current.includes(topic)
                ? current.filter((item) => item !== topic)
                : [...current, topic]
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!EMAIL_PATTERN.test(email.trim())) {
            setError("Enter a valid email address.");
            return;
        }

        if (selected.length === 0) {
            setError("Pick at least one topic.");
            return;
        }

        setError("");
        setPending(true);
        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, topics: selected, website }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
            setSubscribed({ confirm: Boolean(data.confirmationRequired) });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setPending(false);
        }
    }

    if (subscribed) {
        return (
            <div className="flex flex-col items-center border border-white/25 px-6 py-16 text-center">
                <span className="relative flex h-12 w-12 items-center justify-center">
                    <span className="absolute h-3 w-3 rounded-full bg-[#82CFFF] animate-pulse-dot" />
                    <span className="absolute h-3 w-3 rounded-full border-2 border-[#82CFFF] animate-ripple" />
                </span>
                <h3 className="mt-4 text-[32px] uppercase tracking-[-1px]">
                    {subscribed.confirm ? "Check your inbox" : "You're on the list"}
                </h3>
                <p className="mt-3 text-[16px] uppercase text-[#c9c9c9] md:w-[70%]">
                    {subscribed.confirm ? (
                        <>We sent a confirmation link to <span className="text-white">{email}</span>. Click it to start getting the newsletter — check spam if it isn&apos;t there in a minute.</>
                    ) : (
                        <>The next issue lands in <span className="text-white">{email}</span> soon.</>
                    )}
                </p>
                <button
                    type="button"
                    onClick={() => {
                        setSubscribed(null);
                        setEmail("");
                        setName("");
                    }}
                    className="mt-8 cursor-pointer text-[12px] uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-white"
                >
                    Subscribe another email
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="relative border border-white/25 p-6 md:p-10">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label htmlFor="newsletter-name" className="mb-2 block text-[16px] uppercase">Your Name</label>
                    <Input
                        id="newsletter-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Optional"
                        className="h-10 rounded-none border-[#919191]"
                    />
                </div>
                <div>
                    <label htmlFor="newsletter-email" className="mb-2 block text-[16px] uppercase">Your Email</label>
                    <Input
                        id="newsletter-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                        }}
                        placeholder="you@example.com"
                        className="h-10 rounded-none border-[#919191]"
                    />
                </div>
            </div>

            <div className="mt-8">
                <p className="mb-3 text-[16px] uppercase">What do you want to hear about?</p>
                <div className="flex flex-wrap gap-2">
                    {topics.map((topic) => {
                        const active = selected.includes(topic);
                        return (
                            <button
                                key={topic}
                                type="button"
                                onClick={() => {
                                    toggleTopic(topic);
                                    setError("");
                                }}
                                className={`cursor-pointer rounded-full border px-4 py-1 text-[12px] uppercase tracking-widest transition-colors ${active ? "border-white bg-white text-black" : "border-white/25 text-white/60 hover:border-white/50"}`}
                            >
                                {topic}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Honeypot: hidden from people, bots fill it in */}
            <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="newsletter-website">Website</label>
                <input
                    id="newsletter-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                />
            </div>

            {error && <p role="alert" className="mt-6 text-[14px] uppercase text-red-400">{error}</p>}

            <button
                type="submit"
                disabled={pending}
                className="mt-8 h-10 w-full cursor-pointer bg-[#82cfff] text-[16px] uppercase text-black transition-colors hover:bg-[#6b6b6b] hover:text-[#82cfff] disabled:cursor-wait disabled:opacity-60"
            >
                {pending ? "Subscribing…" : "Subscribe"}
            </button>

            <p className="mt-4 text-center text-[12px] uppercase tracking-widest text-white/40">
                One email a week. No spam. Unsubscribe anytime.
            </p>
        </form>
    );
}
