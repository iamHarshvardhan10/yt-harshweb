import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { isMaintenanceOn } from "@/lib/maintenance";

/**
 * 1. Dashboard: optimistic auth check — only looks for the session cookie (no
 *    DB call). The real check happens in the pages and API routes via
 *    lib/auth/dal.ts.
 * 2. Public pages: while maintenance mode is on (Settings → Website), visitors
 *    get the maintenance page with a 503. Signed-in admins still see the site.
 */
export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const signedIn = req.cookies.has(SESSION_COOKIE);

    if (pathname.startsWith("/dashboard")) {
        if (!signedIn) {
            const login = new URL("/login", req.url);
            login.searchParams.set("next", pathname + req.nextUrl.search);
            return NextResponse.redirect(login);
        }
        return NextResponse.next();
    }

    if (!signedIn && (await isMaintenanceOn())) {
        return NextResponse.rewrite(new URL("/maintenance", req.url), {
            status: 503,
            headers: { "Retry-After": "3600" },
        });
    }

    return NextResponse.next();
}

export const config = {
    // Everything except API routes, Next.js internals, static files and the
    // pages that must keep working during maintenance
    matcher: [
        "/((?!api|_next/static|_next/image|login|invite|maintenance|robots.txt|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)",
    ],
};
