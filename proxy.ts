import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * Optimistic auth check: only looks for the session cookie (no DB call).
 * The real check happens in the API routes via lib/auth/dal.ts — an invalid
 * cookie gets a 401 there, which clears the cookie and sends the user to /login.
 */
export default function proxy(req: NextRequest) {
    if (!req.cookies.has(SESSION_COOKIE)) {
        const login = new URL("/login", req.url);
        login.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(login);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
