import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

/** POST /api/auth/logout → ends the session and clears the cookies */
export async function POST() {
    await destroySession("ACTIVE");
    await destroySession("PENDING_2FA");
    return NextResponse.json({ success: true });
}
