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
  async redirects() {
    return [
      {
        source: "/%D7%A8%D7%9B%D7%91%D7%AA-%D7%A7%D7%9C%D7%94-%D7%9E%D7%A4%D7%94",
        destination: "/map",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;