import AnimatedDotText from "@/components/common/AnimateDot";
import Link from "next/link";
import type { HomePageData } from "@/lib/home/queries";


export default function Hero({ hero }: { hero: HomePageData["hero"] }) {
    const showVideo = hero.backgroundType === "VIDEO" && hero.backgroundVideo;
    const backgroundImage = hero.backgroundImage?.secureUrl ?? "/hero.webp";

    return (
        <section className="bg-background text-white min-h-screen relative overflow-hidden px-20 bg-cover bg-center bg-no-repeat after:content-[''] after:absolute after:inset-x-10 after:bottom-0 after:right-0 after:h-50 after:bg-linear-to-t  after:from-black after:via-black/70 after:to-transparent after:pointer-events-none"
            style={showVideo ? undefined : { backgroundImage: `url('${backgroundImage}')` }}>

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

            <div className="absolute left-20 w-[50%] top-60">
                {hero.eyebrow && (
                    <AnimatedDotText text={hero.eyebrow} className="justify-center mb-4" textClassName="font-light uppercase text-center  text-sm" />
                )}
                <h1 className="text-6xl uppercase  text-center mb-4 whitespace-pre-line">{hero.headline}</h1>
                <p className="uppercase text-gray-400 text-center text-[16px]">{hero.description}</p>

                <div className="flex items-center justify-center gap-4 mt-10">
                    {hero.primaryButtonName && hero.primaryButtonUrl && (
                        <Link href={hero.primaryButtonUrl} className="glow-button px-10 py-2 border border-white rounded-full cursor-pointer">{hero.primaryButtonName}</Link>
                    )}
                    {hero.secondaryButtonName && hero.secondaryButtonUrl && (
                        <Link href={hero.secondaryButtonUrl} className="glow-button px-10 py-2 border border-white rounded-full cursor-pointer">{hero.secondaryButtonName}</Link>
                    )}
                </div>
            </div>
        </section>
    )
}
