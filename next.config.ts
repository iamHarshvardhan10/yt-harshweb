import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Media uploaded from the dashboard is served from Cloudinary
    remotePatterns: [
      new URL("https://res.cloudinary.com/**"),
      // YouTube thumbnails and channel / commenter avatars
      new URL("https://i.ytimg.com/**"),
      new URL("https://yt3.ggpht.com/**"),
    ],
  },
};

export default nextConfig;
