import Image from "next/image";
import Link from "next/link";

import AnimatedDotText from "@/components/common/AnimateDot";
import type { HomeSectionData } from "@/lib/home/queries";
import { duration } from "@/lib/format";
import { videoDate, type PublicVideo } from "@/lib/videos/shared";

// Header copy comes from the DB; the videos from the YouTube API, picked in /dashboard/videos.
export default function FeaturedVideos({ section, videos }: { section: HomeSectionData; videos: PublicVideo[] }) {
    return (
        <div className="min-h-screen relative bg-background text-white">
            <div className="flex flex-col items-center justify-center mt-20 px-6 md:mt-30">
                {section.eyebrow && <AnimatedDotText text={section.eyebrow} className="mb-2" />}
                <h2 className="uppercase text-3xl md:text-4xl w-full md:w-[60%] lg:w-[30%] text-center">{section.title}</h2>
                {section.description && (
                    <p className="text-[16px] text-[#c9c9c9] w-full md:w-[70%] lg:w-[40%] text-center mt-3">{section.description}</p>
                )}
            </div>

            <div className="px-6 py-15 md:px-20 lg:px-49">
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">

                    {videos.map((video, index) => (
                        <Link
                            href={`/videos/${video.id}`}
                            key={video.id}
                            className="group block"
                        >
                            <div className="mb-3 flex items-center justify-between mt-10">
                                <p className="text-[12px] uppercase tracking-[0.15em]">
                                    {video.category ?? String(index + 1).padStart(2, "0")}
                                </p>

                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] text-[#82CFFF]">
                                        {duration(video.durationSeconds)}
                                    </span>

                                    <span className="text-[12px]">
                                        {videoDate(video.publishedAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                                {video.thumbnailHd && (
                                    <Image
                                        src={video.thumbnailHd}
                                        alt={video.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                    />
                                )}

                                {video.featured && (
                                    <div className="absolute bottom-3 left-3">
                                        <span className="bg-black/80 px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-white backdrop-blur-sm">
                                            Featured
                                        </span>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                            </div>

                            <div className="mt-3">
                                <h3 className="text-[16px] font-medium leading-snug tracking-tight transition-colors duration-200 group-hover:text-neutral-500">
                                    {video.title}
                                </h3>

                                {video.description && (
                                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                                        {video.description}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}

                </div>

                <div className="mt-16 flex justify-center">
                    <Link href="/videos" className="glow-button px-10 py-2 border border-white rounded-full uppercase text-[14px]">
                        View all videos
                    </Link>
                </div>
            </div>

        </div>
    )
}
