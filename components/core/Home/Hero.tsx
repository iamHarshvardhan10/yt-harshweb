import AnimatedDotText from "@/components/common/AnimateDot";
import Link from "next/link";


export default function Hero() {
    return (
        <section className="bg-background min-h-screen relative  px-20 bg-cover bg-center bg-no-repeat after:content-[''] after:absolute after:inset-x-10 after:bottom-0 after:right-0 after:h-50 after:bg-linear-to-t  after:from-black after:via-black/70 after:to-transparent after:pointer-events-none"
            style={{ backgroundImage: "url('/hero.webp')" }}>
            <div className="absolute left-20 w-[50%] top-60">
                <AnimatedDotText text="New Videos" className="justify-center mb-4" textClassName="font-light uppercase text-center  text-sm" />
                {/* <p className="font-light uppercase text-center mb-4 text-sm">New Videos</p> */}
                <h1 className="text-6xl uppercase  text-center mb-4">Stories that <br /> deserve   a closer look</h1>
                <p className="uppercase text-gray-400 text-center text-[16px]">Behind every issue is a story of decisions, systems, and consequences. We follow the evidence to understand what happened beneath the surface.</p>

                <div className="flex items-center justify-center gap-4 mt-10">
                    <button className="glow-button px-10 py-2 border border-white rounded-full cursor-pointer"><Link href={'/'}>Vidoes</Link></button>
                    <button className="glow-button px-10 py-2 border border-white rounded-full cursor-pointer"><Link href={'/'}>Contact Us</Link></button>
                </div>
            </div>
        </section>
    )
}