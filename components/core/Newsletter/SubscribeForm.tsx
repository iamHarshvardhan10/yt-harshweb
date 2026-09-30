"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";

const topics = ["Investigations", "Explainers", "Climate", "Policy", "Behind the Scenes"];

export default function SubscribeForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [selected, setSelected] = useState<string[]>(["Investigations"]);
    const [error, setError] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    function toggleTopic(topic: string) {
        setSelected((current) =>
            current.includes(topic)
                ? current.filter((item) => item !== topic)
                : [...current, topic]
        );
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Enter a valid email address.");
            return;
        }

        if (selected.length === 0) {
            setError("Pick at least one topic.");
            return;
        }

        // TODO: send { name, email, topics: selected } to the subscribe API once it exists
        setError("");
        setSubscribed(true);
    }

    if (subscribed) {
        return (
            <div className="flex flex-col items-center border border-white/25 px-6 py-16 text-center">
                <span className="relative flex h-12 w-12 items-center justify-center">
                    <span className="absolute h-3 w-3 rounded-full bg-[#82CFFF] animate-pulse-dot" />
                    <span className="absolute h-3 w-3 rounded-full border-2 border-[#82CFFF] animate-ripple" />
                </span>
                <h3 className="mt-4 text-[32px] uppercase tracking-[-1px]">You&apos;re on the list</h3>
                <p className="mt-3 text-[16px] uppercase text-[#c9c9c9] md:w-[70%]">
                    Check <span className="text-white">{email}</span> to confirm your subscription. The next issue lands in your inbox soon.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        setSubscribed(false);
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
        <form onSubmit={handleSubmit} noValidate className="border border-white/25 p-6 md:p-10">
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

            {error && <p className="mt-6 text-[14px] uppercase text-red-400">{error}</p>}

            <button
                type="submit"
                className="mt-8 h-10 w-full cursor-pointer bg-[#82cfff] text-[16px] uppercase text-black transition-colors hover:bg-[#6b6b6b] hover:text-[#82cfff]"
            >
                Subscribe
            </button>

            <p className="mt-4 text-center text-[12px] uppercase tracking-widest text-white/40">
                One email a week. No spam. Unsubscribe anytime.
            </p>
        </form>
    );
}
