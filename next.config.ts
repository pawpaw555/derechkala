import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/%D7%A7%D7%95-%D7%90%D7%93%D7%95%D7%9D",
        destination: "/line-red",
      },
      {
        source: "/%D7%A7%D7%95-%D7%99%D7%A8%D7%95%D7%A7",
        destination: "/line-green",
      },
      {
        source: "/%D7%A7%D7%95-%D7%A1%D7%92%D7%95%D7%9C",
        destination: "/line-purple",
      },
    ];
  },
};

export default nextConfig;