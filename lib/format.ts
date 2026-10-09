/** Number formatting shared by server and client components. */

const compactFormatter = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** 1234567 → "1.2M" */
export const compact = (n: number) => compactFormatter.format(n);

export const shortDate = new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" });

/** ISO date → "5 min ago" / "3 days ago", falling back to a date after a month */
export function relativeTime(iso: string) {
    const minutes = Math.round((Date.now() - Date.parse(iso)) / 60000);
    if (minutes < 60) return `${Math.max(minutes, 1)} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
    return shortDate.format(new Date(iso));
}

/** 3723 → "1:02:03", 95 → "1:35" */
export function duration(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = h ? String(m).padStart(2, "0") : String(m);
    return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}
