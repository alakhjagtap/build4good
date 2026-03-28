import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
