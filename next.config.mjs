/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: '/upcoming-ipos',
        destination: '/upcoming-ipo',
        permanent: true,
      },
      {
        source: '/listed-ipos',
        destination: '/listed-ipo',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/terms-and-conditions',
        permanent: true,
      },
      {
        source: '/terms-and-condition',
        destination: '/terms-and-conditions',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/privacy-policy',
        permanent: true,
      },
      {
        source: '/cookies',
        destination: '/cookie-policy',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
