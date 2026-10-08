/** Number formatting shared by server and client components. */

const compactFormatter = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** 1234567 → "1.2M" */
export const compact = (n: number) => compactFormatter.format(n);
