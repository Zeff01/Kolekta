/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pokemontcg.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.tcgdex.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.tcgdex.net',
        pathname: '/**',
      },
    ],
    unoptimized: true, // TCGdex images don't have extensions, causing issues
  },
};

module.exports = nextConfig;
