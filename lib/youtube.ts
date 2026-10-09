/**
 * YouTube Data API v3 — server only (the API key never reaches the browser).
 *
 * Env:
 *   YOUTUBE_API_KEY   Google Cloud API key with "YouTube Data API v3" enabled
 *   YOUTUBE_CHANNEL   channel handle (@HarshBhosale) or channel id (UC…)
 *
 * One overview costs 4 quota units (default quota: 10,000/day); the uploads
 * list costs ~1 unit per 50 uploads. Responses are cached for 10 minutes —
 * expire YOUTUBE_CACHE_TAG to force a re-fetch.
 */

const API = "https://www.googleapis.com/youtube/v3";
const REVALIDATE_SECONDS = 600;
const RECENT_VIDEO_COUNT = 10;
const MAX_UPLOADS = 200;
const PAGE_SIZE = 50; // API maximum for playlistItems and videos

export const YOUTUBE_CACHE_TAG = "youtube";

export type YouTubeVideo = {
    id: string;
    title: string;
    url: string;
    thumbnail: string | null;
    /** sharpest available (up to 1280×720) — for large cards on the website */
    thumbnailHd: string | null;
    /** start of the YouTube description, up to DESCRIPTION_LENGTH characters */
    description: string;
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

export type YouTubeChannel = {
    id: string;
    title: string;
    handle: string | null;
    thumbnail: string | null;
    url: string;
    subscribers: number | null; // null when the count is hidden
    views: number;
    videoCount: number;
};

export type YouTubeOverview = {
    channel: YouTubeChannel;
    videos: YouTubeVideo[];
    comments: YouTubeComment[];
    commentsError: string | null;
};

export type YouTubeUpload = YouTubeVideo & { type: "video" | "short" };

export type YouTubeUploads = {
    uploads: YouTubeUpload[];
    /** true when the channel has more than MAX_UPLOADS uploads and older ones were left out */
    truncated: boolean;
    channelUrl: string;
    channel: YouTubeChannel;
};

export type YouTubeThread = YouTubeComment & {
    authorChannelUrl: string | null;
    /** written by the channel itself */
    isOwner: boolean;
    replyCount: number;
    /** your newest reply among the replies the API returns (up to 5 per thread) */
    ownerReply: { text: string; publishedAt: string } | null;
};

export type YouTubeComments = {
    channel: YouTubeChannel;
    threads: YouTubeThread[]; // newest first
    /** titles of the videos the comments are on */
    videos: Record<string, { title: string; url: string }>;
    /** true when there are more than MAX_COMMENT_THREADS and older ones were left out */
    truncated: boolean;
};

export type YouTubeResult<T = YouTubeOverview> =
    | { status: "unconfigured" }
    | { status: "error"; message: string }
    | { status: "ok"; data: T };

class YouTubeError extends Error {
    readonly reason?: string;

    constructor(message: string, reason?: string) {
        super(message);
        this.reason = reason;
    }
}

async function youtube<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(`${API}/${path}`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    url.searchParams.set("key", process.env.YOUTUBE_API_KEY!);

    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS, tags: [YOUTUBE_CACHE_TAG] } });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
        // Google's message only — never the URL, which contains the key
        const reason: string | undefined = body?.error?.details?.[0]?.reason ?? body?.error?.errors?.[0]?.reason;
        throw new YouTubeError(
            (reason && KNOWN_ERRORS[reason]) ?? body?.error?.message ?? `YouTube API request failed (${res.status})`,
            reason
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
const hdThumbnail = (t: Thumbnails | undefined) =>
    (t?.maxres ?? t?.standard ?? t?.high ?? t?.medium ?? t?.default)?.url ?? null;

const DESCRIPTION_LENGTH = 280;

/** First lines of a description, without links and hashtags, cut at a word. */
function shortDescription(text: string | undefined) {
    const clean = (text ?? "")
        .split("\n")
        .map((line) => line.replace(/https?:\/\/\S+/g, "").replace(/(^|\s)#[\p{L}\p{N}_]+/gu, "").trim())
        .filter(Boolean)
        .join(" ");
    if (clean.length <= DESCRIPTION_LENGTH) return clean;
    const cut = clean.slice(0, DESCRIPTION_LENGTH);
    return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : DESCRIPTION_LENGTH)}…`;
}

type ChannelResponse = {
    items?: {
        id: string;
        snippet: { title: string; customUrl?: string; thumbnails?: Thumbnails };
        statistics: { viewCount: string; subscriberCount?: string; hiddenSubscriberCount: boolean; videoCount: string };
        contentDetails: { relatedPlaylists: { uploads: string } };
    }[];
};

type Channel = NonNullable<ChannelResponse["items"]>[number];

type PlaylistResponse = { items?: { contentDetails: { videoId: string } }[]; nextPageToken?: string };

type VideoItem = {
    id: string;
    snippet: { title: string; description?: string; publishedAt: string; thumbnails?: Thumbnails };
    contentDetails: { duration: string };
    statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
};

type VideosResponse = { items?: VideoItem[] };

type CommentSnippet = {
    authorDisplayName: string;
    authorProfileImageUrl?: string;
    authorChannelUrl?: string;
    authorChannelId?: { value: string };
    textDisplay: string;
    likeCount: number;
    publishedAt: string;
};

type CommentsResponse = {
    items?: {
        id: string;
        snippet: {
            videoId: string;
            totalReplyCount?: number;
            topLevelComment: { snippet: CommentSnippet };
        };
        replies?: { comments: { snippet: CommentSnippet }[] };
    }[];
    nextPageToken?: string;
};

const channelUrl = (channel: Channel) =>
    channel.snippet.customUrl
        ? `https://www.youtube.com/${channel.snippet.customUrl}`
        : `https://www.youtube.com/channel/${channel.id}`;

function channelSummary(channel: Channel): YouTubeChannel {
    return {
        id: channel.id,
        title: channel.snippet.title,
        handle: channel.snippet.customUrl ?? null,
        thumbnail: bestThumbnail(channel.snippet.thumbnails),
        url: channelUrl(channel),
        subscribers: channel.statistics.hiddenSubscriberCount ? null : num(channel.statistics.subscriberCount),
        views: Number(channel.statistics.viewCount),
        videoCount: Number(channel.statistics.videoCount),
    };
}

function toVideo(v: VideoItem): YouTubeVideo {
    return {
        id: v.id,
        title: v.snippet.title,
        url: `https://www.youtube.com/watch?v=${v.id}`,
        thumbnail: bestThumbnail(v.snippet.thumbnails),
        thumbnailHd: hdThumbnail(v.snippet.thumbnails),
        description: shortDescription(v.snippet.description),
        publishedAt: v.snippet.publishedAt,
        durationSeconds: parseDuration(v.contentDetails.duration),
        views: Number(v.statistics.viewCount ?? 0),
        likes: num(v.statistics.likeCount),
        comments: num(v.statistics.commentCount),
    };
}

/**
 * The channel's public link straight from YOUTUBE_CHANNEL — no API call, so
 * it's free to use in the footer of every page. null when it isn't set.
 */
export function getChannelLink(): { url: string; label: string } | null {
    const ref = process.env.YOUTUBE_CHANNEL?.trim();
    if (!ref) return null;
    if (ref.startsWith("UC")) return { url: `https://www.youtube.com/channel/${ref}`, label: "YouTube" };
    const handle = ref.startsWith("@") ? ref : `@${ref}`;
    return { url: `https://www.youtube.com/${handle}`, label: handle };
}

/** Runs a YouTube call only when YOUTUBE_API_KEY and YOUTUBE_CHANNEL are set, mapping failures to a result. */
async function withChannel<T>(
    label: string,
    load: (channel: Channel) => Promise<T>
): Promise<YouTubeResult<T>> {
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

        return { status: "ok", data: await load(channel) };
    } catch (err) {
        console.error(`[youtube] ${label} failed:`, err);
        return {
            status: "error",
            message: err instanceof YouTubeError ? err.message : "Could not reach the YouTube API",
        };
    }
}

/** Video ids of a playlist, newest first, up to `limit`. */
async function playlistVideoIds(playlistId: string, limit: number) {
    const ids: string[] = [];
    let pageToken: string | undefined;

    do {
        const page = await youtube<PlaylistResponse>("playlistItems", {
            part: "contentDetails",
            playlistId,
            maxResults: String(Math.min(PAGE_SIZE, limit - ids.length)),
            ...(pageToken && { pageToken }),
        });
        ids.push(...(page.items ?? []).map((item) => item.contentDetails.videoId));
        pageToken = page.nextPageToken;
    } while (pageToken && ids.length < limit);

    return { ids, more: Boolean(pageToken) };
}

/** Full details for any number of ids, in batches of 50, keeping the given order. */
async function videoDetails(ids: string[]) {
    const batches: string[][] = [];
    for (let i = 0; i < ids.length; i += PAGE_SIZE) batches.push(ids.slice(i, i + PAGE_SIZE));

    const responses = await Promise.all(
        batches.map((batch) =>
            youtube<VideosResponse>("videos", { part: "snippet,statistics,contentDetails", id: batch.join(",") })
        )
    );
    const byId = new Map(responses.flatMap((r) => r.items ?? []).map((item) => [item.id, item]));
    return ids.flatMap((id) => {
        const item = byId.get(id);
        return item ? [item] : [];
    });
}

/**
 * Ids of the channel's Shorts. The API has no "is short" flag, but every channel
 * has a Shorts-only uploads playlist: UU… → UUSH…. Returns null if it can't be read.
 */
async function shortIds(uploadsPlaylistId: string): Promise<Set<string> | null> {
    try {
        const { ids } = await playlistVideoIds(`UUSH${uploadsPlaylistId.slice(2)}`, MAX_UPLOADS);
        return new Set(ids);
    } catch (err) {
        // A channel that has never posted a Short has no Shorts playlist
        if (err instanceof YouTubeError && err.reason === "playlistNotFound") return new Set();
        console.error("[youtube] shorts playlist failed, falling back to duration:", err);
        return null;
    }
}

const SHORT_MAX_SECONDS = 180;

/** Every public upload (videos and Shorts), newest first, up to MAX_UPLOADS. */
export function getChannelUploads(): Promise<YouTubeResult<YouTubeUploads>> {
    return withChannel("uploads", async (channel) => {
        const uploadsPlaylist = channel.contentDetails.relatedPlaylists.uploads;

        const [{ ids, more }, shorts] = await Promise.all([
            playlistVideoIds(uploadsPlaylist, MAX_UPLOADS),
            shortIds(uploadsPlaylist),
        ]);
        const items = await videoDetails(ids);

        return {
            uploads: items.map((item) => {
                const video = toVideo(item);
                const isShort = shorts
                    ? shorts.has(video.id)
                    : video.durationSeconds > 0 && video.durationSeconds <= SHORT_MAX_SECONDS;

                return isShort
                    ? { ...video, type: "short" as const, url: `https://www.youtube.com/shorts/${video.id}` }
                    : { ...video, type: "video" as const };
            }),
            truncated: more,
            channelUrl: channelUrl(channel),
            channel: channelSummary(channel),
        };
    });
}

const MAX_COMMENT_THREADS = 300;

/**
 * Newest comment threads across every upload (public comments only — held or
 * spam comments need the channel owner's sign-in). ~1 quota unit per 100.
 */
export function getChannelComments(): Promise<YouTubeResult<YouTubeComments>> {
    return withChannel("comments", async (channel) => {
        const items: NonNullable<CommentsResponse["items"]> = [];
        let pageToken: string | undefined;

        do {
            const page = await youtube<CommentsResponse>("commentThreads", {
                part: "snippet,replies",
                allThreadsRelatedToChannelId: channel.id,
                order: "time",
                maxResults: "100",
                textFormat: "plainText",
                ...(pageToken && { pageToken }),
            });
            items.push(...(page.items ?? []));
            pageToken = page.nextPageToken;
        } while (pageToken && items.length < MAX_COMMENT_THREADS);

        const byOwner = (c: CommentSnippet) => c.authorChannelId?.value === channel.id;

        const threads: YouTubeThread[] = items.slice(0, MAX_COMMENT_THREADS).map((thread) => {
            const c = thread.snippet.topLevelComment.snippet;
            // Replies come oldest first; take the owner's newest
            const reply = thread.replies?.comments.map((r) => r.snippet).filter(byOwner).at(-1);

            return {
                id: thread.id,
                author: c.authorDisplayName,
                authorAvatar: c.authorProfileImageUrl ?? null,
                authorChannelUrl: c.authorChannelUrl ?? null,
                text: c.textDisplay,
                publishedAt: c.publishedAt,
                likes: c.likeCount,
                videoId: thread.snippet.videoId,
                isOwner: byOwner(c),
                replyCount: thread.snippet.totalReplyCount ?? 0,
                ownerReply: reply ? { text: reply.textDisplay, publishedAt: reply.publishedAt } : null,
            };
        });

        const videos = await getVideosByIds(threads.map((t) => t.videoId));

        return {
            channel: channelSummary(channel),
            threads,
            videos: Object.fromEntries([...videos].map(([id, v]) => [id, { title: v.title, url: v.url }])),
            truncated: Boolean(pageToken) || items.length > MAX_COMMENT_THREADS,
        };
    });
}

/**
 * Details for specific videos (any channel), keyed by id. Missing or private
 * videos are left out, and any failure returns an empty map — callers fall back
 * to the id alone.
 */
export async function getVideosByIds(ids: string[]): Promise<Map<string, YouTubeVideo>> {
    const unique = [...new Set(ids)];
    if (!process.env.YOUTUBE_API_KEY || unique.length === 0) return new Map();

    try {
        const items = await videoDetails(unique);
        return new Map(items.map((item) => [item.id, toVideo(item)]));
    } catch (err) {
        console.error("[youtube] video lookup failed:", err);
        return new Map();
    }
}

export function getYouTubeOverview(): Promise<YouTubeResult> {
    return withChannel("overview", async (channel) => {
        const { ids } = await playlistVideoIds(channel.contentDetails.relatedPlaylists.uploads, RECENT_VIDEO_COUNT);

        const [videos, comments] = await Promise.all([
            videoDetails(ids),
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
            channel: channelSummary(channel),
            // Keep upload order (newest first)
            videos: videos.map(toVideo),
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
        };
    });
}
