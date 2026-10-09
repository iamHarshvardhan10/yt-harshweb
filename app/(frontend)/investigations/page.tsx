import type { Metadata } from "next";

import PageHero from "@/components/common/PageHero";
import InvestigationLibrary from "@/components/core/Investigations/InvestigationLibrary";
import { getPublishedInvestigations } from "@/lib/investigations/queries";

export const metadata: Metadata = {
    title: "Investigations - Harsh Bhosale",
    description: "In-depth investigations to watch, with full research reports to read in English and Hindi.",
};

// Content is managed from /dashboard/investigations

export default async function InvestigationsPage() {
    const investigations = await getPublishedInvestigations();

    return (
        <>
            <PageHero
                eyebrow="Investigations"
                title={<>Follow the <br /> evidence</>}
                description="Every investigation comes in two forms: the video, and the full research report in English and Hindi with every source behind it."
            />
            <InvestigationLibrary investigations={investigations} />
        </>
    );
}
