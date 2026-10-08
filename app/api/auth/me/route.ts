import { NextResponse } from "next/server";
import { getAdminUser, unauthorized } from "@/lib/auth/dal";

/** GET /api/auth/me → the signed-in admin, or 401 */
export async function GET() {
    const user = await getAdminUser();
    if (!user) return unauthorized();
    return NextResponse.json({ user });
}
