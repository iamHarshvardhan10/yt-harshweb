import PageHero from "@/components/common/PageHero";

export type LegalSection = { heading: string; paragraphs: string[] };

/** Shared layout for /privacy and /terms. */
export default function LegalPage({
    eyebrow,
    title,
    description,
    updated,
    sections,
}: {
    eyebrow: string,
    title: string,
    description: string,
    /** YYYY-MM-DD */
    updated: string,
    sections: LegalSection[],
}) {
    const updatedLabel = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
        .format(new Date(`${updated}T00:00:00Z`));

    return (
        <>
            <PageHero eyebrow={eyebrow} title={title} description={description} />

            <article className="bg-background px-6 pb-30 pt-10 text-white md:px-20 lg:px-49">
                <p className="text-[12px] uppercase tracking-[0.15em] text-[#82CFFF]">
                    Last updated <time dateTime={updated}>{updatedLabel}</time>
                </p>

                <div className="mt-10 max-w-3xl">
                    {sections.map((section) => (
                        <section key={section.heading} className="border-t border-white/10 py-10">
                            <h2 className="text-2xl uppercase md:text-3xl">{section.heading}</h2>
                            {section.paragraphs.map((paragraph, index) => (
                                <p key={index} className="mt-4 text-[16px] leading-[1.7] text-[#c9c9c9]">{paragraph}</p>
                            ))}
                        </section>
                    ))}
                </div>
            </article>
        </>
    );
}
