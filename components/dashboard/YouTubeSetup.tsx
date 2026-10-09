/** Shown in place of YouTube data when the API isn't configured or a request failed. */
export default function YouTubeSetup({
  error,
  description = "Channel stats, recent videos and comments appear here once an API key is set.",
  className = "",
}: {
  error: string | null;
  description?: string;
  className?: string;
}) {
  return (
    <section className={`border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 ${className}`}>
      <h2 className="font-semibold">{error ? "Couldn't load YouTube data" : "Connect your YouTube channel"}</h2>

      {error ? (
        <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
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
