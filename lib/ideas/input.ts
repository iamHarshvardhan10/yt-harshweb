import type { Spec } from "@/lib/home/validation";
import { IDEA_PRIORITIES, IDEA_STAGES, IDEA_TYPES } from "@/lib/ideas/shared";

export const ideaSpec: Spec = {
    title: { type: "string", required: true, max: 200 },
    notes: { type: "string", max: 5000 },
    category: { type: "string", max: 40 },
    type: { type: "enum", values: IDEA_TYPES },
    stage: { type: "enum", values: IDEA_STAGES },
    priority: { type: "enum", values: IDEA_PRIORITIES },
    uploadAt: { type: "datetime" },
    youtubeVideoId: {
        type: "string",
        pattern: /^[\w-]{11}$/,
        patternMessage: "That doesn't look like a YouTube video link or id",
    },
};
