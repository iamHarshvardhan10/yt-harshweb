import { NextResponse } from "next/server";
import { HomeSectionKey } from "@prisma/client";
import { revalidateHome } from "@/lib/home/revalidate";
import { withAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import {
    defaultAboutItems,
    defaultFaqs,
    defaultHero,
    defaultMetrics,
    defaultSections,
    defaultTestimonials,
} from "@/lib/home/defaults";

const withOrder = <T,>(items: T[]) => items.map((item, order) => ({ ...item, order }));

/**
 * POST /api/home/seed
 * Imports the original home page copy into the DB.
 * Only fills what is empty — never overwrites saved content.
 */
export const POST = withAdmin(seedHomeContent);

async function seedHomeContent() {
    const [heroCount, savedSections, metricCount, aboutCount, testimonialCount, faqCount] = await Promise.all([
        prisma.homeHero.count(),
        prisma.homeSection.findMany({ select: { key: true } }),
        prisma.homeMetric.count(),
        prisma.homeAboutItem.count(),
        prisma.homeTestimonial.count(),
        prisma.homeFaq.count(),
    ]);

    const savedKeys = savedSections.map((s) => s.key);
    const missingKeys = Object.values(HomeSectionKey).filter((key) => !savedKeys.includes(key));

    // Writes are collected first and sent as one batch transaction.
    // An interactive transaction holds a connection across round trips and
    // exceeds Prisma's 5s timeout on a remote pooler.
    const created: string[] = [];
    const writes = [];

    if (!heroCount) {
        writes.push(prisma.homeHero.create({ data: defaultHero }));
        created.push("hero");
    }
    if (missingKeys.length) {
        writes.push(prisma.homeSection.createMany({
            data: missingKeys.map((key) => ({ key, ...defaultSections[key] })),
            skipDuplicates: true,
        }));
        created.push("sections");
    }
    if (!metricCount) {
        writes.push(prisma.homeMetric.createMany({ data: withOrder(defaultMetrics) }));
        created.push("metrics");
    }
    if (!aboutCount) {
        writes.push(prisma.homeAboutItem.createMany({ data: withOrder(defaultAboutItems) }));
        created.push("about-items");
    }
    if (!testimonialCount) {
        writes.push(prisma.homeTestimonial.createMany({ data: withOrder(defaultTestimonials) }));
        created.push("testimonials");
    }
    if (!faqCount) {
        writes.push(prisma.homeFaq.createMany({ data: withOrder(defaultFaqs) }));
        created.push("faqs");
    }

    if (writes.length) await prisma.$transaction(writes);

    if (created.length) revalidateHome();
    return NextResponse.json({ created }, { status: created.length ? 201 : 200 });
}
