import type { DocumentLanguage, Prisma } from "@prisma/client";

import { parseBody, type Spec } from "@/lib/home/validation";
import { LANGUAGES, languageLabels, SLUG_PATTERN, STATUSES, youtubeIdFromUrl } from "@/lib/investigations/shared";

const investigationSpec: Spec = {
    title: { type: "string", required: true, max: 160 },
    slug: {
        type: "string",
        required: true,
        max: 120,
        pattern: SLUG_PATTERN,
        patternMessage: "slug can only use lowercase letters, numbers and single dashes",
    },
    summary: { type: "string", required: true, max: 600 },
    category: { type: "string", required: true, max: 40 },
    status: { type: "enum", values: STATUSES },
    publishedAt: { type: "date" },
    youtubeVideoId: {
        type: "string",
        pattern: /^[\w-]{11}$/,
        patternMessage: "That doesn't look like a YouTube video link or id",
    },
    keyFindings: { type: "strings", maxItems: 10, max: 300 },
    tags: { type: "strings", maxItems: 15, max: 40 },
    featured: { type: "boolean" },
    order: { type: "int", min: 0, max: 10000 },
    metaTitle: { type: "string", max: 70 },
    metaDescription: { type: "string", max: 200 },
};

const documentSpec: Spec = {
    language: { type: "enum", values: LANGUAGES },
    title: { type: "string", max: 200 },
    description: { type: "string", max: 5000 },
    url: { type: "url", required: true },
    pages: { type: "int", min: 1, max: 5000, nullable: true },
    readMinutes: { type: "int", min: 1, max: 1000, nullable: true },
};

export type DocumentInput = Omit<Prisma.InvestigationDocumentCreateWithoutInvestigationInput, "language"> & {
    language: DocumentLanguage;
};

type ParsedInvestigation =
    | {
        error?: undefined;
        data: Prisma.InvestigationUncheckedUpdateInput;
        /** undefined = leave documents unchanged; otherwise the full new set */
        documents?: DocumentInput[];
    }
    | { error: string };

/**
 * Validates a create (partial = false) or update (partial = true) body.
 * `documents`, when sent, replaces the investigation's documents: one entry per language.
 */
export function parseInvestigation(body: unknown, { partial }: { partial: boolean }): ParsedInvestigation {
    if (body && typeof body === "object" && !Array.isArray(body)) {
        const input = body as Record<string, unknown>;
        // Accept a pasted YouTube link as well as a bare id
        if (typeof input.youtubeVideoId === "string" && input.youtubeVideoId.trim()) {
            body = { ...input, youtubeVideoId: youtubeIdFromUrl(input.youtubeVideoId) ?? input.youtubeVideoId };
        }
    }

    const parsed = parseBody(body, investigationSpec, { partial });
    if (parsed.error !== undefined) return { error: parsed.error };

    const raw = (body as Record<string, unknown>).documents;
    if (raw === undefined) return { data: parsed.data };

    if (!Array.isArray(raw) || raw.length > LANGUAGES.length) {
        return { error: `documents must be a list with at most ${LANGUAGES.length} entries` };
    }

    const documents: DocumentInput[] = [];
    for (const entry of raw) {
        const doc = parseBody(entry, documentSpec);
        const language = doc.data?.language as DocumentLanguage | undefined;
        // Name the language even when another field failed
        const rawLanguage = (entry as { language?: unknown } | null)?.language;
        const labelLanguage = language ?? LANGUAGES.find((l) => l === rawLanguage);
        const label = labelLanguage ? `${languageLabels[labelLanguage].name} document` : "Document";

        if (doc.error !== undefined) return { error: `${label}: ${doc.error}` };
        if (!language) return { error: "Each document needs a language" };
        if (documents.some((d) => d.language === language)) {
            return { error: `Only one ${languageLabels[language].name} document is allowed` };
        }
        documents.push(doc.data as DocumentInput);
    }

    return { data: parsed.data, documents };
}
