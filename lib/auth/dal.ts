import { cache } from "react";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { readSession } from "@/lib/auth/session";

/**
 * Data Access Layer — the authoritative auth check.
 * proxy.ts only looks for the cookie; every protected API route goes through here.
 */

export const getAdminUser = cache(async () => {
    const session = await readSession("ACTIVE");
    if (!session) return null;

    const { id, name, email } = session.user;
    return { id, name, email };
});

export type AdminUser = NonNullable<Awaited<ReturnType<typeof getAdminUser>>>;

export function unauthorized() {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Clear a stale/invalid cookie so proxy.ts stops treating the browser as signed in
    res.cookies.delete(SESSION_COOKIE);
    return res;
}

/** Wraps a route handler so it only runs for a signed-in admin. */
export function withAdmin<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
    return async (...args: Args): Promise<Response> => {
        if (!(await getAdminUser())) return unauthorized();
        return handler(...args);
    };
}
