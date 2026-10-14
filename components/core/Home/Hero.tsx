import AnimatedDotText from "@/components/common/AnimateDot";
import Image from "next/image";
import Link from "next/link";
import type { HomePageData } from "@/lib/home/queries";


export default function Hero({ hero }: { hero: HomePageData["hero"] }) {
    const showVideo = hero.backgroundType === "VIDEO" && hero.backgroundVideo;
    const backgroundImage = hero.backgroundImage?.secureUrl ?? "/hero.webp";

    return (
        <section className="bg-background text-white min-h-svh relative overflow-hidden flex items-center px-6 pt-24 pb-20 md:px-20 lg:items-start lg:pt-60 after:content-[''] after:absolute after:inset-x-10 after:bottom-0 after:right-0 after:h-50 after:bg-linear-to-t  after:from-black after:via-black/70 after:to-transparent after:pointer-events-none">

            {/* A real <img> (not a CSS background) so the browser fetches the largest paint early */}
            {!showVideo && (
                <Image
                    src={backgroundImage}
                    alt=""
                    fill
                    sizes="100vw"
                    loading="eager"
                    fetchPriority="high"
                    className="object-cover object-center"
                />
            )}

            {showVideo && (
                <video
                    src={hero.backgroundVideo!.secureUrl}
                    poster={hero.backgroundImage?.secureUrl}
                    autoPlay={hero.autoplay}
                    loop={hero.loop}
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                />
            )}

            {hero.darkOverlay && (
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: hero.overlayOpacity / 100 }}
                />
            )}

            <div className="relative z-10 w-full md:mx-auto md:w-[80%] lg:mx-0 lg:w-[50%]">
                {hero.eyebrow && (
                    <AnimatedDotText text={hero.eyebrow} className="justify-center mb-4" textClassName="font-light uppercase text-center  text-sm" />
                )}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl uppercase text-center mb-4 whitespace-pre-line wrap-break-word">{hero.headline}</h1>
                <p className="uppercase text-gray-400 text-center text-[14px] sm:text-[16px]">{hero.description}</p>

                <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                    {hero.primaryButtonName && hero.primaryButtonUrl && (
                        <Link href={hero.primaryButtonUrl} className="glow-button px-8 sm:px-10 py-2 border border-white rounded-full cursor-pointer text-center">{hero.primaryButtonName}</Link>
                    )}
                    {hero.secondaryButtonName && hero.secondaryButtonUrl && (
                        <Link href={hero.secondaryButtonUrl} className="glow-button px-8 sm:px-10 py-2 border border-white rounded-full cursor-pointer text-center">{hero.secondaryButtonName}</Link>
                    )}
                </div>
            </div>
        </section>
    )
}
