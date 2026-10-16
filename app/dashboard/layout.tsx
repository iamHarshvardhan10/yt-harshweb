import type { Metadata } from "next";
import { Geist, Geist_Mono, Chivo_Mono } from "next/font/google";
import "../globals.css";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";




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
    title: "Harshwardhan Bhosale - YouTube",
    description: "Stories that deserve a closer look",
    // Private admin area — never in search results
    robots: { index: false, follow: false },
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
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                            <div className="flex items-center gap-2 px-4">
                                <SidebarTrigger className="-ml-1 hover:bg-red-500" />
                                {/* <Separator
                                    orientation="vertical"
                                    className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                                /> */}
                                {/* <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbLink href="#">
                                                Build Your Application
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb> */}
                            </div>
                        </header>

                        {children}
                    </SidebarInset>
                </SidebarProvider>

            </body>
        </html>
    );
}