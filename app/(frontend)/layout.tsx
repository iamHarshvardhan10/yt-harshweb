import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Chivo_Mono } from "next/font/google"
import "../globals.css";
import Navbar from "@/components/core/Navbar";
import SmoothScroll from "@/components/common/SmoothScroll";
import Footer from "@/components/core/Footer";
import { getSiteSettings } from "@/lib/settings";


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

// Title, description, favicon, logo, indexing and analytics come from
// /dashboard/settings → Website (saving there refreshes every page).
export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();

    return {
        title: settings.siteTitle,
        description: settings.siteDescription,
        metadataBase: settings.siteUrl ? new URL(settings.siteUrl) : undefined,
        icons: { icon: settings.favicon?.secureUrl ?? "/favicon.ico" },
        robots: settings.allowIndexing ? undefined : { index: false, follow: false },
    };
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const settings = await getSiteSettings();
    const gaId = settings.googleAnalyticsId;

    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} ${chivoMono.variable} h-full antialiased`}
        >

            <body className="min-h-full flex flex-col">


                <SmoothScroll>
                    <Navbar title={settings.siteTitle} logoUrl={settings.logo?.secureUrl ?? null} />
                    {children}
                    <Footer />
                </SmoothScroll>

                {gaId && (
                    <>
                        <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
                        <Script id="google-analytics" strategy="afterInteractive">
                            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`}
                        </Script>
                    </>
                )}
            </body>
        </html>
    );
}