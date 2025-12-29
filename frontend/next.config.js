/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_AUTHORIZED_AGENT: process.env.NEXT_PUBLIC_AUTHORIZED_AGENT,
    NEXT_PUBLIC_IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY,
    NEXT_PUBLIC_PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  },
};

module.exports = nextConfig;