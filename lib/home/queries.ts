import { HomeHeroMediaRole, HomeSectionKey, type Media } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { defaultHero, defaultSections } from "@/lib/home/defaults";

const ordered = [{ order: "asc" as const }, { createdAt: "asc" as const }];

export const heroInclude = { media: { include: { media: true } } } as const;

export async function getHero() {
    return prisma.homeHero.findFirst({
        include: heroInclude,
        orderBy: { createdAt: "asc" },
    });
}

/** Raw data for the dashboard editor (hidden items included). */
export async function getHomeAdminData() {
    const [hero, sections, metrics, aboutItems, testimonials, faqs] = await Promise.all([
        getHero(),
        prisma.homeSection.findMany({ include: { media: true } }),
        prisma.homeMetric.findMany({ orderBy: ordered }),
        prisma.homeAboutItem.findMany({ orderBy: ordered }),
        prisma.homeTestimonial.findMany({ orderBy: ordered, include: { avatar: true } }),
        prisma.homeFaq.findMany({ orderBy: ordered }),
    ]);

    return { hero, sections, metrics, aboutItems, testimonials, faqs };
}

export type HomeSectionData = {
    eyebrow: string | null;
    title: string;
    description: string | null;
    image: Media | null;
    isVisible: boolean;
};

/**
 * Public home page data: only visible items, with the original copy
 * used as a fallback for the hero and any section header not saved yet.
 */
export async function getHomePageData() {
    const where = { isVisible: true };

    const [hero, sectionRows, metrics, aboutItems, testimonials, faqs] = await Promise.all([
        getHero(),
        prisma.homeSection.findMany({ include: { media: true } }),
        prisma.homeMetric.findMany({ where, orderBy: ordered }),
        prisma.homeAboutItem.findMany({ where, orderBy: ordered }),
        prisma.homeTestimonial.findMany({ where, orderBy: ordered, include: { avatar: true } }),
        prisma.homeFaq.findMany({ where, orderBy: ordered }),
    ]);

    const sections = Object.fromEntries(
        Object.values(HomeSectionKey).map((key) => {
            const row = sectionRows.find((s) => s.key === key);
            const section: HomeSectionData = row
                ? { eyebrow: row.eyebrow, title: row.title, description: row.description, image: row.media, isVisible: row.isVisible }
                : { ...defaultSections[key], image: null, isVisible: true };
            return [key, section];
        })
    ) as Record<HomeSectionKey, HomeSectionData>;

    const heroMedia = (role: HomeHeroMediaRole) =>
        hero?.media.find((m) => m.role === role)?.media ?? null;

    return {
        hero: {
            ...defaultHero,
            ...(hero ?? {}),
            backgroundImage: heroMedia(HomeHeroMediaRole.BACKGROUND_IMAGE),
            backgroundVideo: heroMedia(HomeHeroMediaRole.BACKGROUND_VIDEO),
            backgroundType: hero?.backgroundType ?? "IMAGE",
        },
        sections,
        metrics,
        aboutItems,
        testimonials,
        faqs,
    };
}

export type HomePageData = Awaited<ReturnType<typeof getHomePageData>>;
