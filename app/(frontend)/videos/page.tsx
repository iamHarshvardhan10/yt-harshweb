import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

import PageHero from "@/components/common/PageHero";
import VideoLibrary from "@/components/core/Videos/VideoLibrary";
import { getPublicVideos } from "@/lib/videos/queries";

export const metadata: Metadata = pageMetadata({
    title: "Videos",
    description: "Watch every Harshwardhan Bhosale video: long-form investigations, explainers and Shorts that get straight to the point.",
    path: "/videos",
});

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
