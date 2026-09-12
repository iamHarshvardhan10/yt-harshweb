"use client";
import AnimatedDotText from "@/components/common/AnimateDot";
import Image from "next/image";

export default function Listerners() {
    return (
        <div className="px-26.5 bg-background text-white">
            <div className="flex items-center justify-between w-full">
                <div className="flex flex-col w-[50%]">
                    <AnimatedDotText text="reviews" />
                    <h3 className="text-[44px] leading-[48.4px] tracking-[-2.2px] uppercase w-[60%]">A few words from our Listeners</h3>
                </div>
                <div className="w-[25%] flex items-center mt-10">
                    <p className="text-[16px] leading-[22.4px] tracking-[-0.16px] uppercase text-[#c9c9c9]">
                        Thoughtful feedback from people who connect with the podcast, the stories, and the way the past is brought to life
                    </p>
                </div>

            </div>

            <div>
                <TestimonialsMarquee />
            </div>



        </div>
    )
}



const testimonials = [
    {
        name: "Sofía Torres",
        image: "/testimonials/testimonials_01.jpg",
        text: "I LOVE HOW THE SHOW MAKES HISTORICAL TOPICS FEEL INTERESTING WITHOUT BEING OVERWHELMING.",
    },
    {
        name: "Laura Méndez",
        image: "/testimonials/testimonials_02.jpg",
        text: "THE STORYTELLING IS THOUGHTFUL, WELL-PACED, AND GENUINELY ENJOYABLE.",
    },
    {
        name: "Carlos Rivera",
        image: "/testimonials/testimonials_03.jpg",
        text: "A PERFECT BALANCE OF FACTS, CONTEXT, AND NARRATIVE.",
    },
    {
        name: "Daniel Costa",
        image: "/testimonials/testimonials_04.jpg",
        text: "I ALWAYS LEARN SOMETHING NEW WHEN I LISTEN.",
    },
    {
        name: "Valentina Ruiz",
        image: "/testimonials/testimonials_02.jpg",
        text: "ONE OF THE MOST APPROACHABLE HISTORY PODCASTS I'VE FOUND.",
    },
];

function TestimonialCard({
    testimonial,
}: {
    testimonial: (typeof testimonials)[number];
}) {
    return (
        <div className="group flex  h-45 w-[590px] shrink-0 flex-col justify-between border border-white/30 bg-black p-6 transition-colors duration-300 hover:border-white/60">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full">
                        <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <h3 className="font-mono text-[16px] font-semibold text-white">
                        {testimonial.name}
                    </h3>
                </div>


                <div className="flex h-12 w-12 items-center justify-center border border-white/20">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-6 w-6 text-white"
                    >
                        <rect x="3" y="5" width="18" height="14" rx="4" />
                        <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
                    </svg>
                </div>
            </div>


            <p className="max-w-130 font-mono text-[16px] font-semibold leading-normal text-white">
                "{testimonial.text}"
            </p>
        </div>
    );
}

export function TestimonialsMarquee() {
    return (
        <section className="relative w-full overflow-hidden bg-black py-10">

            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-32 bg-linear-to-r from-black to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-32 bg-linear-to-l from-black to-transparent" />


            <div className="marquee-wrapper mb-5">
                <div className="marquee marquee-left">

                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={`row1-${index}`}
                            testimonial={testimonial}
                        />
                    ))}

                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={`row1-copy-${index}`}
                            testimonial={testimonial}
                        />
                    ))}
                </div>
            </div>


            <div className="marquee-wrapper">
                <div className="marquee marquee-right">

                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={`row2-${index}`}
                            testimonial={testimonial}
                        />
                    ))}


                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={`row2-copy-${index}`}
                            testimonial={testimonial}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}