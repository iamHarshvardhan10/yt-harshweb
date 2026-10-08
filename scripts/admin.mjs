// Dashboard admin management.
//
//   npm run admin list
//   npm run admin create <email> "<name>"
//   npm run admin reset-password <email>
//   npm run admin reset-2fa <email>     (lost phone — sets up Google Authenticator again at next login)
//   npm run admin unlock <email>        (clears a failed-attempt lockout)
//   npm run admin delete <email>
//
// Passwords are typed at a hidden prompt, never passed as arguments.

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../lib/auth/password.ts";

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const [command, rawEmail, ...rest] = process.argv.slice(2);
const email = rawEmail?.trim().toLowerCase();

function fail(message) {
    console.error(`✖ ${message}`);
    process.exitCode = 1;
}

/** Reads a line from the terminal without echoing it. */
function promptHidden(question) {
    return new Promise((resolve) => {
        const { stdin, stdout } = process;
        stdout.write(question);

        if (!stdin.isTTY) {
            // Piped input (e.g. CI): read one line as-is
            let buffer = "";
            stdin.setEncoding("utf8");
            stdin.on("data", (chunk) => (buffer += chunk));
            stdin.on("end", () => resolve(buffer.split(/\r?\n/)[0]));
            return;
        }

        let input = "";
        stdin.setRawMode(true);
        stdin.setEncoding("utf8");
        stdin.resume();

        const onData = (chunk) => {
            for (const char of chunk) {
                if (char === "\r" || char === "\n" || char === "\u0004") {
                    stdin.setRawMode(false);
                    stdin.pause();
                    stdin.off("data", onData);
                    stdout.write("\n");
                    resolve(input);
                    return;
                }
                if (char === "\u0003") {
                    stdout.write("\n");
                    process.exit(130);
                }
                if (char === "\u007f" || char === "\b") input = input.slice(0, -1);
                else input += char;
            }
        };

        stdin.on("data", onData);
    });
}

async function askNewPassword() {
    const password = await promptHidden("Password: ");
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    if ((await promptHidden("Confirm password: ")) !== password) {
        throw new Error("Passwords do not match");
    }
    return hashPassword(password);
}

async function findUser() {
    if (!email) throw new Error(`Usage: npm run admin ${command} <email>`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error(`No admin with email ${email}`);
    return user;
}

const commands = {
    async list() {
        const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
        if (!users.length) return console.log("No admins yet. Create one with: npm run admin create <email> \"<name>\"");

        console.table(
            users.map((u) => ({
                email: u.email,
                name: u.name,
                "2FA": u.totpEnabled ? "on" : "pending setup",
                locked: u.lockedUntil && u.lockedUntil > new Date() ? "yes" : "",
                lastLogin: u.lastLoginAt?.toISOString() ?? "never",
            }))
        );
    },

    async create() {
        const name = rest.join(" ").trim();
        if (!email || !name) throw new Error('Usage: npm run admin create <email> "<name>"');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
        if (await prisma.user.findUnique({ where: { email } })) throw new Error(`${email} already exists`);

        const passwordHash = await askNewPassword();
        await prisma.user.create({ data: { email, name, passwordHash } });
        console.log(`✔ Created ${email}. Sign in at /login — you'll set up Google Authenticator on first login.`);
    },

    async "reset-password"() {
        const user = await findUser();
        const passwordHash = await askNewPassword();
        await prisma.$transaction([
            prisma.user.update({ where: { id: user.id }, data: { passwordHash, failedLoginCount: 0, lockedUntil: null } }),
            prisma.session.deleteMany({ where: { userId: user.id } }),
        ]);
        console.log(`✔ Password updated for ${email}. All their sessions were signed out.`);
    },

    async "reset-2fa"() {
        const user = await findUser();
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { totpEnabled: false, totpSecret: null, totpPendingSecret: null, totpLastCounter: null },
            }),
            prisma.session.deleteMany({ where: { userId: user.id } }),
        ]);
        console.log(`✔ Authenticator removed for ${email}. They'll scan a new QR code at next login.`);
    },

    async unlock() {
        const user = await findUser();
        await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null } });
        console.log(`✔ Unlocked ${email}.`);
    },

    async delete() {
        const user = await findUser();
        await prisma.user.delete({ where: { id: user.id } }); // sessions cascade
        console.log(`✔ Deleted ${email}.`);
    },
};

try {
    const run = commands[command];
    if (!run) {
        fail(`Unknown command "${command ?? ""}". Use: ${Object.keys(commands).join(", ")}`);
    } else {
        await run();
    }
} catch (err) {
    fail(err instanceof Error ? err.message : String(err));
} finally {
    await prisma.$disconnect();
}
