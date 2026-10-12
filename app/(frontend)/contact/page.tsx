import type { Metadata } from "next";

import PageHero from "@/components/common/PageHero";
import ContactUs from "@/components/core/Home/ContactUs";
import Faqs from "@/components/core/Home/Faq";
import { getHomePageData } from "@/lib/home/queries";
import { getChannelLink } from "@/lib/youtube";

export const metadata: Metadata = {
    title: "Contact - Harsh Bhosale",
    description: "Questions, story tips and collaborations.",
};

const youtube = getChannelLink();

const channels = [
    {
        id: "01",
        title: "Story Tips",
        value: "tips@harshbhosale.com",
        href: "mailto:tips@harshbhosale.com",
    },
    {
        id: "02",
        title: "Collaborations",
        value: "hello@harshbhosale.com",
        href: "mailto:hello@harshbhosale.com",
    },
    {
        id: "03",
        title: "YouTube",
        value: youtube?.label ?? "@harshbhosale",
        href: youtube?.url ?? "https://www.youtube.com",
    },
];

export default async function ContactPage() {
    // Contact form header & FAQs share their content with the home page
    const { sections, faqs } = await getHomePageData();

    return (
        <>
            <PageHero
                eyebrow="Contact"
                title={<>Let&apos;s <br /> connect</>}
                description="Have a question, a story tip or a collaboration idea? Reach out and we'll get back to you."
            />

            {/* CHANNELS */}
            <section className="bg-background px-6 pt-10 text-white md:px-20 lg:px-49">
                <div className="grid grid-cols-1 border-y border-white/10 md:grid-cols-3">
                    {channels.map((channel) => (
                        <a
                            key={channel.id}
                            href={channel.href}
                            target={channel.href.startsWith("http") ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className="group border-b border-white/10 py-10 md:border-b-0 md:border-r md:px-8 md:last:border-r-0 md:first:pl-0"
                        >
                            <span className="text-[16px] text-[#82CFFF]">{channel.id}</span>
                            <p className="mt-6 text-[12px] uppercase tracking-[0.15em] text-white/40">{channel.title}</p>
                            <p className="mt-2 break-all text-[18px] transition-colors md:text-[20px] group-hover:text-[#82CFFF]">{channel.value}</p>
                        </a>
                    ))}
                </div>
            </section>

            <ContactUs section={sections.CONTACT} />
            {faqs.length > 0 && <Faqs section={sections.FAQ} faqs={faqs} />}
        </>
    );
}
