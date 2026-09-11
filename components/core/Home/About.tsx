import AnimatedDotText from "@/components/common/AnimateDot"
import Image from "next/image"

export default function About() {
    return (
        <div className="flex items-center justify-center flex-col text-center py-20 bg-background">
            <AnimatedDotText text="About Us" />
            <h3 className="text-[44px] uppercase">About the Videos</h3>
            <p className="w-[40%] uppercase text-[#c9c9c9]">A history podcast that explores the people, events, and moments that shaped the world we know today.</p>


            <div className="relative mx-auto w-full max-w-[1400px] h-[1000px]">

                {/* CENTER IMAGE */}
                <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2">
                    <Image
                        src="/about.webp"
                        alt="About Us"
                        width={528}
                        height={840}
                        className="w-[528px] h-[720px] object-cover"
                    />
                </div>


                {/* TOP LEFT */}
                <div className="absolute top-[130px] left-[160px] w-[300px]">
                    <div className="flex flex-col items-center text-center">

                        <h4 className="text-[44px] leading-[48.4px] tracking-[-2.2px] uppercase">
                            Historic Stories
                        </h4>

                        <span className="text-[44px] leading-none tracking-[-2.2px]">
                            01
                        </span>

                        <p className="mt-4 text-[16px] leading-[22.4px] tracking-[-0.16px] uppercase">
                            Explore the events, people, and moments that helped shape
                            the world we know today.
                        </p>

                    </div>
                </div>


                {/* TOP RIGHT */}
                <div className="absolute top-[130px] right-[160px] w-[300px]">
                    <div className="flex flex-col items-center text-center">

                        <h4 className="text-[44px] leading-[48.4px] tracking-[-2.2px] uppercase">
                            Historic Stories
                        </h4>

                        <span className="text-[44px] leading-none tracking-[-2.2px]">
                            02
                        </span>

                        <p className="mt-4 text-[16px] leading-[22.4px] tracking-[-0.16px] uppercase">
                            Explore the events, people, and moments that helped shape
                            the world we know today.
                        </p>

                    </div>
                </div>


                {/* BOTTOM LEFT */}
                <div className="absolute bottom-[260px] left-[120px] w-[300px]">
                    <div className="flex flex-col items-center text-center">

                        <h4 className="text-[44px] leading-[48.4px] tracking-[-2.2px] uppercase">
                            Historic Stories
                        </h4>

                        <span className="text-[44px] leading-none tracking-[-2.2px]">
                            03
                        </span>

                        <p className="mt-4 text-[16px] leading-[22.4px] tracking-[-0.16px] uppercase">
                            Explore the events, people, and moments that helped shape
                            the world we know today.
                        </p>

                    </div>
                </div>


                {/* BOTTOM RIGHT */}
                <div className="absolute bottom-[260px] right-[120px] w-[300px]">
                    <div className="flex flex-col items-center text-center">

                        <h4 className="text-[44px] leading-[48.4px] tracking-[-2.2px] uppercase">
                            Historic Stories
                        </h4>

                        <span className="text-[44px] leading-none tracking-[-2.2px]">
                            04
                        </span>

                        <p className="mt-4 text-[16px] leading-[22.4px] tracking-[-0.16px] uppercase">
                            Explore the events, people, and moments that helped shape
                            the world we know today.
                        </p>

                    </div>
                </div>

            </div>


        </div>
    )
}