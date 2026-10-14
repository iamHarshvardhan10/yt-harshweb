import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";

import { SITE_NAME } from "@/lib/seo";

// The app has several root layouts ((frontend), (auth), dashboard), so URLs that
// match no route at all land here. Pages that call notFound() use (frontend)/not-found.tsx.
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: `Page not found | ${SITE_NAME}`,
    description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
    return (
        <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col items-center justify-center bg-black px-6 text-center text-white">
                <p className="text-[12px] uppercase tracking-[0.15em] text-[#82CFFF]">404</p>
                <h1 className="mt-4 text-4xl uppercase md:text-6xl">This page doesn&apos;t exist</h1>
                <p className="mt-4 max-w-xl text-[16px] uppercase text-[#c9c9c9]">
                    It may have moved, or the link was copied incompletely.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                    <Link href="/investigations" className="rounded-full border border-white px-8 py-2 uppercase transition-colors hover:bg-white hover:text-black">
                        Investigations
                    </Link>
                    <Link href="/" className="rounded-full border border-white/25 px-8 py-2 uppercase text-white/70 transition-colors hover:border-white hover:text-white">
                        Home
                    </Link>
                </div>
            </body>
        </html>
    );
}
