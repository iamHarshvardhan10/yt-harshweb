import Image from "next/image";

import AnimatedDotText from "@/components/common/AnimateDot";

interface PageHeroProps {
    eyebrow: string,
    title: React.ReactNode,
    description: string,
    image?: string,
}

export default function PageHero({ eyebrow, title, description, image = "/hero.webp" }: PageHeroProps) {
    return (
        <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-background px-6 pb-20 pt-40 text-white md:px-20 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-50 after:bg-linear-to-t after:from-black after:via-black/70 after:to-transparent after:content-['']">
            {/* A real <img> (not a CSS background) so the browser fetches the largest paint early */}
            <Image
                src={image}
                alt=""
                fill
                sizes="100vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/50" />

            <div className="relative z-10 w-full md:w-[60%]">
                <AnimatedDotText text={eyebrow} className="mb-4" textClassName="font-light text-sm" />
                <h1 className="mb-4 whitespace-pre-line text-4xl uppercase md:text-6xl">{title}</h1>
                <p className="text-[16px] uppercase text-gray-400 md:w-[80%]">{description}</p>
            </div>
        </section>
    )
}
