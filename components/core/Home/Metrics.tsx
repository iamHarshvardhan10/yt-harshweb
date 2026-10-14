import AnimatedDotText from "@/components/common/AnimateDot";
import type { HomeMetric } from "@prisma/client";
import type { HomeSectionData } from "@/lib/home/queries";

export default function Metrics({
    section,
    metrics,
}: {
    section: HomeSectionData;
    metrics: HomeMetric[];
}) {
    return (
        <div className="bg-background text-white">
            <div className="flex flex-col gap-4 px-6 py-16 md:px-26.5 md:py-25">
                {section.eyebrow && <AnimatedDotText text={section.eyebrow} />}
                <div className="flex flex-col gap-6 w-full md:flex-row md:items-center md:justify-between">
                    <h2 className="text-[32px] tracking-[-1.5px] leading-9 md:text-[44px] md:tracking-[-2.2px] md:leading-[48.4px] uppercase md:w-[70%]">
                        {section.title}
                    </h2>
                    {section.description && (
                        <p className="md:w-[30%] text-[16px] leading-[22.4px] tracking-[-0.16px] uppercase">
                            {section.description}
                        </p>
                    )}
                </div>


                <div className="relative w-full py-6 md:py-11.25">
                    <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
                        {metrics.map((metric, index) => (
                            <div
                                key={metric.id}
                                className="min-w-0 px-2 py-5 sm:px-6"
                            >
                                <div className="flex justify-end">
                                    <span className="text-[16px] leading-[22.4px] tracking-[-0.16px] uppercase text-[#82CFFF]">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-2">
                                    <p className="pt-4 text-[32px] leading-9 sm:pt-8 sm:text-[48px] sm:leading-[52.8px]">
                                        {metric.value}
                                    </p>

                                    <p className="text-center text-[14px] leading-5 sm:text-[16px] sm:leading-[22.4px] tracking-[-0.16px] uppercase text-[#82CFFF]">
                                        {metric.title}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


        </div>
    );
}
