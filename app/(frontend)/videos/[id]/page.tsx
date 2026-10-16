import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicVideos } from "@/lib/videos/queries";
import { videoDate } from "@/lib/videos/shared";
import { getVideoDescription } from "@/lib/youtube";
import { bodyParagraphs } from "@/lib/newsletter/shared";
import { duration } from "@/lib/format";
import { getPublicSiteUrl } from "@/lib/settings";
import { breadcrumbSchema, metaDescription, pageMetadata, videoSchema } from "@/lib/seo";
import JsonLd from "@/components/common/JsonLd";
import YouTubeEmbed from "@/components/common/YouTubeEmbed";

/** A visible upload (hidden ones 404), plus the rest of the list for "More videos". */
async function getVideo(id: string) {
    const { videos, channelUrl } = await getPublicVideos();
    const video = videos.find((item) => item.id === id);
    return video ? { video, videos, channelUrl } : null;
}

// Watch page per upload, so the site itself can rank for its videos.
// Rendered on first visit; YouTube data refreshes every 10 minutes.
export function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }: PageProps<"/videos/[id]">): Promise<Metadata> {
    const found = await getVideo((await params).id);
    if (!found) return { title: "Video not found" };
    const { video } = found;

    return pageMetadata({
        title: video.title,
        description: metaDescription(video.description || `Watch "${video.title}" by Harshwardhan Bhosale.`),
        path: `/videos/${video.id}`,
        image: video.thumbnailHd,
    });
}

export default async function VideoPage({ params }: PageProps<"/videos/[id]">) {
    const { id } = await params;
    const found = await getVideo(id);
    if (!found) notFound();

    const { video, videos, channelUrl } = found;
    const [origin, fullDescription] = await Promise.all([getPublicSiteUrl(), getVideoDescription(video.id)]);

    const path = `/videos/${video.id}`;
    const isShort = video.type === "short";
    const thumbnail = video.thumbnailHd ?? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
    const paragraphs = bodyParagraphs(fullDescription ?? video.description);

    // Same format first (videos next to videos, Shorts next to Shorts)
    const more = videos.filter((item) => item.id !== video.id && item.type === video.type).slice(0, 3);

    return (
        <article className="bg-background px-6 pb-30 pt-32 text-white md:px-20 lg:px-49">
            <JsonLd
                data={[
                    videoSchema(origin, {
                        id: video.id,
                        name: video.title,
                        description: fullDescription ?? video.description,
                        thumbnail,
                        uploadDate: video.publishedAt,
                        durationSeconds: video.durationSeconds,
                        pagePath: path,
                    }),
                    breadcrumbSchema(origin, [
                        { name: "Home", path: "/" },
                        { name: "Videos", path: "/videos" },
                        { name: video.title, path },
                    ]),
                ]}
            />

            <nav aria-label="Breadcrumb">
                <Link href="/videos" className="text-[12px] uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-white">
                    ← All videos
                </Link>
            </nav>

            <header className="mt-8 max-w-4xl">
                <div className="flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.15em]">
                    <span>{video.category ?? (isShort ? "Short" : "Video")}</span>
                    <span className="text-[#82CFFF]">{duration(video.durationSeconds)}</span>
                    <time dateTime={video.publishedAt} className="text-white/40">{videoDate(video.publishedAt)}</time>
                </div>
                <h1 className="mt-4 text-3xl uppercase leading-tight md:text-5xl">{video.title}</h1>
            </header>

            <div className={`mt-10 ${isShort ? "" : "max-w-5xl"}`}>
                <YouTubeEmbed id={video.id} title={video.title} thumbnail={thumbnail} vertical={isShort} priority />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white px-6 py-2 text-[12px] uppercase transition-colors hover:bg-white hover:text-black"
                >
                    Watch on YouTube
                </a>
                {channelUrl && (
                    <a
                        href={`${channelUrl}?sub_confirmation=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-white/25 px-6 py-2 text-[12px] uppercase text-white/70 transition-colors hover:border-white hover:text-white"
                    >
                        Subscribe
                    </a>
                )}
            </div>

            {paragraphs.length > 0 && (
                <section className="mt-12 max-w-3xl">
                    <h2 className="text-[12px] uppercase tracking-[0.15em] text-white/40">About this video</h2>
                    <div className="mt-6">
                        {paragraphs.map((segments, index) => (
                            <p key={index} className="mb-6 whitespace-pre-line text-[16px] leading-[1.7] text-[#c9c9c9]">
                                {segments.map((segment, i) =>
                                    segment.href ? (
                                        // Description links are often sponsors — don't pass ranking to them
                                        <a key={i} href={segment.href} target="_blank" rel="nofollow noopener noreferrer" className="break-all text-[#82CFFF] underline underline-offset-4">
                                            {segment.text}
                                        </a>
                                    ) : (
                                        <span key={i}>{segment.text}</span>
                                    )
                                )}
                            </p>
                        ))}
                    </div>
                </section>
            )}

            {more.length > 0 && (
                <section className="mt-20 border-t border-white/10 pt-12">
                    <h2 className="text-3xl uppercase md:text-4xl">More {isShort ? "Shorts" : "videos"}</h2>

                    <div className={`grid gap-x-6 gap-y-10 pt-6 ${isShort ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                        {more.map((item) => (
                            <Link key={item.id} href={`/videos/${item.id}`} className="group block">
                                <div className={`relative mt-6 w-full overflow-hidden bg-neutral-900 ${isShort ? "aspect-9/16" : "aspect-video"}`}>
                                    {item.thumbnailHd && (
                                        <Image
                                            src={item.thumbnailHd}
                                            alt={item.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                        />
                                    )}
                                </div>
                                <h3 className="mt-3 text-[16px] font-medium leading-snug tracking-tight transition-colors duration-200 group-hover:text-neutral-500">
                                    {item.title}
                                </h3>
                                <p className="mt-1 text-[12px] uppercase text-white/40">{videoDate(item.publishedAt)}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </article>
    );
}
