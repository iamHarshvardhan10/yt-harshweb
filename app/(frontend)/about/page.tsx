import type { Metadata } from "next";
import Link from "next/link";

import AnimatedDotText from "@/components/common/AnimateDot";
import PageHero from "@/components/common/PageHero";
import About from "@/components/core/Home/About";
import Metrics from "@/components/core/Home/Metrics";
import { getAboutPageData } from "@/lib/about/queries";
import { getHomePageData } from "@/lib/home/queries";

export const metadata: Metadata = {
    title: "About - Harsh Bhosale",
    description: "Who we are, why we investigate, and how we work.",
};

// Content is managed from /dashboard/about. The About highlights and Metrics
// blocks are shared with the home page and edited from /dashboard/home.

export default async function AboutPage() {
    const [{ page, steps }, home] = await Promise.all([getAboutPageData(), getHomePageData()]);

    return (
        <>
            <PageHero
                eyebrow={page.heroTag}
                title={page.heroTitle}
                description={page.heroDesc}
                image={page.heroImageUrl}
            />

            {page.showAbout && home.sections.ABOUT.isVisible && (
                <About section={home.sections.ABOUT} items={home.aboutItems} />
            )}

            {/* HOW WE WORK */}
            {page.processVisible && (
                <section className="bg-background px-6 py-25 text-white md:px-26.5">
                    <AnimatedDotText text={page.processTag} className="mb-4" />

                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <h3 className="text-[44px] uppercase leading-[48.4px] tracking-[-2.2px] md:w-[60%]">
                            {page.processTitle}
                        </h3>
                        <p className="text-[16px] uppercase leading-[22.4px] tracking-[-0.16px] text-[#c9c9c9] md:w-[30%]">
                            {page.processDesc}
                        </p>
                    </div>

                    {steps.length > 0 && (
                        <div className="mt-16 grid grid-cols-1 border-t border-white/10 md:grid-cols-3">
                            {steps.map((step, index) => (
                                <div key={step.id} className="border-b border-white/10 py-10 md:border-b-0 md:border-r md:px-8 md:last:border-r-0 md:first:pl-0">
                                    <span className="text-[16px] uppercase text-[#82CFFF]">{String(index + 1).padStart(2, "0")}</span>
                                    <h4 className="mt-6 text-[32px] uppercase tracking-[-1px]">{step.title}</h4>
                                    <p className="mt-4 text-[16px] uppercase leading-[22.4px] text-[#c9c9c9]">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {page.showMetrics && home.metrics.length > 0 && (
                <Metrics section={home.sections.METRICS} metrics={home.metrics} />
            )}

            {/* CTA */}
            {page.ctaVisible && (
                <section className="flex flex-col items-center bg-background px-6 py-30 text-center text-white">
                    <AnimatedDotText text={page.ctaTag} className="mb-2" />
                    <h2 className="text-4xl uppercase">{page.ctaTitle}</h2>
                    <p className="mt-3 text-[16px] text-[#c9c9c9] md:w-[40%]">
                        {page.ctaDesc}
                    </p>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link href={page.ctaBtn1Link} className="rounded-full border border-white px-10 py-2 uppercase transition-colors hover:bg-white hover:text-black">
                            {page.ctaBtn1}
                        </Link>
                        <Link href={page.ctaBtn2Link} className="rounded-full border border-white/25 px-10 py-2 uppercase text-white/70 transition-colors hover:border-white hover:text-white">
                            {page.ctaBtn2}
                        </Link>
                    </div>
                </section>
            )}
        </>
    );
}
