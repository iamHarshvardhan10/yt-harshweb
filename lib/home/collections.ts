import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseBody, readJson, type Spec } from "@/lib/home/validation";
import { revalidateAbout, revalidateHome } from "@/lib/home/revalidate";
import { withAdmin } from "@/lib/auth/dal";

/**
 * Generic CRUD handlers for the ordered home page lists
 * (metrics, about items, testimonials, faqs).
 *
 *   GET    /api/home/{collection}         list (ordered)
 *   POST   /api/home/{collection}         create (appended to the end)
 *   PUT    /api/home/{collection}         reorder  { ids: string[] }
 *   GET    /api/home/{collection}/{id}    read one
 *   PATCH  /api/home/{collection}/{id}    partial update
 *   DELETE /api/home/{collection}/{id}    delete
 */

// Minimal shape shared by the Prisma delegates we use here.
type Delegate = {
    findMany(args: object): Promise<unknown[]>;
    findUnique(args: object): Promise<unknown | null>;
    create(args: object): Promise<unknown>;
    update(args: object): Promise<unknown>;
    delete(args: object): Promise<unknown>;
    aggregate(args: object): Promise<{ _max: { order: number | null } }>;
};

type CollectionConfig = {
    label: string;
    delegate: () => Delegate;
    spec: Spec;
    include?: object;
    /** Pages to refresh after a change (defaults to the home content pages) */
    revalidate?: () => void;
};

const orderFields: Spec = {
    order: { type: "int", min: 0 },
    isVisible: { type: "boolean" },
};

export const collectionConfigs = {
    metrics: {
        label: "metric",
        delegate: () => prisma.homeMetric as unknown as Delegate,
        spec: {
            title: { type: "string", required: true, max: 60 },
            value: { type: "string", required: true, max: 30 },
            ...orderFields,
        },
    },
    "about-items": {
        label: "about item",
        delegate: () => prisma.homeAboutItem as unknown as Delegate,
        spec: {
            title: { type: "string", required: true, max: 80 },
            description: { type: "string", required: true, max: 400 },
            ...orderFields,
        },
    },
    testimonials: {
        label: "testimonial",
        delegate: () => prisma.homeTestimonial as unknown as Delegate,
        spec: {
            name: { type: "string", required: true, max: 80 },
            text: { type: "string", required: true, max: 400 },
            avatarId: { type: "string" },
            ...orderFields,
        },
        include: { avatar: true },
    },
    faqs: {
        label: "faq",
        delegate: () => prisma.homeFaq as unknown as Delegate,
        spec: {
            question: { type: "string", required: true, max: 200 },
            answer: { type: "string", required: true, max: 2000 },
            ...orderFields,
        },
    },
    "about-steps": {
        label: "step",
        delegate: () => prisma.aboutStep as unknown as Delegate,
        spec: {
            title: { type: "string", required: true, max: 60 },
            description: { type: "string", required: true, max: 400 },
            ...orderFields,
        },
        revalidate: revalidateAbout,
    },
} satisfies Record<string, CollectionConfig>;

export type CollectionName = keyof typeof collectionConfigs;

type IdContext = { params: Promise<{ id: string }> };

export function prismaErrorResponse(err: unknown, label: string) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
            return NextResponse.json({ error: `${label} not found` }, { status: 404 });
        }
        if (err.code === "P2003") {
            return NextResponse.json({ error: "Referenced media does not exist" }, { status: 400 });
        }
    }
    console.error(`[home] ${label} error:`, err);
    return NextResponse.json({ error: `Failed to save ${label}` }, { status: 500 });
}

export function createCollectionRoutes(name: CollectionName) {
    const config: CollectionConfig = collectionConfigs[name];
    const { label, spec, include } = config;
    const db = config.delegate;
    const revalidate = config.revalidate ?? revalidateHome;

    async function list() {
        const items = await db().findMany({
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            include,
        });
        return NextResponse.json({ items });
    }

    async function create(req: NextRequest) {
        const parsed = parseBody(await readJson(req), spec);
        if (parsed.error !== undefined) return NextResponse.json({ error: parsed.error }, { status: 400 });
        const data = parsed.data;

        try {
            if (data.order === undefined) {
                const { _max } = await db().aggregate({ _max: { order: true } });
                data.order = (_max.order ?? -1) + 1;
            }
            const item = await db().create({ data, include });
            revalidate();
            return NextResponse.json({ item }, { status: 201 });
        } catch (err) {
            return prismaErrorResponse(err, label);
        }
    }

    async function reorder(req: NextRequest) {
        const body = (await readJson(req)) as { ids?: unknown } | undefined;
        const ids = body?.ids;

        if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
            return NextResponse.json({ error: "ids must be an array of strings" }, { status: 400 });
        }

        try {
            await prisma.$transaction(
                ids.map((id, order) => db().update({ where: { id }, data: { order } }) as never)
            );
            revalidate();
            return list();
        } catch (err) {
            return prismaErrorResponse(err, label);
        }
    }

    async function read(_req: NextRequest, { params }: IdContext) {
        const { id } = await params;
        const item = await db().findUnique({ where: { id }, include });
        if (!item) return NextResponse.json({ error: `${label} not found` }, { status: 404 });
        return NextResponse.json({ item });
    }

    async function update(req: NextRequest, { params }: IdContext) {
        const { id } = await params;
        const parsed = parseBody(await readJson(req), spec, { partial: true });
        if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });

        try {
            const item = await db().update({ where: { id }, data: parsed.data, include });
            revalidate();
            return NextResponse.json({ item });
        } catch (err) {
            return prismaErrorResponse(err, label);
        }
    }

    async function remove(_req: NextRequest, { params }: IdContext) {
        const { id } = await params;
        try {
            await db().delete({ where: { id } });
            revalidate();
            return NextResponse.json({ success: true });
        } catch (err) {
            return prismaErrorResponse(err, label);
        }
    }

    // Dashboard-only API: the public pages read the DB directly
    return {
        list: withAdmin(list),
        create: withAdmin(create),
        reorder: withAdmin(reorder),
        read: withAdmin(read),
        update: withAdmin(update),
        remove: withAdmin(remove),
    };
}
