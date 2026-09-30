import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { investigations } from "@/app/utils/constant";
import PageHero from "@/components/common/PageHero";
import InvestigationTabs from "@/components/core/Investigations/InvestigationTabs";

export function generateStaticParams() {
    return investigations.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps<"/investigations/[slug]">): Promise<Metadata> {
    const { slug } = await params;
    const investigation = investigations.find((item) => item.slug === slug);

    return {
        title: investigation ? `${investigation.title} - Harsh Bhosale` : "Investigation not found",
        description: investigation?.summary,
    };
}

export default async function InvestigationPage({ params, searchParams }: PageProps<"/investigations/[slug]">) {
    const { slug } = await params;
    const { tab } = await searchParams;

    const investigation = investigations.find((item) => item.slug === slug);

    if (!investigation) notFound();

    return (
        <>
            <PageHero
                eyebrow={investigation.category}
                title={investigation.title}
                description={investigation.summary}
                image={investigation.thumbnail}
            />

            <div className="bg-background px-6 pb-6 text-white md:px-20 lg:px-49">
                <Link href="/investigations" className="text-[12px] uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-white">
                    ← All investigations
                </Link>
            </div>

            <InvestigationTabs
                investigation={investigation}
                initialTab={tab === "read" ? "read" : "watch"}
            />
        </>
    );
}
