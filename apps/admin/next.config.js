/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@nexmarto/ui", "@nexmarto/types"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nexmarto-uploads.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
};

module.exports = nextConfig;
