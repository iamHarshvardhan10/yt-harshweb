import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedInvestigation } from "@/lib/investigations/queries";
import PageHero from "@/components/common/PageHero";
import InvestigationTabs from "@/components/core/Investigations/InvestigationTabs";

// Pages are rendered on first visit, then cached until the dashboard changes an investigation
export function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }: PageProps<"/investigations/[slug]">): Promise<Metadata> {
    const investigation = await getPublishedInvestigation((await params).slug);
    if (!investigation) return { title: "Investigation not found" };

    return {
        title: `${investigation.metaTitle ?? investigation.title} - Harsh Bhosale`,
        description: investigation.metaDescription ?? investigation.summary,
        openGraph: { images: investigation.video ? [investigation.thumbnail] : undefined },
    };
}

export default async function InvestigationPage({ params, searchParams }: PageProps<"/investigations/[slug]">) {
    const { slug } = await params;
    const { tab, lang } = await searchParams;

    const investigation = await getPublishedInvestigation(slug);
    if (!investigation) notFound();

    // Open on the report when there's no video to watch
    const initialTab = tab === "read" || !investigation.video ? "read" : "watch";

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
                initialTab={initialTab}
                initialLanguage={lang === "hi" ? "HI" : "EN"}
            />
        </>
    );
}
