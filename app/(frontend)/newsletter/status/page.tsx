import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Newsletter",
    robots: { index: false },
};

const messages = {
    confirmed: {
        title: "You're subscribed",
        text: "Thanks for confirming. The next issue lands in your inbox soon.",
    },
    invalid: {
        title: "This link doesn't work",
        text: "It may be old or copied incompletely. Sign up again and we'll send a fresh confirmation link.",
    },
} as const;

/** Landing page after the confirmation link (see /api/newsletter/confirm). */
export default async function NewsletterStatusPage({ searchParams }: PageProps<"/newsletter/status">) {
    const { state } = await searchParams;
    const message = state === "confirmed" ? messages.confirmed : messages.invalid;

    return (
        <section className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-6 pt-32 text-center text-white">
            <span className="relative flex h-12 w-12 items-center justify-center">
                <span className="absolute h-3 w-3 rounded-full bg-[#82CFFF] animate-pulse-dot" />
                <span className="absolute h-3 w-3 rounded-full border-2 border-[#82CFFF] animate-ripple" />
            </span>
            <h1 className="mt-4 text-4xl uppercase md:text-5xl">{message.title}</h1>
            <p className="mt-4 max-w-xl text-[16px] uppercase text-[#c9c9c9]">{message.text}</p>
            <Link
                href={state === "confirmed" ? "/investigations" : "/newsletter"}
                className="mt-10 rounded-full border border-white px-10 py-2 uppercase transition-colors hover:bg-white hover:text-black"
            >
                {state === "confirmed" ? "Read the latest investigations" : "Back to the newsletter"}
            </Link>
        </section>
    );
}
