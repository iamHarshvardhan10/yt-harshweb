// app/dashboard/page.tsx

const stats = [
  {
    label: "Total Videos",
    value: "24",
    change: "+3 this month",
  },
  {
    label: "Total Views",
    value: "1.2M",
    change: "+18.4%",
  },
  {
    label: "Comments",
    value: "842",
    change: "+12.6%",
  },
  {
    label: "Subscribers",
    value: "12.4K",
    change: "+8.2%",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-full p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-red-500">
          CREATOR DASHBOARD
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Welcome back, Harsh. Here's what's happening
          with your channel.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200
                        bg-white p-5 dark:border-zinc-800
                        dark:bg-zinc-950"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </p>

            <div className="mt-3 flex items-end justify-between">
              <h2 className="text-2xl font-semibold">
                {stat.value}
              </h2>

              <span className="text-xs font-medium text-red-500">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">

        {/* Recent Videos */}
        <section
          className="rounded-xl border border-zinc-200
                    bg-white dark:border-zinc-800
                    dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between border-b
                        border-zinc-200 px-5 py-4
                        dark:border-zinc-800"
          >
            <div>
              <h2 className="font-semibold">
                Recent Videos
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Your latest published videos
              </p>
            </div>

            <button
              className="text-sm font-medium text-red-500
                            transition hover:text-red-400"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <div className="p-5 text-sm text-zinc-500">
              Your recent YouTube videos will appear here.
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section
          className="rounded-xl border border-zinc-200
                    bg-white p-5 dark:border-zinc-800
                    dark:bg-zinc-950"
        >
          <h2 className="font-semibold">
            Quick Actions
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Manage your creator workflow
          </p>

          <div className="mt-5 space-y-3">

            <button
              className="w-full rounded-lg bg-red-600 px-4 py-3
                            text-sm font-medium text-white
                            transition hover:bg-red-700"
            >
              + New Investigation
            </button>

            <button
              className="w-full rounded-lg border
                            border-zinc-200 px-4 py-3 text-sm
                            font-medium transition hover:bg-zinc-100
                            dark:border-zinc-800
                            dark:hover:bg-zinc-900"
            >
              Add Video
            </button>

            <button
              className="w-full rounded-lg border
                            border-zinc-200 px-4 py-3 text-sm
                            font-medium transition hover:bg-zinc-100
                            dark:border-zinc-800
                            dark:hover:bg-zinc-900"
            >
              View YouTube Channel
            </button>

          </div>
        </section>

      </div>
    </div>
  );
}