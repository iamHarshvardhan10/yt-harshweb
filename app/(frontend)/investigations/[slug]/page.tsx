import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedInvestigation, getRelatedInvestigations } from "@/lib/investigations/queries";
import { getPublicSiteUrl } from "@/lib/settings";
import { articleSchema, breadcrumbSchema, metaDescription, pageMetadata, videoSchema } from "@/lib/seo";
import JsonLd from "@/components/common/JsonLd";
import PageHero from "@/components/common/PageHero";
import InvestigationTabs from "@/components/core/Investigations/InvestigationTabs";
import { displayDate } from "@/components/core/Investigations/format";

// Pages are rendered on first visit, then cached until the dashboard changes an investigation
export function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }: PageProps<"/investigations/[slug]">): Promise<Metadata> {
    const investigation = await getPublishedInvestigation((await params).slug);
    if (!investigation) return { title: "Investigation not found" };

    return pageMetadata({
        title: investigation.metaTitle ?? investigation.title,
        description: metaDescription(investigation.metaDescription ?? investigation.summary),
        // ?tab=read and ?lang=hi are views of this same page
        path: `/investigations/${investigation.slug}`,
        image: investigation.video ? investigation.thumbnail : null,
        article: {
            publishedTime: investigation.publishedAt,
            modifiedTime: investigation.updatedAt,
            tags: investigation.tags,
        },
    });
}

export default async function InvestigationPage({ params }: PageProps<"/investigations/[slug]">) {
    const { slug } = await params;

    const investigation = await getPublishedInvestigation(slug);
    if (!investigation) notFound();

    const [origin, related] = await Promise.all([getPublicSiteUrl(), getRelatedInvestigations(investigation)]);
    const path = `/investigations/${investigation.slug}`;
    const { video } = investigation;

    return (
        <>
            <JsonLd
                data={[
                    articleSchema(origin, {
                        type: "NewsArticle",
                        path,
                        headline: investigation.title,
                        description: investigation.metaDescription ?? investigation.summary,
                        image: investigation.thumbnail,
                        datePublished: investigation.publishedAt,
                        dateModified: investigation.updatedAt,
                        section: investigation.category,
                        keywords: investigation.tags,
                    }),
                    ...(video
                        ? [videoSchema(origin, {
                            id: video.id,
                            name: video.title ?? investigation.title,
                            description: video.description ?? investigation.summary,
                            thumbnail: investigation.thumbnail,
                            uploadDate: video.uploadedAt ?? investigation.publishedAt ?? investigation.updatedAt,
                            durationSeconds: video.durationSeconds,
                            pagePath: path,
                        })]
                        : []),
                    breadcrumbSchema(origin, [
                        { name: "Home", path: "/" },
                        { name: "Investigations", path: "/investigations" },
                        { name: investigation.title, path },
                    ]),
                ]}
            />

            <PageHero
                eyebrow={investigation.category}
                title={investigation.title}
                description={investigation.summary}
                image={investigation.thumbnail}
            />

            <nav aria-label="Breadcrumb" className="bg-background px-6 pb-6 text-white md:px-20 lg:px-49">
                <Link href="/investigations" className="text-[12px] uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-white">
                    ← All investigations
                </Link>
            </nav>

            <InvestigationTabs investigation={investigation} />

            {/* RELATED — internal links help readers and crawlers find more reports */}
            {related.length > 0 && (
                <section className="bg-background px-6 pb-30 text-white md:px-20 lg:px-49">
                    <h2 className="border-t border-white/10 pt-12 text-3xl uppercase md:text-4xl">Related investigations</h2>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                        {related.map((item) => (
                            <Link key={item.slug} href={`/investigations/${item.slug}`} className="group block">
                                <div className="mb-3 mt-6 flex items-center justify-between text-[12px] uppercase tracking-[0.15em]">
                                    <span>{item.category}</span>
                                    {item.publishedAt && <span className="text-white/40">{displayDate(item.publishedAt)}</span>}
                                </div>
                                <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                                    <Image
                                        src={item.thumbnail}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                    />
                                </div>
                                <h3 className="mt-3 text-[16px] font-medium leading-snug tracking-tight transition-colors duration-200 group-hover:text-neutral-500">
                                    {item.title}
                                </h3>
                                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">{item.summary}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
