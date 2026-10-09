import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { unsubscribeByToken } from "@/lib/newsletter/queries";

export const metadata: Metadata = {
    title: "Unsubscribe - Harsh Bhosale",
    robots: { index: false },
};

/** "a•••@gmail.com" — enough to recognise, not enough to leak */
function maskEmail(email: string) {
    const [user, domain] = email.split("@");
    return `${user.charAt(0)}${"•".repeat(Math.max(user.length - 1, 2))}@${domain}`;
}

/**
 * The unsubscribe link in every newsletter. Unsubscribing needs a button press,
 * so email security scanners that open links can't unsubscribe people by accident.
 */
export default async function UnsubscribePage({ searchParams }: PageProps<"/newsletter/unsubscribe">) {
    const { token, done } = await searchParams;
    const value = typeof token === "string" ? token : "";

    const subscriber = value
        ? await prisma.subscriber.findUnique({ where: { token: value }, select: { email: true, status: true } })
        : null;

    async function unsubscribe() {
        "use server";
        await unsubscribeByToken(value);
        redirect(`/newsletter/unsubscribe?token=${encodeURIComponent(value)}&done=1`);
    }

    const gone = subscriber?.status === "UNSUBSCRIBED" || done === "1";

    return (
        <section className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-6 pt-32 text-center text-white">
            {!subscriber ? (
                <>
                    <h1 className="text-4xl uppercase md:text-5xl">This link doesn&apos;t work</h1>
                    <p className="mt-4 max-w-xl text-[16px] uppercase text-[#c9c9c9]">
                        Use the unsubscribe link from your most recent newsletter email.
                    </p>
                </>
            ) : gone ? (
                <>
                    <h1 className="text-4xl uppercase md:text-5xl">You&apos;re unsubscribed</h1>
                    <p className="mt-4 max-w-xl text-[16px] uppercase text-[#c9c9c9]">
                        {maskEmail(subscriber.email)} won&apos;t get the newsletter anymore. Changed your mind? You can sign up again any time.
                    </p>
                    <Link href="/newsletter" className="mt-10 rounded-full border border-white px-10 py-2 uppercase transition-colors hover:bg-white hover:text-black">
                        Back to the newsletter
                    </Link>
                </>
            ) : (
                <>
                    <h1 className="text-4xl uppercase md:text-5xl">Unsubscribe?</h1>
                    <p className="mt-4 max-w-xl text-[16px] uppercase text-[#c9c9c9]">
                        Stop sending the newsletter to {maskEmail(subscriber.email)}.
                    </p>
                    <form action={unsubscribe}>
                        <button
                            type="submit"
                            className="mt-10 cursor-pointer rounded-full bg-[#82cfff] px-10 py-2 uppercase text-black transition-colors hover:bg-[#6b6b6b] hover:text-[#82cfff]"
                        >
                            Unsubscribe
                        </button>
                    </form>
                </>
            )}
        </section>
    );
}
