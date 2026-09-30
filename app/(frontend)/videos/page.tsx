import type { Metadata } from "next";

import PageHero from "@/components/common/PageHero";
import VideoLibrary from "@/components/core/Videos/VideoLibrary";

export const metadata: Metadata = {
    title: "Videos - Harsh Bhosale",
    description: "Long-form investigations, explainers and shorts.",
};

export default function VideosPage() {
    return (
        <>
            <PageHero
                eyebrow="Videos"
                title={<>Watch the <br /> full story</>}
                description="Long-form investigations and explainers, plus quick shorts that get straight to the point."
            />
            <VideoLibrary />
        </>
    );
}
