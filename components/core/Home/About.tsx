import AnimatedDotText from "@/components/common/AnimateDot"
import Image from "next/image"
import type { HomeAboutItem } from "@prisma/client"
import type { HomeSectionData } from "@/lib/home/queries"

// Four fixed slots around the centre image: top-left, top-right, bottom-left, bottom-right
const slots = [
    "top-[130px] left-[160px]",
    "top-[130px] right-[160px]",
    "bottom-[260px] left-[120px]",
    "bottom-[260px] right-[120px]",
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
            <h3 className="text-[44px] uppercase">{section.title}</h3>
            {section.description && (
                <p className="w-[40%] uppercase text-[#c9c9c9]">{section.description}</p>
            )}


            <div className="relative mx-auto w-full max-w-[1400px] h-[1000px]">

                {/* CENTER IMAGE */}
                <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2">
                    <Image
                        src={section.image?.secureUrl ?? "/about.webp"}
                        alt={section.title}
                        width={528}
                        height={840}
                        className="w-[528px] h-[720px] object-cover"
                    />
                </div>


                {items.slice(0, slots.length).map((item, index) => (
                    <div key={item.id} className={`absolute w-[300px] ${slots[index]}`}>
                        <div className="flex flex-col items-center text-center">

                            <h4 className="text-[44px] leading-[48.4px] tracking-[-2.2px] uppercase">
                                {item.title}
                            </h4>

                            <span className="text-[44px] leading-none tracking-[-2.2px]">
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
    )
}
