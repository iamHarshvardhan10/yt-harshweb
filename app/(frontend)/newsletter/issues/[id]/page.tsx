import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { issueNumbers } from "@/lib/newsletter/queries";
import { bodyParagraphs, excerpt } from "@/lib/newsletter/shared";
import { getPublicSiteUrl } from "@/lib/settings";
import { articleSchema, breadcrumbSchema, DEFAULT_OG_IMAGE, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/common/JsonLd";

// Cached per request — metadata and page share one query
const getIssue = cache((id: string) =>
    prisma.campaign.findFirst({ where: { id, status: "SENT", showOnWebsite: true } }));

const issueDate = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

// Rendered on first visit, then cached until the dashboard changes a campaign
export function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }: PageProps<"/newsletter/issues/[id]">): Promise<Metadata> {
    const issue = await getIssue((await params).id);
    if (!issue) return { title: "Issue not found" };
    return pageMetadata({
        title: issue.subject,
        description: issue.preview || excerpt(issue.body, 155),
        path: `/newsletter/issues/${issue.id}`,
        article: { publishedTime: issue.sentAt?.toISOString(), modifiedTime: issue.updatedAt.toISOString() },
    });
}

/** Web version of a sent newsletter ("View in browser"). */
export default async function NewsletterIssuePage({ params }: PageProps<"/newsletter/issues/[id]">) {
    const { id } = await params;
    const [issue, numbers, origin] = await Promise.all([getIssue(id), issueNumbers(), getPublicSiteUrl()]);
    if (!issue) notFound();

    const path = `/newsletter/issues/${issue.id}`;

    return (
        <article className="bg-background px-6 pb-30 pt-40 text-white md:px-20 lg:px-49">
            <JsonLd
                data={[
                    articleSchema(origin, {
                        path,
                        headline: issue.subject,
                        description: issue.preview || excerpt(issue.body, 155),
                        image: DEFAULT_OG_IMAGE.url,
                        datePublished: issue.sentAt?.toISOString(),
                        dateModified: issue.updatedAt.toISOString(),
                        section: "Newsletter",
                    }),
                    breadcrumbSchema(origin, [
                        { name: "Home", path: "/" },
                        { name: "Newsletter", path: "/newsletter" },
                        { name: issue.subject, path },
                    ]),
                ]}
            />

            <Link href="/newsletter" className="text-[12px] uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-white">
                ← Newsletter
            </Link>

            <div className="mt-10 max-w-3xl">
                <p className="text-[12px] uppercase tracking-[0.15em] text-[#82CFFF]">
                    Issue #{numbers.get(issue.id)}
                    {issue.sentAt && ` · ${issueDate.format(issue.sentAt)}`}
                </p>
                <h1 className="mt-4 text-4xl uppercase leading-tight md:text-5xl">{issue.subject}</h1>

                <div className="mt-10">
                    {bodyParagraphs(issue.body).map((segments, index) => (
                        <p key={index} className="mb-6 whitespace-pre-line text-[18px] leading-[1.7] text-[#c9c9c9]">
                            {segments.map((segment, i) =>
                                segment.href ? (
                                    <a key={i} href={segment.href} target="_blank" rel="noopener noreferrer" className="break-all text-[#82CFFF] underline underline-offset-4">
                                        {segment.text}
                                    </a>
                                ) : (
                                    <span key={i}>{segment.text}</span>
                                )
                            )}
                        </p>
                    ))}
                </div>

                <div className="mt-12 border border-white/25 p-6">
                    <p className="text-[12px] uppercase tracking-[0.15em] text-[#82CFFF]">Like this?</p>
                    <p className="mt-2 text-[16px] uppercase">Get the next issue in your inbox.</p>
                    <Link
                        href="/newsletter"
                        className="mt-6 inline-block w-full bg-[#82cfff] py-2.5 text-center text-[16px] uppercase text-black transition-colors hover:bg-[#6b6b6b] hover:text-[#82cfff]"
                    >
                        Subscribe
                    </Link>
                </div>
            </div>
        </article>
    );
}
