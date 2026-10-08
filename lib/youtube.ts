/**
 * YouTube Data API v3 — server only (the API key never reaches the browser).
 *
 * Env:
 *   YOUTUBE_API_KEY   Google Cloud API key with "YouTube Data API v3" enabled
 *   YOUTUBE_CHANNEL   channel handle (@HarshBhosale) or channel id (UC…)
 *
 * One overview costs 4 quota units (default quota: 10,000/day) and is cached
 * for 10 minutes.
 */

const API = "https://www.googleapis.com/youtube/v3";
const REVALIDATE_SECONDS = 600;
const RECENT_VIDEO_COUNT = 10;

export type YouTubeVideo = {
    id: string;
    title: string;
    url: string;
    thumbnail: string | null;
    publishedAt: string;
    durationSeconds: number;
    views: number;
    likes: number | null; // null when the owner hides likes
    comments: number | null; // null when comments are off
};

export type YouTubeComment = {
    id: string;
    author: string;
    authorAvatar: string | null;
    text: string;
    publishedAt: string;
    likes: number;
    videoId: string;
};

export type YouTubeOverview = {
    channel: {
        id: string;
        title: string;
        handle: string | null;
        thumbnail: string | null;
        url: string;
        subscribers: number | null; // null when the count is hidden
        views: number;
        videoCount: number;
    };
    videos: YouTubeVideo[];
    comments: YouTubeComment[];
    commentsError: string | null;
};

export type YouTubeResult =
    | { status: "unconfigured" }
    | { status: "error"; message: string }
    | { status: "ok"; data: YouTubeOverview };

class YouTubeError extends Error {}

async function youtube<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(`${API}/${path}`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    url.searchParams.set("key", process.env.YOUTUBE_API_KEY!);

    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
        // Google's message only — never the URL, which contains the key
        const reason: string | undefined = body?.error?.details?.[0]?.reason ?? body?.error?.errors?.[0]?.reason;
        throw new YouTubeError(
            (reason && KNOWN_ERRORS[reason]) ?? body?.error?.message ?? `YouTube API request failed (${res.status})`
        );
    }
    return body as T;
}

/** Google error reasons → what to change */
const KNOWN_ERRORS: Record<string, string> = {
    API_KEY_HTTP_REFERRER_BLOCKED:
        "Your API key only allows websites (HTTP referrer restriction), but this dashboard calls YouTube from the server. " +
        "In Google Cloud Console → APIs & Services → Credentials → your key: set Application restrictions to None " +
        "(or IP addresses), keep API restrictions on YouTube Data API v3, then Save and wait a few minutes.",
    API_KEY_INVALID: "The YOUTUBE_API_KEY in .env is not a valid API key. Copy it again from Google Cloud Console.",
    API_KEY_SERVICE_BLOCKED:
        "This API key isn't allowed to use YouTube Data API v3. Add it under the key's API restrictions.",
    SERVICE_DISABLED: "YouTube Data API v3 is not enabled for this Google Cloud project. Enable it in APIs & Services → Library.",
    quotaExceeded: "The daily YouTube API quota is used up. It resets at midnight Pacific Time.",
};

const num = (value: string | undefined) => (value === undefined ? null : Number(value));

/** ISO 8601 duration (PT1H2M3S) → seconds */
function parseDuration(iso: string | undefined) {
    const match = iso?.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const [, d, h, m, s] = match.map((part) => Number(part ?? 0));
    return d * 86400 + h * 3600 + m * 60 + s;
}

type Thumbnails = Record<string, { url: string } | undefined>;
const bestThumbnail = (t: Thumbnails | undefined) => (t?.medium ?? t?.high ?? t?.default)?.url ?? null;

type ChannelResponse = {
    items?: {
        id: string;
        snippet: { title: string; customUrl?: string; thumbnails?: Thumbnails };
        statistics: { viewCount: string; subscriberCount?: string; hiddenSubscriberCount: boolean; videoCount: string };
        contentDetails: { relatedPlaylists: { uploads: string } };
    }[];
};

type PlaylistResponse = { items?: { contentDetails: { videoId: string } }[] };

type VideosResponse = {
    items?: {
        id: string;
        snippet: { title: string; publishedAt: string; thumbnails?: Thumbnails };
        contentDetails: { duration: string };
        statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
    }[];
};

type CommentsResponse = {
    items?: {
        id: string;
        snippet: {
            videoId: string;
            topLevelComment: {
                snippet: {
                    authorDisplayName: string;
                    authorProfileImageUrl?: string;
                    textDisplay: string;
                    likeCount: number;
                    publishedAt: string;
                };
            };
        };
    }[];
};

export async function getYouTubeOverview(): Promise<YouTubeResult> {
    const channelRef = process.env.YOUTUBE_CHANNEL?.trim();
    if (!process.env.YOUTUBE_API_KEY || !channelRef) return { status: "unconfigured" };

    try {
        const lookup: Record<string, string> = channelRef.startsWith("UC")
            ? { id: channelRef }
            : { forHandle: channelRef };
        const channels = await youtube<ChannelResponse>("channels", {
            part: "snippet,statistics,contentDetails",
            ...lookup,
        });

        const channel = channels.items?.[0];
        if (!channel) return { status: "error", message: `No YouTube channel found for "${channelRef}"` };

        const uploads = await youtube<PlaylistResponse>("playlistItems", {
            part: "contentDetails",
            playlistId: channel.contentDetails.relatedPlaylists.uploads,
            maxResults: String(RECENT_VIDEO_COUNT),
        });

        const ids = uploads.items?.map((item) => item.contentDetails.videoId) ?? [];

        const [videos, comments] = await Promise.all([
            ids.length
                ? youtube<VideosResponse>("videos", { part: "snippet,statistics,contentDetails", id: ids.join(",") })
                : Promise.resolve<VideosResponse>({ items: [] }),
            // Comments can be disabled channel-wide — don't fail the whole overview
            youtube<CommentsResponse>("commentThreads", {
                part: "snippet",
                allThreadsRelatedToChannelId: channel.id,
                order: "time",
                maxResults: "6",
                textFormat: "plainText",
            }).catch((err: unknown) => (err instanceof Error ? err : new Error(String(err)))),
        ]);

        return {
            status: "ok",
            data: {
                channel: {
                    id: channel.id,
                    title: channel.snippet.title,
                    handle: channel.snippet.customUrl ?? null,
                    thumbnail: bestThumbnail(channel.snippet.thumbnails),
                    url: channel.snippet.customUrl
                        ? `https://www.youtube.com/${channel.snippet.customUrl}`
                        : `https://www.youtube.com/channel/${channel.id}`,
                    subscribers: channel.statistics.hiddenSubscriberCount ? null : num(channel.statistics.subscriberCount),
                    views: Number(channel.statistics.viewCount),
                    videoCount: Number(channel.statistics.videoCount),
                },
                // Keep upload order (newest first)
                videos: ids.flatMap((id) => {
                    const v = videos.items?.find((item) => item.id === id);
                    if (!v) return [];
                    return [{
                        id: v.id,
                        title: v.snippet.title,
                        url: `https://www.youtube.com/watch?v=${v.id}`,
                        thumbnail: bestThumbnail(v.snippet.thumbnails),
                        publishedAt: v.snippet.publishedAt,
                        durationSeconds: parseDuration(v.contentDetails.duration),
                        views: Number(v.statistics.viewCount ?? 0),
                        likes: num(v.statistics.likeCount),
                        comments: num(v.statistics.commentCount),
                    }];
                }),
                comments:
                    comments instanceof Error
                        ? []
                        : (comments.items ?? []).map((thread) => {
                            const c = thread.snippet.topLevelComment.snippet;
                            return {
                                id: thread.id,
                                author: c.authorDisplayName,
                                authorAvatar: c.authorProfileImageUrl ?? null,
                                text: c.textDisplay,
                                publishedAt: c.publishedAt,
                                likes: c.likeCount,
                                videoId: thread.snippet.videoId,
                            };
                        }),
                commentsError: comments instanceof Error ? comments.message : null,
            },
        };
    } catch (err) {
        console.error("[youtube] overview failed:", err);
        return {
            status: "error",
            message: err instanceof YouTubeError ? err.message : "Could not reach the YouTube API",
        };
    }
}
