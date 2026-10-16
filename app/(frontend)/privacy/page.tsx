import type { Metadata } from "next";

import LegalPage, { type LegalSection } from "@/components/common/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
    title: "Privacy Policy",
    description: "What information the Harshwardhan Bhosale website and newsletter collect, why, how long it is kept, and how to have it removed.",
    path: "/privacy",
});

// Review with your own advisor before relying on it — it describes how this site works today
const sections: LegalSection[] = [
    {
        heading: "Who we are",
        paragraphs: [
            "This website publishes the investigations, videos and newsletter of Harshwardhan Bhosale. When this policy says \"we\" or \"us\", it means the Harshwardhan Bhosale team. You can reach us about anything in this policy at hello@harshbhosale.com.",
        ],
    },
    {
        heading: "What we collect",
        paragraphs: [
            "Newsletter: when you subscribe we store your email address, your name if you give it, the topics you pick, and when you signed up, confirmed and (if you do) unsubscribed. We send a confirmation email first and only add you once you click the link in it.",
            "Emails you send us: if you write to one of our addresses, we keep your message and email address so we can reply.",
            "Usage data: we may use Google Analytics to understand which pages are read and how visitors find us. It records things like the pages you view, your approximate location, device and browser. We do not use advertising or tracking cookies of our own.",
            "Server logs: like every website, our hosting provider keeps short-lived technical logs (such as IP address and request time) to keep the site secure and running.",
        ],
    },
    {
        heading: "Embedded videos",
        paragraphs: [
            "Videos are hosted on YouTube. The player only loads when you press play, from YouTube's privacy-enhanced domain (youtube-nocookie.com). Once it loads, YouTube's own privacy policy applies to what happens in the player.",
        ],
    },
    {
        heading: "How we use it",
        paragraphs: [
            "We use your information to send the newsletter you asked for, reply to your messages, and improve the website. We never sell your information or share your email address with advertisers.",
        ],
    },
    {
        heading: "How long we keep it",
        paragraphs: [
            "We keep newsletter details while you are subscribed. After you unsubscribe we keep only your email address and the unsubscribe date, so we don't email you again by mistake. Ask us and we will delete it entirely.",
        ],
    },
    {
        heading: "Your choices",
        paragraphs: [
            "Every newsletter has an unsubscribe link at the bottom. You can also ask us at hello@harshbhosale.com to see, correct or delete the information we hold about you, and we will respond within 30 days.",
            "You can block or delete cookies in your browser settings, and opt out of Google Analytics with Google's browser add-on.",
        ],
    },
    {
        heading: "Changes",
        paragraphs: [
            "If we change this policy we will update the date at the top of this page. Significant changes will also be announced in the newsletter.",
        ],
    },
];

export default function PrivacyPage() {
    return (
        <LegalPage
            eyebrow="Privacy"
            title="Privacy Policy"
            description="What we collect, why, and how to have it removed."
            updated="2026-10-15"
            sections={sections}
        />
    );
}
