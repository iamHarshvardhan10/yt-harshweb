import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  ExternalLink,
  Eye,
  FileText,
  Home,
  Info,
  Lightbulb,
  MessageCircle,
  Play,
  Scissors,
  Search,
  ThumbsUp,
  Users,
  Video,
} from "lucide-react";

import { getAdminUser } from "@/lib/auth/dal";
import { getYouTubeOverview, type YouTubeOverview } from "@/lib/youtube";
import UploadViewsChart from "@/components/dashboard/overview/UploadViewsChart";
import { compact } from "@/lib/format";

// Pipeline and schedule have no backend yet — shown as a preview of the layout
const pipeline = [
  { title: "North Korea's Hidden Economy", status: "Research", icon: Search },
  { title: "India's Education Budget", status: "Script", icon: FileText },
  { title: "Nepal Glacier Flood Crisis", status: "Editing", icon: Scissors },
  { title: "FSSAI Food Safety", status: "Idea", icon: Lightbulb },
];

const upcoming = [
  { title: "North Korea's Hidden Economy", date: "Sep 15", type: "Long Video" },
  { title: "What Happens If A Himalayan Glacier Collapses?", date: "Sep 18", type: "Short" },
  { title: "India's Education Budget Explained", date: "Sep 21", type: "Investigation" },
];

const full = new Intl.NumberFormat("en");
const shortDate = new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" });

function relativeTime(iso: string) {
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return shortDate.format(new Date(iso));
}

function duration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

const sum = (values: (number | null)[]) => values.reduce<number>((total, v) => total + (v ?? 0), 0);


export default async function DashboardPage() {
  // proxy.ts only checks that a cookie exists — confirm the session here
  const admin = await getAdminUser();
  if (!admin) redirect("/login?next=/dashboard");

  const youtube = await getYouTubeOverview();
  const firstName = admin.name.split(/\s+/)[0];

  return (
    <div className="min-h-full bg-zinc-50 p-6 dark:bg-black md:p-8">

      {/* HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-red-500">
            CREATOR DASHBOARD
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back, {firstName}. Here&apos;s what&apos;s happening with your channel.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="https://studio.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <ExternalLink size={16} />
            YouTube Studio
          </a>

          <Link
            href="/dashboard/investigations"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <FileText size={16} />
            Investigations
          </Link>
        </div>
      </div>

      {youtube.status === "ok" ? (
        <ChannelOverview data={youtube.data} />
      ) : (
        <YouTubeSetup error={youtube.status === "error" ? youtube.message : null} />
      )}

      {/* LOWER GRID */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">

        {/* CONTENT PIPELINE */}
        <section className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <SectionHeader title="Content Pipeline" description="Current investigations" preview />

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {pipeline.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                      <Icon size={16} />
                    </div>

                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{item.status}</p>
                    </div>
                  </div>

                  <ArrowUpRight size={15} className="text-zinc-400" />
                </div>
              );
            })}
          </div>
        </section>

        {/* UPCOMING */}
        <section className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <SectionHeader title="Upcoming Content" description="Scheduled publications" preview />

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {upcoming.map((item) => (
              <div key={item.title} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{item.type}</p>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-red-500">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* QUICK ACTIONS */}
      <section className="mt-6 border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-5">
          <h2 className="font-semibold">Quick Actions</h2>
          <p className="mt-1 text-xs text-zinc-500">Manage your creator workflow</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/home"
            className="flex items-center gap-3 rounded-lg bg-red-600 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Home size={17} />
            Edit Home Page
          </Link>

          <QuickLink href="/dashboard/about" icon={<Info size={17} />}>Edit About Page</QuickLink>
          <QuickLink href="/dashboard/investigations" icon={<FileText size={17} />}>Investigations</QuickLink>
          <QuickLink href="https://studio.youtube.com" external icon={<Video size={17} />}>Upload in YouTube Studio</QuickLink>
        </div>
      </section>

    </div>
  );
}


/* =============================================================
   YOUTUBE BLOCKS
============================================================= */

function ChannelOverview({ data }: { data: YouTubeOverview }) {
  const { channel, videos, comments } = data;
  const recentLikes = sum(videos.map((v) => v.likes));
  const recentComments = sum(videos.map((v) => v.comments));
  const recentViews = sum(videos.map((v) => v.views));
  const recentLabel = `last ${videos.length} uploads`;

  const stats = [
    { label: "Subscribers", value: channel.subscribers === null ? "Hidden" : compact(channel.subscribers), note: "all time", icon: Users },
    { label: "Total Views", value: compact(channel.views), note: "all time", icon: Eye },
    { label: "Videos", value: full.format(channel.videoCount), note: "published", icon: Video },
    { label: "Recent Views", value: compact(recentViews), note: recentLabel, icon: Play },
    { label: "Recent Likes", value: compact(recentLikes), note: recentLabel, icon: ThumbsUp },
    { label: "Recent Comments", value: compact(recentComments), note: recentLabel, icon: MessageCircle },
  ];

  const top = videos.length ? videos.reduce((best, v) => (v.views > best.views ? v : best)) : null;
  const average = videos.length ? recentViews / videos.length : 0;

  return (
    <>
      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
                <Icon size={17} className="text-zinc-400" />
              </div>

              <div className="mt-4">
                <h2 className="text-2xl font-semibold">{stat.value}</h2>
                <p className="mt-1 text-xs text-zinc-500">{stat.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* PERFORMANCE + CHANNEL */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">

        <section className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <SectionHeader title="Views on Latest Uploads" description={`Each of your ${recentLabel}, newest first`} />

          <div className="p-5">
            {videos.length ? (
              <UploadViewsChart videos={videos} />
            ) : (
              <p className="py-10 text-center text-sm text-zinc-500">No public uploads yet.</p>
            )}
          </div>
        </section>

        <section className="border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            {channel.thumbnail && (
              <Image src={channel.thumbnail} alt="" width={44} height={44} className="rounded-full" />
            )}
            <div className="min-w-0">
              <h2 className="truncate font-semibold">{channel.title}</h2>
              {channel.handle && <p className="mt-0.5 truncate text-xs text-zinc-500">{channel.handle}</p>}
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <a
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              View channel
              <ExternalLink size={13} />
            </a>
            <a
              href="https://studio.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Studio
              <ExternalLink size={13} />
            </a>
          </div>

          {top && (
            <div className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <p className="text-xs text-zinc-500">Most viewed recent upload</p>
              <a href={top.url} target="_blank" rel="noopener noreferrer" className="mt-1 line-clamp-2 font-medium hover:text-red-500">
                {top.title}
              </a>
              <p className="mt-1 text-xs text-red-500">
                {full.format(top.views)} views · {(top.views / average).toFixed(1)}× the recent average
              </p>
            </div>
          )}

          <p className="mt-6 text-[11px] leading-4 text-zinc-400">
            Watch time and retention need YouTube Analytics (Google sign-in) and aren&apos;t connected yet.
            Data refreshes every 10 minutes.
          </p>
        </section>
      </div>

      {/* RECENT VIDEOS */}
      <section className="mt-6 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div>
            <h2 className="font-semibold">Recent Videos</h2>
            <p className="mt-1 text-xs text-zinc-500">Latest published videos</p>
          </div>

          <a href={channel.url + "/videos"} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-red-500 hover:text-red-400">
            View all
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium">Video</th>
                <th className="px-5 py-3 font-medium">Published</th>
                <th className="px-5 py-3 text-right font-medium">Views</th>
                <th className="px-5 py-3 text-right font-medium">Likes</th>
                <th className="px-5 py-3 text-right font-medium">Comments</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {videos.map((video) => (
                <tr key={video.id} className="transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-5 py-4">
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3">
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-900">
                        {video.thumbnail ? (
                          <Image src={video.thumbnail} alt="" fill sizes="80px" className="object-cover" />
                        ) : (
                          <Play size={16} className="absolute inset-0 m-auto text-white" fill="white" />
                        )}
                        <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 text-[9px] tabular-nums text-white">
                          {duration(video.durationSeconds)}
                        </span>
                      </div>

                      <p className="max-w-[320px] truncate font-medium group-hover:text-red-500">{video.title}</p>
                    </a>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-xs text-zinc-500">{shortDate.format(new Date(video.publishedAt))}</td>
                  <td className="px-5 py-4 text-right font-medium tabular-nums">{full.format(video.views)}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-zinc-500">{video.likes === null ? "hidden" : full.format(video.likes)}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-zinc-500">{video.comments === null ? "off" : full.format(video.comments)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RECENT COMMENTS */}
      <section className="mt-6 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <SectionHeader title="Recent Comments" description="Newest comments across your channel" />

        {data.commentsError ? (
          <p className="px-5 py-6 text-xs text-zinc-500">Comments unavailable: {data.commentsError}</p>
        ) : comments.length === 0 ? (
          <p className="px-5 py-6 text-xs text-zinc-500">No comments yet.</p>
        ) : (
          <div className="grid divide-y divide-zinc-200 dark:divide-zinc-800 md:grid-cols-2 md:divide-y-0 xl:grid-cols-3">
            {comments.map((comment) => {
              const video = videos.find((v) => v.id === comment.videoId);

              return (
                <a
                  key={comment.id}
                  href={`https://www.youtube.com/watch?v=${comment.videoId}&lc=${comment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-5 py-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {comment.authorAvatar && (
                        <Image src={comment.authorAvatar} alt="" width={24} height={24} className="rounded-full" />
                      )}
                      <p className="truncate text-sm font-medium">{comment.author}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-zinc-400">{relativeTime(comment.publishedAt)}</span>
                  </div>

                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{comment.text}</p>

                  {video && <p className="mt-2 truncate text-[10px] text-red-500">{video.title}</p>}
                </a>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function YouTubeSetup({ error }: { error: string | null }) {
  return (
    <section className="border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="font-semibold">{error ? "Couldn't load YouTube data" : "Connect your YouTube channel"}</h2>

      {error ? (
        <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-zinc-500">Channel stats, recent videos and comments appear here once an API key is set.</p>
      )}

      {!error && (
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
          <li>In Google Cloud Console, enable <strong>YouTube Data API v3</strong> and create an API key with Application restrictions set to <strong>None</strong>.</li>
          <li>In <code>.env</code>, set <code>YOUTUBE_API_KEY=&quot;your-key&quot;</code> and <code>YOUTUBE_CHANNEL=&quot;@HarshBhosale&quot;</code>.</li>
          <li>Restart <code>npm run dev</code> so the new values are loaded.</li>
        </ol>
      )}
    </section>
  );
}


/* =============================================================
   SMALL PIECES
============================================================= */

function SectionHeader({ title, description, preview }: { title: string; description: string; preview?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </div>

      {preview && (
        <span
          title="Sample data — this section isn't connected to a backend yet"
          className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-medium text-zinc-500 dark:bg-zinc-900"
        >
          Sample data
        </span>
      )}
    </div>
  );
}

function QuickLink({
  href,
  icon,
  external,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  external?: boolean;
  children: React.ReactNode;
}) {
  const className =
    "flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-left text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900";

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {icon}
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {icon}
      {children}
    </Link>
  );
}
