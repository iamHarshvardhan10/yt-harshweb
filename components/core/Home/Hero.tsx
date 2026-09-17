import AnimatedDotText from "@/components/common/AnimateDot";
import Link from "next/link";

interface MediaRecord {
    id: string,
    secureUrl: string,
    resourceType: "IMAGE" | "VIDEO"
}

interface HomeHeroMediaRecord {
    role: 'BACKGROUND_IMAGE' | 'BACKGROUND_VIDEO';
    media: MediaRecord
}

interface HomeHeroRecord {
    id: string;
    headline: string;
    description: string;
    primaryButtonName: string | null;
    primaryButtonUrl: string | null;
    secondaryButtonName: string | null;
    secondaryButtonUrl: string | null;
    backgroundType: "IMAGE" | "VIDEO";
    darkOverlay: boolean;
    media: HomeHeroMediaRecord[];
}

function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    return "http://localhost:3000";

}

async function getHero(): Promise<HomeHeroRecord | null> {
    try {
        const res = await fetch(`${getBaseUrl()}/api/hero`, {
            next: { revalidate: 60 },
        });

        if (!res.ok) return null;

        const data = await res.json();
        // console.log(data)
        return data.heroes?.[0] ?? null;
    } catch (err) {
        console.error("Failed to fetch hero:", err);
        return null;
    }

}


export default async function Hero() {
    const hero = await getHero()

    const headlineWords: string[] = hero?.headline.split(" ") ?? [];
    const firstLine = headlineWords.slice(0, 2).join(" ");
    const secondLine = headlineWords.slice(2).join(" ");

    // console.log(hero)

    return (
        <section className="bg-background text-white min-h-screen relative  px-20 bg-cover bg-center bg-no-repeat after:content-[''] after:absolute after:inset-x-10 after:bottom-0 after:right-0 after:h-50 after:bg-linear-to-t  after:from-black after:via-black/70 after:to-transparent after:pointer-events-none"
            style={{ backgroundImage: "url('/hero.webp')" }}>
            <div className="absolute left-20 w-[50%] top-60">
                <AnimatedDotText text="New Videos" className="justify-center mb-4" textClassName="font-light uppercase text-center  text-sm" />
                {/* <p className="font-light uppercase text-center mb-4 text-sm">New Videos</p> */}
                {/* <h1 className="text-6xl uppercase  text-center mb-4">{hero?.headline}</h1> */}

                <h1 className="text-6xl uppercase text-center mb-4">
                    {firstLine}
                    {secondLine && (
                        <>
                            <br />
                            {secondLine}
                        </>
                    )}
                </h1>
                <p className="uppercase text-gray-400 text-center text-[16px]">{hero?.description}</p>

                <div className="flex items-center justify-center gap-4 mt-10">
                    <button className="glow-button px-10 py-2 border border-white rounded-full cursor-pointer"><Link href={`${hero?.primaryButtonUrl}`}>{hero?.primaryButtonName}</Link></button>
                    <button className="glow-button px-10 py-2 border border-white rounded-full cursor-pointer"><Link href={`${hero?.secondaryButtonUrl}`}>{hero?.secondaryButtonName}</Link></button>
                </div>
            </div>
        </section>
    )
}