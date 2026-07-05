import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output bundles a minimal server.js + traced deps for a small
  // production image. Started with `node server.js` on $PORT.
  output: "standalone",
};

export default nextConfig;
