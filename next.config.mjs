/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "ohana.africa",
          pathname: "/hook/public/uploads/**",
        },
      ],
    },
};

export default nextConfig;
