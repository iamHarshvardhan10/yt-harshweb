/** Shared auth constants — no server imports, safe for proxy.ts and client code. */

export const SESSION_COOKIE = "admin_session";
export const PENDING_2FA_COOKIE = "admin_2fa";

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const PENDING_2FA_TTL_MS = 10 * 60 * 1000; // 10 minutes to enter the code

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;

export const TOTP_ISSUER = "Harshwardhan Bhosale Dashboard";

/** Only allow same-site relative redirects after login. */
export function safeNextPath(next: string | null | undefined) {
    return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
        ? next
        : "/dashboard";
}
