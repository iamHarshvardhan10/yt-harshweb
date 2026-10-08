// Password hashing with Node's built-in scrypt.
// Only imports node:crypto so scripts/admin.mjs can load it directly.

import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

export const MIN_PASSWORD_LENGTH = 10;

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { ...options, maxmem: 64 * 1024 * 1024 }, (err, key) =>
            err ? reject(err) : resolve(key)
        );
    });
}

/** Returns `scrypt$N$r$p$salt$hash` (base64 parts). */
export async function hashPassword(password: string) {
    const salt = randomBytes(16);
    const hash = await derive(password, salt, { N, r: R, p: P });
    return ["scrypt", N, R, P, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string) {
    const [scheme, n, r, p, salt, hash] = stored.split("$");
    if (scheme !== "scrypt" || !salt || !hash) return false;

    const expected = Buffer.from(hash, "base64");
    const actual = await derive(password, Buffer.from(salt, "base64"), {
        N: Number(n),
        r: Number(r),
        p: Number(p),
    });

    return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Hash checked when the email is unknown, so response time doesn't reveal which emails exist. */
export const DUMMY_PASSWORD_HASH =
    "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
