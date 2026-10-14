import { ImageResponse } from "next/og";

import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

/**
 * Default 1200×630 share image (lib/seo.ts DEFAULT_OG_IMAGE) for pages without
 * their own — WhatsApp, X, LinkedIn and Facebook previews. Built once at build time.
 */
export const dynamic = "force-static";

export function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "72px 80px",
                    background: "linear-gradient(135deg, #000000 0%, #0b1620 100%)",
                    color: "#ffffff",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 9999, background: "#82CFFF" }} />
                    <div style={{ fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#82CFFF" }}>
                        Investigations · Videos · Reports
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 112, lineHeight: 1, letterSpacing: -4, textTransform: "uppercase" }}>
                        {SITE_NAME}
                    </div>
                    <div style={{ marginTop: 28, fontSize: 40, color: "#c9c9c9", textTransform: "uppercase" }}>
                        {SITE_TAGLINE}
                    </div>
                </div>

                <div style={{ display: "flex", height: 4, width: 160, background: "#82CFFF" }} />
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
