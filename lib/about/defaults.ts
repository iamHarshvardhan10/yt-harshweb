/**
 * Default About page content — the original site copy.
 * Used when the AboutPage row doesn't exist yet, and by DELETE /api/about (reset).
 */

export const defaultAboutPage = {
    heroTag: "About Us",
    heroTitle: "Look beyond\nthe headline",
    heroDesc:
        "We investigate the decisions, systems and consequences that shape the world around us, and make them understandable through research and visual storytelling.",
    heroImage: "/hero.webp",

    processTag: "How We Work",
    processTitle: "Research. Verify. Explain.",
    processDesc: "Every story follows the same process, from the first document to the final edit.",
    processVisible: true,

    ctaTag: "Get Involved",
    ctaTitle: "Have a story we should look into?",
    ctaDesc:
        "Send us a tip, a document or a question. Some of our best investigations started with a message from a viewer.",
    ctaBtn1: "Contact Us",
    ctaBtn1Link: "/contact",
    ctaBtn2: "Investigations",
    ctaBtn2Link: "/investigations",
    ctaVisible: true,

    showAbout: true,
    showMetrics: true,
};
