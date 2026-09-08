import Link from "next/link";

const footerLinks = {
    explore: [
        { name: "About", href: "/about" },
        { name: "Videos", href: "/videos" },
        { name: "Investigations", href: "/investigations" },
        { name: "Contact", href: "/contact" },
    ],
    social: [
        { name: "YouTube", href: "#" },
        { name: "Instagram", href: "#" },
        { name: "X", href: "#" },
    ],
};

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black text-white">
            <div className="mx-auto max-w-7xl px-6">

                <div className="grid grid-cols-1 gap-10 py-10 md:grid-cols-[1.5fr_1fr_1fr]">

                    {/* Brand */}
                    <div>
                        <Link
                            href="/"
                            className="text-lg font-semibold tracking-tight"
                        >
                            HARSH BHOSALE
                        </Link>

                        <p className="mt-3 max-w-xs text-sm leading-6 text-white/40">
                            Stories that deserve a closer look.
                        </p>
                    </div>

                    {/* Explore */}
                    <div>
                        <p className="mb-4 text-xs uppercase tracking-[0.15em] text-white/30">
                            Explore
                        </p>

                        <div className="flex  gap-2">
                            {footerLinks.explore.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="w-fit text-sm text-white/60 transition hover:text-white"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Social */}
                    <div className="flex flex-col">
                        <p className="mb-4 text-xs uppercase tracking-[0.15em] text-white/30">
                            Social
                        </p>

                        <div className="flex  gap-2">
                            {footerLinks.social.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-fit text-sm text-white/60 transition hover:text-white"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col gap-3 border-t border-white/10 py-5 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
                    <p>© 2026 Harsh Bhosale. All rights reserved.</p>

                    <div className="flex gap-5">
                        <Link href="/privacy" className="hover:text-white">
                            Privacy
                        </Link>

                        <Link href="/terms" className="hover:text-white">
                            Terms
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}