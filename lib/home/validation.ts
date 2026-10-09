/**
 * Tiny body validator for the CMS APIs.
 * - `partial: true` (PATCH) only validates fields that are present.
 * - Optional strings are trimmed; empty strings become `null`.
 */

type FieldSpec =
    | { type: "string"; required?: boolean; max?: number; pattern?: RegExp; patternMessage?: string }
    | { type: "url"; required?: boolean }
    | { type: "date"; required?: boolean } // "YYYY-MM-DD" → Date
    | { type: "datetime"; required?: boolean } // ISO 8601 with a timezone (Z or ±hh:mm) → Date
    | { type: "strings"; maxItems: number; max: number } // empty entries are dropped
    | { type: "boolean" }
    | { type: "int"; min?: number; max?: number; nullable?: boolean }
    | { type: "enum"; values: readonly string[] };

export type Spec = Record<string, FieldSpec>;

type ParseResult =
    | { data: Record<string, unknown>; error?: undefined }
    | { data?: undefined; error: string };

export function parseBody(
    body: unknown,
    spec: Spec,
    { partial = false }: { partial?: boolean } = {}
): ParseResult {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { error: "Request body must be a JSON object" };
    }

    const input = body as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    for (const [key, field] of Object.entries(spec)) {
        const value = input[key];

        if (value === undefined) {
            if (!partial && "required" in field && field.required) {
                return { error: `${key} is required` };
            }
            continue;
        }

        switch (field.type) {
            case "string": {
                if (value === null) {
                    if (field.required) return { error: `${key} is required` };
                    data[key] = null;
                    break;
                }
                if (typeof value !== "string") return { error: `${key} must be a string` };

                const trimmed = value.trim();
                if (!trimmed) {
                    if (field.required) return { error: `${key} is required` };
                    data[key] = null;
                    break;
                }
                if (field.max && trimmed.length > field.max) {
                    return { error: `${key} must be at most ${field.max} characters` };
                }
                if (field.pattern && !field.pattern.test(trimmed)) {
                    return { error: field.patternMessage ?? `${key} is invalid` };
                }
                data[key] = trimmed;
                break;
            }
            case "url":
            case "date":
            case "datetime": {
                const trimmed = typeof value === "string" ? value.trim() : value;
                if (trimmed === null || trimmed === "") {
                    if (field.required) return { error: `${key} is required` };
                    data[key] = null;
                    break;
                }
                if (typeof trimmed !== "string") return { error: `${key} must be a string` };

                if (field.type === "url") {
                    if (trimmed.length > 2000 || !/^https?:\/\//i.test(trimmed) || !URL.canParse(trimmed)) {
                        return { error: `${key} must be a link starting with http:// or https://` };
                    }
                    data[key] = trimmed;
                } else if (field.type === "datetime") {
                    // A timezone is required so the stored moment is never ambiguous
                    const date = new Date(trimmed);
                    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(trimmed) || Number.isNaN(date.getTime())) {
                        return { error: `${key} must be a date and time with a timezone` };
                    }
                    data[key] = date;
                } else {
                    const date = new Date(`${trimmed}T00:00:00Z`);
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed) || Number.isNaN(date.getTime())) {
                        return { error: `${key} must be a date (YYYY-MM-DD)` };
                    }
                    data[key] = date;
                }
                break;
            }
            case "strings": {
                if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
                    return { error: `${key} must be a list of strings` };
                }
                const items = value.map((item: string) => item.trim()).filter(Boolean);
                if (items.length > field.maxItems) return { error: `${key} can have at most ${field.maxItems} items` };
                if (items.some((item) => item.length > field.max)) {
                    return { error: `Each ${key} entry must be at most ${field.max} characters` };
                }
                data[key] = items;
                break;
            }
            case "boolean": {
                if (typeof value !== "boolean") return { error: `${key} must be a boolean` };
                data[key] = value;
                break;
            }
            case "int": {
                if (value === null && field.nullable) {
                    data[key] = null;
                    break;
                }
                if (typeof value !== "number" || !Number.isInteger(value)) {
                    return { error: `${key} must be an integer` };
                }
                if (field.min !== undefined && value < field.min) {
                    return { error: `${key} must be >= ${field.min}` };
                }
                if (field.max !== undefined && value > field.max) {
                    return { error: `${key} must be <= ${field.max}` };
                }
                data[key] = value;
                break;
            }
            case "enum": {
                if (typeof value !== "string" || !field.values.includes(value)) {
                    return { error: `${key} must be one of ${field.values.join(", ")}` };
                }
                data[key] = value;
                break;
            }
        }
    }

    return { data };
}

export async function readJson(req: Request): Promise<unknown> {
    try {
        return await req.json();
    } catch {
        return undefined;
    }
}
