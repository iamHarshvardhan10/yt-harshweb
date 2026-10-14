import Link from "next/link";

import AnimatedDotText from "@/components/common/AnimateDot";

// Shown (with a 404 status and noindex) when a page calls notFound(),
// e.g. an unpublished investigation or a hidden video
export default function NotFound() {
    return (
        <section className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-6 pt-32 text-center text-white">
            <AnimatedDotText text="404" className="mb-4" />
            <h1 className="text-4xl uppercase md:text-6xl">This page doesn&apos;t exist</h1>
            <p className="mt-4 max-w-xl text-[16px] uppercase text-[#c9c9c9]">
                It may have moved, or the link was copied incompletely. Try one of these instead.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link href="/investigations" className="rounded-full border border-white px-8 py-2 uppercase transition-colors hover:bg-white hover:text-black">
                    Investigations
                </Link>
                <Link href="/videos" className="rounded-full border border-white/25 px-8 py-2 uppercase text-white/70 transition-colors hover:border-white hover:text-white">
                    Videos
                </Link>
                <Link href="/" className="rounded-full border border-white/25 px-8 py-2 uppercase text-white/70 transition-colors hover:border-white hover:text-white">
                    Home
                </Link>
            </div>
        </section>
    );
}
