
"use client";

import {
  ArrowUpRight,
  Eye,
  MessageCircle,
  ThumbsUp,
  Users,
  Video,
  Clock3,
  MoreHorizontal,
  Play,
  Plus,
  CalendarDays,
  Lightbulb,
  FileText,
  Search,
  Scissors,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    label: "Total Videos",
    value: "24",
    change: "+3 this month",
    icon: Video,
  },
  {
    label: "Total Views",
    value: "1.2M",
    change: "+18.4%",
    icon: Eye,
  },
  {
    label: "Subscribers",
    value: "12.4K",
    change: "+8.2%",
    icon: Users,
  },
  {
    label: "Comments",
    value: "842",
    change: "+12.6%",
    icon: MessageCircle,
  },
  {
    label: "Watch Time",
    value: "18.6K hrs",
    change: "+14.8%",
    icon: Clock3,
  },
  {
    label: "Likes",
    value: "42.8K",
    change: "+11.3%",
    icon: ThumbsUp,
  },
];

const videos = [
  {
    title: "The Truth Behind India's E20 Fuel",
    type: "Investigation",
    views: "324K",
    likes: "12.8K",
    comments: "842",
    date: "Sep 08, 2026",
  },
  {
    title: "Why Mumbai Floods Every Monsoon",
    type: "Investigation",
    views: "218K",
    likes: "8.4K",
    comments: "516",
    date: "Sep 03, 2026",
  },
  {
    title: "Can India Handle Another Himalayan Flood?",
    type: "Explainer",
    views: "156K",
    likes: "6.1K",
    comments: "291",
    date: "Aug 29, 2026",
  },
  {
    title: "Why Paper Leaks Keep Happening in India",
    type: "Investigation",
    views: "98K",
    likes: "4.7K",
    comments: "183",
    date: "Aug 22, 2026",
  },
];

const pipeline = [
  {
    title: "North Korea's Hidden Economy",
    status: "Research",
    icon: Search,
  },
  {
    title: "India's Education Budget",
    status: "Script",
    icon: FileText,
  },
  {
    title: "Nepal Glacier Flood Crisis",
    status: "Editing",
    icon: Scissors,
  },
  {
    title: "FSSAI Food Safety",
    status: "Idea",
    icon: Lightbulb,
  },
];

const comments = [
  {
    user: "Rahul Sharma",
    comment: "This explained the E20 issue really well.",
    video: "The Truth Behind India's E20 Fuel",
    time: "12 min ago",
  },
  {
    user: "Aman Verma",
    comment: "Can you make a video about EV battery recycling?",
    video: "Why Mumbai Floods Every Monsoon",
    time: "38 min ago",
  },
  {
    user: "Priya Singh",
    comment: "The data sources were very helpful.",
    video: "Can India Handle Another Himalayan Flood?",
    time: "1 hr ago",
  },
];

const upcoming = [
  {
    title: "North Korea's Hidden Economy",
    date: "Sep 15",
    type: "Long Video",
  },
  {
    title: "What Happens If A Himalayan Glacier Collapses?",
    date: "Sep 18",
    type: "Short",
  },
  {
    title: "India's Education Budget Explained",
    date: "Sep 21",
    type: "Investigation",
  },
];

export default function DashboardPage() {
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
            Welcome back, Harsh. Here's what's happening with your channel.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
            <CalendarDays size={16} />
            September 2026
          </button>

          <button className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700">
            <Plus size={16} />
            New Investigation
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500">
                  {stat.label}
                </p>

                <Icon
                  size={17}
                  className="text-zinc-400"
                />
              </div>

              <div className="mt-4">
                <h2 className="text-2xl font-semibold">
                  {stat.value}
                </h2>

                <p className="mt-1 text-xs font-medium text-red-500">
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ANALYTICS + CHANNEL HEALTH */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">

        {/* ANALYTICS */}
        <section className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <div>
              <h2 className="font-semibold">
                Channel Performance
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Views and subscriber growth
              </p>
            </div>

            <select className="rounded-md border border-zinc-200 bg-transparent px-3 py-1.5 text-xs dark:border-zinc-800">
              <option>Last 28 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select>
          </div>

          <div className="p-5">

            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs text-zinc-500">
                  Total Views
                </p>

                <p className="mt-1 text-3xl font-semibold">
                  1,284,392
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-zinc-500">
                  Subscribers
                </p>

                <p className="mt-1 text-xl font-semibold">
                  +1,284
                </p>
              </div>
            </div>

            {/* SIMPLE GRAPH */}
            <div className="relative h-56 w-full overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-900">

              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800" />
                <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800" />
                <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800" />
                <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800" />
              </div>

              <svg
                viewBox="0 0 1000 250"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full px-4"
              >
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  points="
                    0,210
                    80,195
                    160,205
                    240,160
                    320,175
                    400,130
                    480,145
                    560,105
                    640,120
                    720,75
                    800,90
                    880,45
                    1000,60
                  "
                  className="text-red-500"
                />
              </svg>

              <div className="absolute bottom-3 left-5 right-5 flex justify-between text-[10px] text-zinc-400">
                <span>Aug 16</span>
                <span>Aug 23</span>
                <span>Aug 30</span>
                <span>Sep 06</span>
                <span>Sep 12</span>
              </div>
            </div>
          </div>
        </section>

        {/* CHANNEL HEALTH */}
        <section className="border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">
                Channel Health
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Current performance
              </p>
            </div>

            <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
              Healthy
            </span>
          </div>

          <div className="mt-6 space-y-6">

            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-zinc-500">
                  Upload consistency
                </span>

                <span className="font-medium">
                  82%
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full w-[82%] rounded-full bg-red-500" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-zinc-500">
                  Engagement
                </span>

                <span className="font-medium">
                  74%
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full w-[74%] rounded-full bg-red-500" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-zinc-500">
                  Audience retention
                </span>

                <span className="font-medium">
                  68%
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full w-[68%] rounded-full bg-red-500" />
              </div>
            </div>

          </div>

          <div className="mt-7 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">
              Best performing topic
            </p>

            <p className="mt-1 font-medium">
              Government & Policy
            </p>

            <p className="mt-1 text-xs text-red-500">
              +32% above channel average
            </p>
          </div>
        </section>
      </div>

      {/* RECENT VIDEOS */}
      <section className="mt-6 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">

          <div>
            <h2 className="font-semibold">
              Recent Videos
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Latest published videos
            </p>
          </div>

          <button className="text-sm font-medium text-red-500 hover:text-red-400">
            View all
          </button>

        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium">
                  Video
                </th>

                <th className="px-5 py-3 font-medium">
                  Published
                </th>

                <th className="px-5 py-3 font-medium">
                  Views
                </th>

                <th className="px-5 py-3 font-medium">
                  Likes
                </th>

                <th className="px-5 py-3 font-medium">
                  Comments
                </th>

                <th className="px-5 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">

              {videos.map((video) => (
                <tr
                  key={video.title}
                  className="transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">

                      <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-zinc-900">
                        <Play
                          size={16}
                          className="text-white"
                          fill="white"
                        />
                      </div>

                      <div>
                        <p className="max-w-[320px] truncate font-medium">
                          {video.title}
                        </p>

                        <span className="mt-1 inline-block text-[10px] text-red-500">
                          {video.type}
                        </span>
                      </div>

                    </div>
                  </td>

                  <td className="px-5 py-4 text-xs text-zinc-500">
                    {video.date}
                  </td>

                  <td className="px-5 py-4 font-medium">
                    {video.views}
                  </td>

                  <td className="px-5 py-4 text-zinc-500">
                    {video.likes}
                  </td>

                  <td className="px-5 py-4 text-zinc-500">
                    {video.comments}
                  </td>

                  <td className="px-5 py-4">
                    <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </section>

      {/* LOWER GRID */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">

        {/* CONTENT PIPELINE */}
        <section className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

          <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <h2 className="font-semibold">
              Content Pipeline
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Current investigations
            </p>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

            {pipeline.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center justify-between px-5 py-4"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                      <Icon size={16} />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-500">
                        {item.status}
                      </p>
                    </div>

                  </div>

                  <ArrowUpRight
                    size={15}
                    className="text-zinc-400"
                  />

                </div>
              );
            })}

          </div>
        </section>

        {/* UPCOMING */}
        <section className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="font-semibold">
              Upcoming Content
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Scheduled publications
            </p>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

            {upcoming.map((item) => (
              <div
                key={item.title}
                className="px-5 py-4"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-sm font-medium">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {item.type}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-red-500">
                    {item.date}
                  </span>

                </div>

              </div>
            ))}

          </div>

        </section>

        {/* COMMENTS */}
        <section className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">

            <div>
              <h2 className="font-semibold">
                Recent Comments
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Engage with your audience
              </p>
            </div>

            <MessageCircle
              size={18}
              className="text-zinc-400"
            />

          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

            {comments.map((comment) => (
              <div
                key={comment.user}
                className="px-5 py-4"
              >

                <div className="flex items-center justify-between">

                  <p className="text-sm font-medium">
                    {comment.user}
                  </p>

                  <span className="text-[10px] text-zinc-400">
                    {comment.time}
                  </span>

                </div>

                <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                  {comment.comment}
                </p>

                <p className="mt-2 truncate text-[10px] text-red-500">
                  {comment.video}
                </p>

              </div>
            ))}

          </div>

        </section>

      </div>

      {/* QUICK ACTIONS */}
      <section className="mt-6 border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">

        <div className="mb-5">
          <h2 className="font-semibold">
            Quick Actions
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Manage your creator workflow
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <button className="flex items-center gap-3 rounded-lg bg-red-600 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-red-700">
            <Plus size={17} />
            New Investigation
          </button>

          <button className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-left text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <Video size={17} />
            Add Video
          </button>

          <button className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-left text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <Lightbulb size={17} />
            Add Content Idea
          </button>

          <button className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-left text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <CheckCircle2 size={17} />
            Manage Content
          </button>

        </div>
      </section>

    </div>
  );
}
