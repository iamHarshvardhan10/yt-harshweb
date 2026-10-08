// TOTP (RFC 6238) — the 6-digit codes Google Authenticator generates.
// SHA-1, 30 second steps, 6 digits: the defaults every authenticator app supports.

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const PERIOD_SECONDS = 30;
const DIGITS = 6;
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buffer: Buffer) {
    let bits = 0;
    let value = 0;
    let output = "";

    for (const byte of buffer) {
        value = (value << 8) | byte;
        bits += 8;
        while (bits >= 5) {
            output += BASE32[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) output += BASE32[(value << (5 - bits)) & 31];

    return output;
}

export function base32Decode(input: string) {
    const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
    const bytes: number[] = [];
    let bits = 0;
    let value = 0;

    for (const char of clean) {
        value = (value << 5) | BASE32.indexOf(char);
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 255);
            bits -= 8;
        }
    }

    return Buffer.from(bytes);
}

/** 160-bit random secret, base32 encoded (what the authenticator app stores). */
export function generateTotpSecret() {
    return base32Encode(randomBytes(20));
}

export function generateHotp(key: Buffer, counter: number, digits = DIGITS) {
    const message = Buffer.alloc(8);
    message.writeBigUInt64BE(BigInt(counter));

    const hmac = createHmac("sha1", key).update(message).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary = hmac.readUInt32BE(offset) & 0x7fffffff;

    return String(binary % 10 ** digits).padStart(digits, "0");
}

export function timeStep(now = Date.now()) {
    return Math.floor(now / 1000 / PERIOD_SECONDS);
}

/**
 * Checks a code against the previous, current and next time step (±30s clock drift).
 * Returns the matched time step, or null. Steps at or before `lastUsedStep` are
 * rejected so a code can't be used twice.
 */
export function verifyTotp(secret: string, code: string, lastUsedStep: number | null, now = Date.now()) {
    const token = code.replace(/\s/g, "");
    if (!/^\d{6}$/.test(token)) return null;

    const key = base32Decode(secret);
    const current = timeStep(now);

    for (const step of [current - 1, current, current + 1]) {
        if (lastUsedStep !== null && step <= lastUsedStep) continue;
        if (timingSafeEqual(Buffer.from(generateHotp(key, step)), Buffer.from(token))) return step;
    }

    return null;
}

/** otpauth:// URI encoded in the QR code. */
export function totpAuthUri({ secret, account, issuer }: { secret: string; account: string; issuer: string }) {
    const label = encodeURIComponent(`${issuer}:${account}`);
    const params = new URLSearchParams({
        secret,
        issuer,
        algorithm: "SHA1",
        digits: String(DIGITS),
        period: String(PERIOD_SECONDS),
    });
    return `otpauth://totp/${label}?${params}`;
}
