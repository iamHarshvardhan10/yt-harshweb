import Image from "next/image";
import Link from "next/link";

import { featuredVideos } from "@/app/utils/constant";
import AnimatedDotText from "@/components/common/AnimateDot";

export default function FeaturedVideos() {
    return (
        <div className="min-h-screen relative">
            <div className="flex flex-col items-center justify-center mt-30">
                <AnimatedDotText text="Featured Vidoes" className="mb-2" />
                <h2 className="uppercase text-4xl w-[30%] text-center">Explore the videos available on the site</h2>
            </div>

            <div className="px-49 py-15">
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">

                    {featuredVideos.map((video) => (
                        <Link
                            href={video.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={video.id}
                            className="group block"
                        >
                            <div className="mb-3 flex items-center justify-between mt-10">
                                <p className="text-[12px] uppercase tracking-[0.15em]">
                                    {video.id}
                                </p>

                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] text-[#82CFFF]">
                                        {video.duration}
                                    </span>

                                    <span className="text-[12px]">
                                        {video.publishedAt}
                                    </span>
                                </div>
                            </div>

                            <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                                <Image
                                    src={video.thumbnail}
                                    alt={video.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                />

                                {/* <div className="absolute bottom-3 left-3">
                                    <span className="bg-black/80 px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-white backdrop-blur-sm">
                                        {video.category}
                                    </span>
                                </div> */}

                                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                            </div>

                            <div className="mt-3">
                                <h3 className="text-[16px] font-medium leading-snug tracking-tight transition-colors duration-200 group-hover:text-neutral-500">
                                    {video.title}
                                </h3>

                                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                                    {video.description}
                                </p>
                            </div>
                        </Link>
                    ))}

                </div>
            </div>

        </div>
    )
}










// import Image from "next/image";
// import Link from "next/link";
// import { featuredVideos } from "@/data/featuredVideos";

// export default function FeaturedVideos() {
//     return (
//         <section className="px-6 py-12 sm:px-10 lg:px-20 lg:py-16">
//             <div className="mx-auto max-w-7xl">

//                 {/* Section Header */}
//                 <div className="mb-8 flex items-end justify-between">
//                     <div>
//                         <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
//                             Featured
//                         </p>

//                         <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
//                             Investigations & Explainers
//                         </h2>
//                     </div>

//                     <p className="hidden text-xs text-neutral-500 sm:block">
//                         {featuredVideos.length} videos
//                     </p>
//                 </div>

//                 {/* Video Grid */}
               
//             </div>
//         </section>
//     );
// }