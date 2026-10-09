import type { Metadata } from "next";

import PageHero from "@/components/common/PageHero";
import VideoLibrary from "@/components/core/Videos/VideoLibrary";
import { getPublicVideos } from "@/lib/videos/queries";

export const metadata: Metadata = {
    title: "Videos - Harsh Bhosale",
    description: "Long-form investigations, explainers and shorts.",
};

// Uploads come from the YouTube API (cached 10 minutes); settings from /dashboard/videos
export default async function VideosPage() {
    const { videos, channelUrl } = await getPublicVideos();

    return (
        <>
            <PageHero
                eyebrow="Videos"
                title={<>Watch the <br /> full story</>}
                description="Long-form investigations and explainers, plus quick shorts that get straight to the point."
            />
            <VideoLibrary videos={videos} channelUrl={channelUrl} />
        </>
    );
}
