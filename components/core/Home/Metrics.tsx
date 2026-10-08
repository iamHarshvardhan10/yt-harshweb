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
            <div className="flex flex-col gap-4 px-26.5 py-25">
                {section.eyebrow && <AnimatedDotText text={section.eyebrow} />}
                <div className="flex flex-row gap-0 w-full items-center justify-between">
                    <h3 className="text-[44px] tracking-[-2.2px] leading-[48.4px] uppercase w-[70%]">
                        {section.title}
                    </h3>
                    {section.description && (
                        <p className="w-[30%] text-[16px] leading-[22.4px] tracking-[-0.16px] uppercase">
                            {section.description}
                        </p>
                    )}
                </div>


                <div className="relative w-full py-11.25">
                    <div className="grid w-full grid-cols-4 gap-4">
                        {metrics.map((metric, index) => (
                            <div
                                key={metric.id}
                                className="px-6 py-5"
                            >
                                <div className="flex justify-end">
                                    <span className="text-[16px] leading-[22.4px] tracking-[-0.16px] uppercase text-[#82CFFF]">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-2">
                                    <h4 className="pt-8 text-[48px] leading-[52.8px]">
                                        {metric.value}
                                    </h4>

                                    <h5 className="text-[16px] leading-[22.4px] tracking-[-0.16px] uppercase text-[#82CFFF]">
                                        {metric.title}
                                    </h5>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


        </div>
    );
}
