"use client";

import { useState } from "react";
import AnimatedDotText from "@/components/common/AnimateDot";
import type { HomeSectionData } from "@/lib/home/queries";

type Faq = { id: string; question: string; answer: string };

export default function Faqs({
    section,
    faqs,
}: {
    section: HomeSectionData;
    faqs: Faq[];
}) {
    return (
        <div className="min-h-screen relative bg-background text-white">
            <div className="flex flex-col items-center justify-center pt-20 px-6 md:pt-30">
                {section.eyebrow && <AnimatedDotText text={section.eyebrow} className="mb-2" />}
                <h2 className="uppercase text-3xl md:text-4xl w-full md:w-[70%] lg:w-[50%] text-center whitespace-pre-line">{section.title}</h2>
                {section.description && (
                    <p className="text-[16px] text-[#c9c9c9] w-full md:w-[70%] lg:w-[40%] text-center mt-3">{section.description}</p>
                )}
            </div>

            <div className="py-6 md:px-10 lg:px-39">
                <FAQAccordion faqs={faqs} />
            </div>

        </div>
    )
}

function FAQItem({
    question,
    answer,
    isOpen,
    onClick,
}: {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}) {
    return (
        <div
            className={`
        overflow-hidden rounded-[5px] border
        transition-colors duration-300
        ${isOpen
                    ? "border-white/45"
                    : "border-white/25 hover:border-white/40"
                }
      `}
        >
            <button
                onClick={onClick}
                className="
          flex w-full items-center justify-between
          px-4 py-4.5
          text-left
          md:px-4
          focus:outline-none
        "
            >
                <span className="pr-6 text-[16px] font-medium tracking-[-0.03em] text-white">
                    {question}
                </span>

                {/* Dot */}
                <span
                    className={`
            relative flex h-5 w-5 shrink-0 items-center justify-center
          `}
                >
                    <span
                        className={`
              block h-[10px] w-[10px] rounded-full
              transition-all duration-300
              ${isOpen
                                ? "bg-white shadow-[0_0_8px_3px_rgba(255,255,255,0.35)]"
                                : "bg-white/15"
                            }
            `}
                    />
                </span>
            </button>

            {/* Answer */}
            <div
                className={`
          grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
        `}
            >
                <div className="min-h-0 overflow-hidden">
                    <div className="px-5 pb-6 pt-0">
                        <p className="max-w-[700px] text-[12px] leading-[1.6] text-white/65">
                            {answer}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FAQAccordion({ faqs }: { faqs: Faq[] }) {

    const [openItems, setOpenItems] = useState<number[]>([0, 1]);

    const toggleItem = (index: number) => {
        setOpenItems((current) =>
            current.includes(index)
                ? current.filter((item) => item !== index)
                : [...current, index]
        );
    };

    const leftColumn = faqs.filter((_, index) => index % 2 === 0);
    const rightColumn = faqs.filter((_, index) => index % 2 !== 0);

    return (
        <section className="w-full bg-black px-6 py-20 md:px-8 lg:px-10">
            <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-5">
                
                <div className="flex flex-col gap-3">
                    {leftColumn.map((faq, index) => {
                        const actualIndex = index * 2;

                        return (
                            <FAQItem
                                key={faq.id}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openItems.includes(actualIndex)}
                                onClick={() => toggleItem(actualIndex)}
                            />
                        );
                    })}
                </div>


                <div className="flex flex-col gap-3">
                    {rightColumn.map((faq, index) => {
                        const actualIndex = index * 2 + 1;

                        return (
                            <FAQItem
                                key={faq.id}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openItems.includes(actualIndex)}
                                onClick={() => toggleItem(actualIndex)}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
