"use client";
import AnimatedDotText from "@/components/common/AnimateDot";
import Image from "next/image";
import type { HomeTestimonial, Media } from "@prisma/client";
import type { HomeSectionData } from "@/lib/home/queries";

type Testimonial = HomeTestimonial & { avatar: Media | null };

export default function Listerners({
    section,
    testimonials,
}: {
    section: HomeSectionData;
    testimonials: Testimonial[];
}) {
    return (
        <div className="px-6 md:px-26.5 bg-background text-white">
            <div className="flex flex-col gap-6 w-full md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col md:w-[50%]">
                    {section.eyebrow && <AnimatedDotText text={section.eyebrow} />}
                    <h3 className="text-[32px] leading-9 tracking-[-1.5px] md:text-[44px] md:leading-[48.4px] md:tracking-[-2.2px] uppercase lg:w-[60%]">{section.title}</h3>
                </div>
                <div className="md:w-[35%] lg:w-[25%] flex items-center md:mt-10">
                    {section.description && (
                        <p className="text-[16px] leading-[22.4px] tracking-[-0.16px] uppercase text-[#c9c9c9]">
                            {section.description}
                        </p>
                    )}
                </div>

            </div>

            <div>
                <TestimonialsMarquee testimonials={testimonials} />
            </div>



        </div>
    )
}



function initials(name: string) {
    return name
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function TestimonialCard({
    testimonial,
}: {
    testimonial: Testimonial;
}) {
    const imageSrc = testimonial.avatar?.secureUrl ?? testimonial.image;

    return (
        <div className="group flex min-h-45 w-[85vw] max-w-[590px] shrink-0 flex-col justify-between gap-4 border border-white/30 bg-black p-4 transition-colors duration-300 hover:border-white/60 sm:w-[590px] sm:p-6">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white/10 font-mono text-sm">
                        {imageSrc ? (
                            <Image
                                src={imageSrc}
                                alt={testimonial.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                            />
                        ) : (
                            initials(testimonial.name)
                        )}
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


            <p className="max-w-130 font-mono text-[14px] sm:text-[16px] font-semibold uppercase leading-normal text-white">
                &ldquo;{testimonial.text}&rdquo;
            </p>
        </div>
    );
}

export function TestimonialsMarquee({ testimonials }: { testimonials: Testimonial[] }) {
    return (
        <section className="relative w-full overflow-hidden bg-black py-10">

            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 md:w-32 bg-linear-to-r from-black to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 md:w-32 bg-linear-to-l from-black to-transparent" />


            <div className="marquee-wrapper mb-5">
                <div className="marquee marquee-left">

                    {testimonials.map((testimonial) => (
                        <TestimonialCard
                            key={`row1-${testimonial.id}`}
                            testimonial={testimonial}
                        />
                    ))}

                    {testimonials.map((testimonial) => (
                        <TestimonialCard
                            key={`row1-copy-${testimonial.id}`}
                            testimonial={testimonial}
                        />
                    ))}
                </div>
            </div>


            <div className="marquee-wrapper">
                <div className="marquee marquee-right">

                    {testimonials.map((testimonial) => (
                        <TestimonialCard
                            key={`row2-${testimonial.id}`}
                            testimonial={testimonial}
                        />
                    ))}


                    {testimonials.map((testimonial) => (
                        <TestimonialCard
                            key={`row2-copy-${testimonial.id}`}
                            testimonial={testimonial}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
