import type { HomeSectionKey } from "@prisma/client";

/**
 * Default home page content.
 * Used as a fallback for the hero / section headers when nothing is saved yet,
 * and by POST /api/home/seed to import the original site copy into the DB.
 */

export const defaultHero = {
    eyebrow: "New Videos",
    headline: "Stories that deserve a closer look",
    description:
        "Behind every issue is a story of decisions, systems, and consequences. We follow the evidence to understand what happened beneath the surface.",
    primaryButtonName: "Videos",
    primaryButtonUrl: "/videos",
    secondaryButtonName: "Contact Us",
    secondaryButtonUrl: "/contact",
    darkOverlay: false,
    overlayOpacity: 65,
    isVisible: true,
    autoplay: true,
    loop: true,
};

export const defaultSections: Record<
    HomeSectionKey,
    { eyebrow: string; title: string; description: string | null }
> = {
    FEATURED_VIDEOS: {
        eyebrow: "Featured Videos",
        title: "Explore the videos available on the site",
        description: null,
    },
    METRICS: {
        eyebrow: "Metrics",
        title: "Results that speak for themselves.",
        description:
            "Key metrics that highlight how listeners are engaging with the videos and how the show continues to grow.",
    },
    ABOUT: {
        eyebrow: "About Us",
        title: "About the Videos",
        description:
            "A history podcast that explores the people, events, and moments that shaped the world we know today.",
    },
    TESTIMONIALS: {
        eyebrow: "Reviews",
        title: "A few words from our Listeners",
        description:
            "Thoughtful feedback from people who connect with the podcast, the stories, and the way the past is brought to life",
    },
    FAQ: {
        eyebrow: "FAQS",
        title: "Got Questions? We've got answers.",
        description:
            "Quick answers to the most common questions about the podcast, the content, and how to get involved.",
    },
    CONTACT: {
        eyebrow: "Contact",
        title: "Let's Connect",
        description:
            "Have a question, suggestion, or collaboration idea? Reach out and we’ll get back to you.",
    },
};

export const defaultMetrics = [
    { title: "Monthly Visits", value: "120K+" },
    { title: "Return Listeners", value: "85%" },
    { title: "Published Episodes", value: "250+" },
    { title: "Average Watch Time", value: "15min" },
];

export const defaultAboutItems = Array.from({ length: 4 }, () => ({
    title: "Historic Stories",
    description:
        "Explore the events, people, and moments that helped shape the world we know today.",
}));

export const defaultTestimonials = [
    { name: "Sofía Torres", image: "/testimonials/testimonials_01.jpg", text: "I love how the show makes historical topics feel interesting without being overwhelming." },
    { name: "Laura Méndez", image: "/testimonials/testimonials_02.jpg", text: "The storytelling is thoughtful, well-paced, and genuinely enjoyable." },
    { name: "Carlos Rivera", image: "/testimonials/testimonials_03.jpg", text: "A perfect balance of facts, context, and narrative." },
    { name: "Daniel Costa", image: "/testimonials/testimonials_04.jpg", text: "I always learn something new when I listen." },
    { name: "Valentina Ruiz", image: "/testimonials/testimonials_02.jpg", text: "One of the most approachable history podcasts I've found." },
];

export const defaultFaqs = [
    {
        question: "What is this podcast about?",
        answer: "This podcast explores historical events, people, and ideas that helped shape the world we live in today.",
    },
    {
        question: "How often are new episodes released?",
        answer: "New episodes are released on a regular schedule so listeners can keep up with each new story.",
    },
    {
        question: "What kind of topics do you cover?",
        answer: "We cover history, politics, economics, society, conflicts, important events, and the stories behind them.",
    },
    {
        question: "Is this podcast suitable for beginners?",
        answer: "Yes. Each episode is designed to explain complex topics in a simple and approachable way.",
    },
    {
        question: "Where can I listen to the podcast?",
        answer: "You can listen to the podcast on major podcast platforms and streaming services.",
    },
    {
        question: "Do you include sources or references?",
        answer: "Yes. We use credible sources, research papers, reports, books, and publicly available information whenever possible.",
    },
    {
        question: "Can I suggest a topic or guest?",
        answer: "Absolutely. We welcome topic suggestions and ideas for future episodes.",
    },
    {
        question: "Is there a way to contact the team?",
        answer: "Yes. You can contact the team through the contact page and send us your questions, suggestions, or feedback.",
    },
];
