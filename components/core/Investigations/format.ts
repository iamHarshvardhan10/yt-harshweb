const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

/** "2026-09-12" → "12 Sept 2026" (dates are stored without a time, so format in UTC) */
export const displayDate = (date: string) => dateFormatter.format(new Date(`${date}T00:00:00Z`));
