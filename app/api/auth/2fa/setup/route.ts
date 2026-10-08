import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { TOTP_ISSUER } from "@/lib/auth/constants";
import { decryptSecret, encryptSecret } from "@/lib/auth/encryption";
import { readSession } from "@/lib/auth/session";
import { generateTotpSecret, totpAuthUri } from "@/lib/auth/totp";

/**
 * GET /api/auth/2fa/setup
 * First login only: returns the QR code + secret to add to Google Authenticator.
 * The secret is kept as `totpPendingSecret` until a code from it is verified.
 */
export async function GET() {
    const session = await readSession("PENDING_2FA");
    if (!session) {
        return NextResponse.json({ error: "Your login expired. Sign in again." }, { status: 401 });
    }

    const { user } = session;
    if (user.totpEnabled) {
        return NextResponse.json({ error: "Authenticator is already set up" }, { status: 400 });
    }

    // Reuse the pending secret so reloading the page doesn't invalidate a scanned code
    let secret = user.totpPendingSecret ? decryptSecret(user.totpPendingSecret) : null;
    if (!secret) {
        secret = generateTotpSecret();
        await prisma.user.update({
            where: { id: user.id },
            data: { totpPendingSecret: encryptSecret(secret) },
        });
    }

    const uri = totpAuthUri({ secret, account: user.email, issuer: TOTP_ISSUER });
    const qrCode = await QRCode.toDataURL(uri, { margin: 1, width: 220 });

    return NextResponse.json(
        { qrCode, secret, account: user.email, issuer: TOTP_ISSUER },
        { headers: { "Cache-Control": "no-store" } }
    );
}
