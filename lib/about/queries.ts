import { prisma } from "@/lib/prisma";
import { defaultAboutPage } from "@/lib/about/defaults";

export const ABOUT_PAGE_ID = "about";

const ordered = [{ order: "asc" as const }, { createdAt: "asc" as const }];

export async function getAboutPage() {
    return prisma.aboutPage.findUnique({
        where: { id: ABOUT_PAGE_ID },
        include: { heroMedia: true },
    });
}

/** Raw data for the dashboard editor (hidden steps included). */
export async function getAboutAdminData() {
    const [page, steps] = await Promise.all([
        getAboutPage(),
        prisma.aboutStep.findMany({ orderBy: ordered }),
    ]);
    return { page, steps };
}

/** Public About page data: visible steps, default copy when nothing is saved. */
export async function getAboutPageData() {
    const [page, steps] = await Promise.all([
        getAboutPage(),
        prisma.aboutStep.findMany({ where: { isVisible: true }, orderBy: ordered }),
    ]);

    return {
        page: {
            ...defaultAboutPage,
            ...(page ?? {}),
            heroImageUrl: page?.heroMedia?.secureUrl ?? page?.heroImage ?? defaultAboutPage.heroImage,
        },
        steps,
    };
}

export type AboutPageData = Awaited<ReturnType<typeof getAboutPageData>>;
