import AnimatedDotText from "@/components/common/AnimateDot";

interface PageHeroProps {
    eyebrow: string,
    title: React.ReactNode,
    description: string,
    image?: string,
}

export default function PageHero({ eyebrow, title, description, image = "/hero.webp" }: PageHeroProps) {
    return (
        <section
            className="relative flex min-h-[70vh] items-end bg-background bg-cover bg-center bg-no-repeat px-6 pb-20 pt-40 text-white md:px-20 before:absolute before:inset-0 before:bg-black/50 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-50 after:bg-linear-to-t after:from-black after:via-black/70 after:to-transparent after:content-['']"
            style={{ backgroundImage: `url('${image}')` }}
        >
            <div className="relative z-10 w-full md:w-[60%]">
                <AnimatedDotText text={eyebrow} className="mb-4" textClassName="font-light text-sm" />
                <h1 className="mb-4 whitespace-pre-line text-4xl uppercase md:text-6xl">{title}</h1>
                <p className="text-[16px] uppercase text-gray-400 md:w-[80%]">{description}</p>
            </div>
        </section>
    )
}
