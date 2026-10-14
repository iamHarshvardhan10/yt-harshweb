import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Chivo_Mono } from "next/font/google"
import "../globals.css";
import Navbar from "@/components/core/Navbar";
import SmoothScroll from "@/components/common/SmoothScroll";
import Footer from "@/components/core/Footer";
import JsonLd from "@/components/common/JsonLd";
import { getPublicSiteUrl, getSiteSettings } from "@/lib/settings";
import { getSocialLinks } from "@/lib/social";
import { DEFAULT_OG_IMAGE, SITE_NAME, personSchema, websiteSchema } from "@/lib/seo";


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
    const [settings, siteUrl] = await Promise.all([getSiteSettings(), getPublicSiteUrl()]);
    const bing = process.env.BING_SITE_VERIFICATION;

    return {
        // Pages set only their own part: "Videos" → "Videos | Harsh Bhosale"
        title: { default: settings.siteTitle, template: `%s | ${SITE_NAME}` },
        description: settings.siteDescription,
        metadataBase: new URL(siteUrl),
        applicationName: SITE_NAME,
        authors: [{ name: SITE_NAME, url: siteUrl }],
        creator: SITE_NAME,
        icons: { icon: settings.favicon?.secureUrl ?? "/favicon.ico" },
        robots: settings.allowIndexing
            ? { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-video-preview": -1 } }
            : { index: false, follow: false },
        openGraph: {
            type: "website",
            siteName: SITE_NAME,
            locale: "en_IN",
            title: settings.siteTitle,
            description: settings.siteDescription,
            images: [DEFAULT_OG_IMAGE],
        },
        twitter: {
            card: "summary_large_image",
            title: settings.siteTitle,
            description: settings.siteDescription,
            images: [DEFAULT_OG_IMAGE],
        },
        // Search Console / Bing Webmaster Tools ownership checks
        verification: {
            google: process.env.GOOGLE_SITE_VERIFICATION,
            ...(bing && { other: { "msvalidate.01": bing } }),
        },
    };
}

export const viewport: Viewport = {
    themeColor: "#000000",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [settings, siteUrl] = await Promise.all([getSiteSettings(), getPublicSiteUrl()]);
    const gaId = settings.googleAnalyticsId;
    const sameAs = getSocialLinks().map((link) => link.href);

    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} ${chivoMono.variable} h-full antialiased`}
        >

            <body className="min-h-full flex flex-col">
                <JsonLd
                    data={[
                        websiteSchema(siteUrl, settings.siteTitle, settings.siteDescription),
                        personSchema(siteUrl, sameAs, settings.logo?.secureUrl),
                    ]}
                />

                <SmoothScroll>
                    <Navbar title={settings.siteTitle} logoUrl={settings.logo?.secureUrl ?? null} />
                    <main className="flex-1">{children}</main>
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