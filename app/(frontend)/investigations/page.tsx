import type { Metadata } from "next";

import PageHero from "@/components/common/PageHero";
import InvestigationLibrary from "@/components/core/Investigations/InvestigationLibrary";

export const metadata: Metadata = {
    title: "Investigations - Harsh Bhosale",
    description: "In-depth investigations to watch, with full research reports to read.",
};

export default function InvestigationsPage() {
    return (
        <>
            <PageHero
                eyebrow="Investigations"
                title={<>Follow the <br /> evidence</>}
                description="Every investigation comes in two forms: the video, and the full research report with every source behind it."
            />
            <InvestigationLibrary />
        </>
    );
}
