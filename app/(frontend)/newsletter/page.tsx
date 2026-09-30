import type { Metadata } from "next";

import AnimatedDotText from "@/components/common/AnimateDot";
import PageHero from "@/components/common/PageHero";
import SubscribeForm from "@/components/core/Newsletter/SubscribeForm";

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

const recentIssues = [
    {
        id: "24",
        date: "2026-09-08",
        subject: "New investigation: The Truth Behind India's E20 Fuel",
        preview: "What the government roadmap doesn't tell you about your vehicle.",
    },
    {
        id: "23",
        date: "2026-09-03",
        subject: "Why Mumbai floods every monsoon, and who's responsible",
        preview: "A 1993 masterplan, a 25 mm/hr design limit, and 30 years of delays.",
    },
    {
        id: "22",
        date: "2026-08-27",
        subject: "Behind the scenes: how we research a story",
        preview: "Sources, verification and the documents we read so you don't have to.",
    },
];

const stats = [
    { value: "4.3K+", label: "Readers" },
    { value: "51%", label: "Open Rate" },
    { value: "Weekly", label: "Every Friday" },
];

export default function NewsletterPage() {
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
            <section className="bg-background px-6 pb-30 pt-20 text-white md:px-20 lg:px-49">
                <div className="flex flex-col items-center text-center">
                    <AnimatedDotText text="Recent Issues" className="mb-2" />
                    <h2 className="text-4xl uppercase">See what you&apos;ve been missing</h2>
                </div>

                <div className="mt-12 border-t border-white/10">
                    {recentIssues.map((issue) => (
                        <div
                            key={issue.id}
                            className="grid grid-cols-1 gap-4 border-b border-white/10 py-8 md:grid-cols-[100px_1fr_140px] md:items-center"
                        >
                            <span className="text-[44px] leading-none tracking-[-2.2px] text-white/30">#{issue.id}</span>
                            <div>
                                <h3 className="text-[20px] uppercase md:text-2xl">{issue.subject}</h3>
                                <p className="mt-2 text-[14px] text-[#c9c9c9]">{issue.preview}</p>
                            </div>
                            <span className="text-[12px] uppercase tracking-[0.15em] text-[#82CFFF] md:text-right">{issue.date}</span>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
