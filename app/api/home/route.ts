import { NextRequest, NextResponse } from "next/server";
import { getHomeAdminData, getHomePageData } from "@/lib/home/queries";
import { getAdminUser, unauthorized } from "@/lib/auth/dal";

/**
 * GET /api/home              → public home page content (visible items + defaults)
 * GET /api/home?scope=admin  → raw content for the dashboard (admin only, includes hidden items)
 */
export async function GET(req: NextRequest) {
    if (req.nextUrl.searchParams.get("scope") !== "admin") {
        return NextResponse.json(await getHomePageData());
    }

    if (!(await getAdminUser())) return unauthorized();
    return NextResponse.json(await getHomeAdminData());
}
