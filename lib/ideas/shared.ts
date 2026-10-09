/** Content idea helpers that are safe to import from client components. */

import type { ContentIdeaType, IdeaPriority, IdeaStage } from "@prisma/client";

export const IDEA_TYPES = ["VIDEO", "SHORT"] as const satisfies readonly ContentIdeaType[];
export const IDEA_STAGES = ["IDEA", "RESEARCH", "SCRIPT", "EDITING", "READY", "UPLOADED"] as const satisfies readonly IdeaStage[];
export const IDEA_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const satisfies readonly IdeaPriority[];

export const typeLabels: Record<ContentIdeaType, string> = { VIDEO: "Video", SHORT: "Short" };

export const stageLabels: Record<IdeaStage, string> = {
    IDEA: "Idea",
    RESEARCH: "Research",
    SCRIPT: "Script",
    EDITING: "Editing",
    READY: "Ready to upload",
    UPLOADED: "Uploaded",
};

export const priorityLabels: Record<IdeaPriority, string> = { HIGH: "High", MEDIUM: "Medium", LOW: "Low" };

/*
 * Upload times are entered and shown in India time, so the server render and
 * the browser always agree. IST has no daylight saving, so the offset is fixed.
 */
export const UPLOAD_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET = "+05:30";
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/** Date → "YYYY-MM-DDTHH:mm" in IST, for <input type="datetime-local"> */
export function toUploadInput(date: Date | string | null | undefined) {
    if (!date) return "";
    return new Date(new Date(date).getTime() + IST_OFFSET_MS).toISOString().slice(0, 16);
}

/** "YYYY-MM-DDTHH:mm" (IST) → ISO string with offset, or null when empty */
export const fromUploadInput = (value: string) => (value ? `${value}:00${IST_OFFSET}` : null);

const uploadFormatter = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: UPLOAD_TIME_ZONE,
});

/** "Wed, 14 Oct, 6:00 pm" */
export const formatUpload = (date: Date | string) => uploadFormatter.format(new Date(date));

/** IST calendar day as a sortable number of days since 1970 */
const istDay = (date: Date) => Math.floor((date.getTime() + IST_OFFSET_MS) / 86_400_000);

/** "Today", "Tomorrow", "In 5 days", "2 days overdue" — by IST calendar day */
export function uploadCountdown(date: Date | string, now = new Date()) {
    const days = istDay(new Date(date)) - istDay(now);
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days > 1) return `In ${days} days`;
    return `${-days} day${days === -1 ? "" : "s"} overdue`;
}
