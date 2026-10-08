/**
 * Tiny body validator for the home page API.
 * - `partial: true` (PATCH) only validates fields that are present.
 * - Optional strings are trimmed; empty strings become `null`.
 */

type FieldSpec =
    | { type: "string"; required?: boolean; max?: number }
    | { type: "boolean" }
    | { type: "int"; min?: number; max?: number }
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
            if (!partial && field.type === "string" && field.required) {
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
                data[key] = trimmed;
                break;
            }
            case "boolean": {
                if (typeof value !== "boolean") return { error: `${key} must be a boolean` };
                data[key] = value;
                break;
            }
            case "int": {
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
