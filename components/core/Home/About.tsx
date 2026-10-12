import AnimatedDotText from "@/components/common/AnimateDot"
import Image from "next/image"
import type { HomeAboutItem } from "@prisma/client"
import type { HomeSectionData } from "@/lib/home/queries"

// Four fixed slots around the centre image (xl and up): top-left, top-right, bottom-left, bottom-right.
// Below xl the items stack under the image instead.
const slots = [
    "xl:top-[130px] xl:left-[40px] 2xl:left-[160px]",
    "xl:top-[130px] xl:right-[40px] 2xl:right-[160px]",
    "xl:bottom-[260px] xl:left-[40px] 2xl:left-[120px]",
    "xl:bottom-[260px] xl:right-[40px] 2xl:right-[120px]",
]

export default function About({
    section,
    items,
}: {
    section: HomeSectionData
    items: HomeAboutItem[]
}) {
    return (
        <div className="flex items-center justify-center flex-col text-center py-20 bg-background text-white">
            {section.eyebrow && <AnimatedDotText text={section.eyebrow} />}
            <h3 className="px-6 text-[32px] md:text-[44px] uppercase">{section.title}</h3>
            {section.description && (
                <p className="w-full px-6 md:w-[70%] lg:w-[40%] uppercase text-[#c9c9c9]">{section.description}</p>
            )}


            <div className="relative mx-auto mt-12 flex w-full max-w-[1400px] flex-col items-center gap-12 px-6 xl:mt-0 xl:block xl:h-[1000px] xl:px-0">

                {/* CENTER IMAGE */}
                <div className="w-full max-w-[528px] xl:absolute xl:left-1/2 xl:top-[40%] xl:w-auto xl:max-w-none xl:-translate-x-1/2 xl:-translate-y-1/2">
                    <Image
                        src={section.image?.secureUrl ?? "/about.webp"}
                        alt={section.title}
                        width={528}
                        height={840}
                        sizes="(max-width: 600px) 100vw, 528px"
                        className="aspect-[528/720] w-full h-auto object-cover xl:w-[528px] xl:h-[720px]"
                    />
                </div>


                <div className="grid w-full grid-cols-1 gap-12 sm:grid-cols-2 xl:contents">
                    {items.slice(0, slots.length).map((item, index) => (
                        <div key={item.id} className={`w-full xl:absolute xl:w-[300px] ${slots[index]}`}>
                            <div className="flex flex-col items-center text-center">

                                <h4 className="text-[32px] leading-9 tracking-[-1.5px] md:text-[44px] md:leading-[48.4px] md:tracking-[-2.2px] uppercase">
                                    {item.title}
                                </h4>

                                <span className="text-[32px] md:text-[44px] leading-none tracking-[-2.2px]">
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                <p className="mt-4 text-[16px] leading-[22.4px] tracking-[-0.16px] uppercase">
                                    {item.description}
                                </p>

                            </div>
                        </div>
                    ))}
                </div>

            </div>


        </div>
    )
}
