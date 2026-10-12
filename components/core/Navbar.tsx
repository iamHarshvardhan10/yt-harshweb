"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
    { name: "About", href: "/about" },
    { name: "Videos", href: "/videos" },
    { name: "Investigations", href: "/investigations" },
    { name: "Newsletter", href: "/newsletter" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar({ title, logoUrl }: { title: string; logoUrl: string | null }) {
    const [open, setOpen] = useState(false);

    // Keep the page behind the mobile menu from scrolling
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    return (
        <nav className={`w-full fixed z-1000 text-white ${open ? "bg-black" : ""}`}>
            <div className="mx-auto flex h-16 items-center justify-between px-6 md:px-10 lg:px-19">

                <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex min-w-0 items-center gap-3 text-[14px] font-medium tracking-[-0.01em] uppercase sm:text-[16px]"
                >
                    {logoUrl && (
                        <Image src={logoUrl} alt="" width={32} height={32} className="h-8 w-auto object-contain" />
                    )}
                    <span className="truncate">{title}</span>
                </Link>

                <ul className="hidden items-center gap-8 lg:flex">
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href} className="text-[16px] font-medium uppercase">
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                <button
                    type="button"
                    onClick={() => setOpen((current) => !current)}
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    className="-mr-2 flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden"
                >
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {open && (
                <ul id="mobile-menu" className="flex h-[calc(100dvh-4rem)] flex-col gap-2 overflow-y-auto border-t border-white/10 bg-black px-6 py-8 md:px-10 lg:hidden">
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="block py-3 text-[28px] font-medium uppercase"
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </nav>
    );
}
