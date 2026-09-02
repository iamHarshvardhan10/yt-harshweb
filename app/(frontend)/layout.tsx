import type { Metadata } from "next";
import { Geist, Geist_Mono, Chivo_Mono } from "next/font/google"
import Navbar from "@/components/core/Navbar";


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
    title: "Your Website",
    description: "Your website description",
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
                <Navbar />
                {children}
            </body>
        </html>
    );
}