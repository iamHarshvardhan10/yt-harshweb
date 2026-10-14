import { getChannelLink } from "@/lib/youtube";

/**
 * Public profiles for the footer and structured data (schema.org sameAs).
 * Only profiles with an address are shown — set INSTAGRAM_URL and X_URL in .env.
 */
export function getSocialLinks(): { name: string; href: string }[] {
    const links = [
        { name: "YouTube", href: getChannelLink()?.url },
        { name: "Instagram", href: process.env.INSTAGRAM_URL?.trim() },
        { name: "X", href: process.env.X_URL?.trim() },
    ];
    return links.filter((link): link is { name: string; href: string } => Boolean(link.href));
}
