import type { Metadata } from "next";
import Link from "next/link";

import AnimatedDotText from "@/components/common/AnimateDot";
import PageHero from "@/components/common/PageHero";
import About from "@/components/core/Home/About";
import Metrics from "@/components/core/Home/Metrics";

export const metadata: Metadata = {
    title: "About - Harsh Bhosale",
    description: "Who we are, why we investigate, and how we work.",
};

const process = [
    {
        id: "01",
        title: "Research",
        description: "We start with public records, budgets, reports and datasets before forming any conclusion.",
    },
    {
        id: "02",
        title: "Verify",
        description: "Every claim is checked against at least two independent sources before it makes the final cut.",
    },
    {
        id: "03",
        title: "Explain",
        description: "We turn complex systems into clear stories, and publish the full report so you can check our work.",
    },
];

export default function AboutPage() {
    return (
        <>
            <PageHero
                eyebrow="About Us"
                title={<>Look beyond <br /> the headline</>}
                description="We investigate the decisions, systems and consequences that shape the world around us, and make them understandable through research and visual storytelling."
            />

            <About />

            {/* HOW WE WORK */}
            <section className="bg-background px-6 py-25 text-white md:px-26.5">
                <AnimatedDotText text="How We Work" className="mb-4" />

                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-[44px] uppercase leading-[48.4px] tracking-[-2.2px] md:w-[60%]">
                        Research. Verify. Explain.
                    </h3>
                    <p className="text-[16px] uppercase leading-[22.4px] tracking-[-0.16px] text-[#c9c9c9] md:w-[30%]">
                        Every story follows the same process, from the first document to the final edit.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 border-t border-white/10 md:grid-cols-3">
                    {process.map((step) => (
                        <div key={step.id} className="border-b border-white/10 py-10 md:border-b-0 md:border-r md:px-8 md:last:border-r-0 md:first:pl-0">
                            <span className="text-[16px] uppercase text-[#82CFFF]">{step.id}</span>
                            <h4 className="mt-6 text-[32px] uppercase tracking-[-1px]">{step.title}</h4>
                            <p className="mt-4 text-[16px] uppercase leading-[22.4px] text-[#c9c9c9]">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Metrics />

            {/* CTA */}
            <section className="flex flex-col items-center bg-background px-6 py-30 text-center text-white">
                <AnimatedDotText text="Get Involved" className="mb-2" />
                <h2 className="text-4xl uppercase">Have a story we should look into?</h2>
                <p className="mt-3 text-[16px] text-[#c9c9c9] md:w-[40%]">
                    Send us a tip, a document or a question. Some of our best investigations started with a message from a viewer.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                    <Link href="/contact" className="rounded-full border border-white px-10 py-2 uppercase transition-colors hover:bg-white hover:text-black">
                        Contact Us
                    </Link>
                    <Link href="/investigations" className="rounded-full border border-white/25 px-10 py-2 uppercase text-white/70 transition-colors hover:border-white hover:text-white">
                        Investigations
                    </Link>
                </div>
            </section>
        </>
    );
}
