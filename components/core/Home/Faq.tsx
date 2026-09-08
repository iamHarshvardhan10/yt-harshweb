"use client";

import { useState } from "react";
import AnimatedDotText from "@/components/common/AnimateDot";

export default function Faqs() {
    return (
        <div className="min-h-screen relative">
            <div className="flex flex-col items-center justify-center mt-30">
                <AnimatedDotText text="FAQS" className="mb-2" />
                <h2 className="uppercase text-4xl w-full text-center">Got Questions?</h2>
                <h2 className="uppercase text-4xl w-full text-center">We've got answers.</h2>
                <p className="text-[16px] text-[#c9c9c9] w-[40%] text-center mt-3">Quick answers to the most common Questions about the podcast the content, and how to get involved.</p>
            </div>

            <div className="px-39 py-6">
                <FAQAccordion />
            </div>

        </div>
    )
}



const faqs = [
    {
        question: "What is this podcast about?",
        answer:
            "This podcast explores historical events, people, and ideas that helped shape the world we live in today.",
    },
    {
        question: "How often are new episodes released?",
        answer:
            "New episodes are released on a regular schedule so listeners can keep up with each new story.",
    },
    {
        question: "What kind of topics do you cover?",
        answer:
            "We cover history, politics, economics, society, conflicts, important events, and the stories behind them.",
    },
    {
        question: "Is this podcast suitable for beginners?",
        answer:
            "Yes. Each episode is designed to explain complex topics in a simple and approachable way.",
    },
    {
        question: "Where can I listen to the podcast?",
        answer:
            "You can listen to the podcast on major podcast platforms and streaming services.",
    },
    {
        question: "Do you include sources or references?",
        answer:
            "Yes. We use credible sources, research papers, reports, books, and publicly available information whenever possible.",
    },
    {
        question: "Can I suggest a topic or guest?",
        answer:
            "Absolutely. We welcome topic suggestions and ideas for future episodes.",
    },
    {
        question: "Is there a way to contact the team?",
        answer:
            "Yes. You can contact the team through the contact page and send us your questions, suggestions, or feedback.",
    },
];

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

export function FAQAccordion() {

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
                                key={faq.question}
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
                                key={faq.question}
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
