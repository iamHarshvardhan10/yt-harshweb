import { NextRequest, NextResponse } from "next/server";

import { unsubscribeByToken } from "@/lib/newsletter/queries";

/**
 * POST /api/newsletter/unsubscribe?token=…
 * One-click unsubscribe from the mail app (List-Unsubscribe-Post, RFC 8058).
 * Readers clicking the link in the email go to /newsletter/unsubscribe instead.
 */
export async function POST(req: NextRequest) {
    const ok = await unsubscribeByToken(req.nextUrl.searchParams.get("token") ?? "");
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Unknown link" }, { status: 404 });
}
