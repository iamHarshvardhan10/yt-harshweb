import type { Metadata } from "next";
import { Geist, Geist_Mono, Chivo_Mono } from "next/font/google"
import Navbar from "@/components/core/Navbar";
import SmoothScroll from "@/components/common/SmoothScroll";
import Footer from "@/components/core/Footer";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const chivoMono = Chivo_Mono({
    variable: "--font-chivo-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Harsh Bhosale - YouTube",
    description: "Stories that deserves a closer look",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} ${chivoMono.variable} h-full antialiased`}
        >

            <body className="min-h-full flex flex-col">


                <SmoothScroll>
                    <Navbar />
                    {children}
                    <Footer />
                </SmoothScroll>
            </body>
        </html>
    );
}