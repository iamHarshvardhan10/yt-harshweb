import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="w-full fixed z-1000 text-white">
            <div className="mx-auto flex h-16  items-center justify-between px-19">

                <Link
                    href="/"
                    className="text-[16px] font-medium tracking-[-0.01em]  uppercase"
                >
                    Harsh Bhosale - YouTube
                </Link>

                <ul className="flex items-center gap-8">
                    <li>
                        <Link
                            href="/about"
                            className="text-[16px] font-medium uppercase"
                        >
                            About
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/videos"
                            className="text-[16px] font-medium uppercase"
                        >
                            Videos
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/investigations"
                            className="text-[16px] font-medium  uppercase"
                        >
                            Investigations
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/contact"
                            className="text-[16px] font-medium  uppercase"
                        >
                            Contact
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}