// AES-256-GCM encryption for TOTP secrets at rest, keyed from AUTH_SECRET.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function key() {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters");
    }
    return createHash("sha256").update(secret).digest();
}

/** Returns `v1.iv.tag.ciphertext` (base64url parts). */
export function encryptSecret(plain: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key(), iv);
    const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    return ["v1", iv, tag, ciphertext].map((part) => (typeof part === "string" ? part : part.toString("base64url"))).join(".");
}

export function decryptSecret(box: string) {
    const [version, iv, tag, ciphertext] = box.split(".");
    if (version !== "v1" || !iv || !tag || !ciphertext) throw new Error("Unsupported secret format");

    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));

    return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
}
