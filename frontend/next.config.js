/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    
    // Ignore optional dependencies that aren't needed for web
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        '@react-native-async-storage/async-storage': '@react-native-async-storage/async-storage',
        'pino-pretty': 'pino-pretty',
      });
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
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