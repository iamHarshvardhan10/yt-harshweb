import type { Metadata } from "next";

import LegalPage, { type LegalSection } from "@/components/common/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
    title: "Terms of Use",
    description: "The terms for using the Harshwardhan Bhosale website: sharing and quoting our work, how we handle corrections, and links to other sites.",
    path: "/terms",
});

// Review with your own advisor before relying on it
const sections: LegalSection[] = [
    {
        heading: "Using this website",
        paragraphs: [
            "By using this website you agree to these terms. If you don't agree, please don't use the site. Questions go to hello@harshbhosale.com.",
        ],
    },
    {
        heading: "Our content",
        paragraphs: [
            "The videos, reports, text, images and design on this site belong to Harshwardhan Bhosale unless we say otherwise. You are welcome to share links to any page, and to quote short passages with clear credit and a link back to the original.",
            "Republishing whole reports, videos or images, or using them commercially, needs our written permission first.",
        ],
    },
    {
        heading: "Accuracy and corrections",
        paragraphs: [
            "We research every story carefully and link to the sources behind it, but we can still get things wrong. If you spot an error, write to tips@harshbhosale.com with the page and what needs fixing. When we correct a published report we update it and note the change.",
            "Our reports are journalism, not legal, financial or medical advice.",
        ],
    },
    {
        heading: "Links to other sites",
        paragraphs: [
            "We link to documents, datasets and other websites as sources. We don't control those sites and aren't responsible for their content or availability.",
        ],
    },
    {
        heading: "Newsletter",
        paragraphs: [
            "The newsletter is free. You can unsubscribe at any time with the link in every email. See our Privacy Policy for how we handle your email address.",
        ],
    },
    {
        heading: "Changes",
        paragraphs: [
            "We may update these terms from time to time. The date at the top of this page shows when they last changed.",
        ],
    },
];

export default function TermsPage() {
    return (
        <LegalPage
            eyebrow="Terms"
            title="Terms of Use"
            description="Sharing our work, corrections, and links to other sites."
            updated="2026-10-15"
            sections={sections}
        />
    );
}
