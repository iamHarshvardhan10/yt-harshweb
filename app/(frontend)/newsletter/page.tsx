import type { Metadata } from "next";
import Link from "next/link";

import AnimatedDotText from "@/components/common/AnimateDot";
import PageHero from "@/components/common/PageHero";
import SubscribeForm from "@/components/core/Newsletter/SubscribeForm";
import { getActiveSubscriberCount, getPublishedIssues, issueNumbers } from "@/lib/newsletter/queries";
import { excerpt } from "@/lib/newsletter/shared";
import { compact } from "@/lib/format";

export const metadata: Metadata = {
    title: "Newsletter - Harsh Bhosale",
    description: "The story behind the story, delivered to your inbox every week.",
};

const benefits = [
    {
        id: "01",
        title: "New Investigations",
        description: "Be the first to know when a new video or research report goes live.",
    },
    {
        id: "02",
        title: "Behind the Scenes",
        description: "The documents, dead ends and decisions that didn't make the final cut.",
    },
    {
        id: "03",
        title: "Sources & Reading",
        description: "The reports and datasets we used, so you can dig deeper yourself.",
    },
];

const issueDate = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

// Below this the reader count reads as a weakness rather than social proof
const SHOW_READERS_FROM = 50;

// Content comes from /dashboard/newsletter

export default async function NewsletterPage() {
    const [readers, recentIssues, numbers] = await Promise.all([
        getActiveSubscriberCount(),
        getPublishedIssues(5),
        issueNumbers(),
    ]);

    const stats = [
        readers >= SHOW_READERS_FROM ? { value: `${compact(readers)}+`, label: "Readers" } : null,
        numbers.size > 0 ? { value: String(numbers.size), label: "Issues sent" } : null,
        { value: "Weekly", label: "Every Friday" },
        { value: "Free", label: "Unsubscribe anytime" },
    ].filter((stat) => stat !== null).slice(0, 3);

    return (
        <>
            <PageHero
                eyebrow="Newsletter"
                title={<>The story behind <br /> the story</>}
                description="Get new investigations, behind-the-scenes research and the sources we use, delivered to your inbox every week."
            />

            {/* SUBSCRIBE */}
            <section className="bg-background px-6 py-20 text-white md:px-20 lg:px-49">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
                    <div>
                        <AnimatedDotText text="Subscribe" className="mb-4" />
                        <h2 className="text-[44px] uppercase leading-[48.4px] tracking-[-2.2px]">
                            Join the readers who look closer.
                        </h2>
                        <p className="mt-4 text-[16px] uppercase leading-[22.4px] text-[#c9c9c9]">
                            No noise, no daily spam. Just one well-researched email every Friday.
                        </p>

                        <div className="mt-10 grid grid-cols-3 border-t border-white/10 pt-8">
                            {stats.map((stat) => (
                                <div key={stat.label}>
                                    <p className="text-[32px] leading-none">{stat.value}</p>
                                    <p className="mt-2 text-[12px] uppercase tracking-[0.15em] text-[#82CFFF]">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <SubscribeForm />
                </div>
            </section>

            {/* WHAT YOU GET */}
            <section className="bg-background px-6 py-20 text-white md:px-26.5">
                <AnimatedDotText text="What You Get" className="mb-4" />
                <h3 className="text-[44px] uppercase leading-[48.4px] tracking-[-2.2px] md:w-[60%]">
                    Every issue, three things.
                </h3>

                <div className="mt-16 grid grid-cols-1 border-t border-white/10 md:grid-cols-3">
                    {benefits.map((item) => (
                        <div key={item.id} className="border-b border-white/10 py-10 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
                            <span className="text-[16px] uppercase text-[#82CFFF]">{item.id}</span>
                            <h4 className="mt-6 text-[32px] uppercase tracking-[-1px]">{item.title}</h4>
                            <p className="mt-4 text-[16px] uppercase leading-[22.4px] text-[#c9c9c9]">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* RECENT ISSUES */}
            {recentIssues.length > 0 && (
                <section className="bg-background px-6 pb-30 pt-20 text-white md:px-20 lg:px-49">
                    <div className="flex flex-col items-center text-center">
                        <AnimatedDotText text="Recent Issues" className="mb-2" />
                        <h2 className="text-4xl uppercase">See what you&apos;ve been missing</h2>
                    </div>

                    <div className="mt-12 border-t border-white/10">
                        {recentIssues.map((issue) => (
                            <Link
                                key={issue.id}
                                href={`/newsletter/issues/${issue.id}`}
                                className="group grid grid-cols-1 gap-4 border-b border-white/10 py-8 md:grid-cols-[100px_1fr_140px] md:items-center"
                            >
                                <span className="text-[44px] leading-none tracking-[-2.2px] text-white/30">#{numbers.get(issue.id)}</span>
                                <div>
                                    <h3 className="text-[20px] uppercase transition-colors group-hover:text-neutral-500 md:text-2xl">{issue.subject}</h3>
                                    <p className="mt-2 text-[14px] text-[#c9c9c9]">{issue.preview || excerpt(issue.body)}</p>
                                </div>
                                <span className="text-[12px] uppercase tracking-[0.15em] text-[#82CFFF] md:text-right">
                                    {issue.sentAt && issueDate.format(issue.sentAt)}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
