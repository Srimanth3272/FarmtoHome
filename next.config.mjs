/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || "AIzaSyB_3fnmXQNH7KhKPt5u_o18kHhbo-_DncI",
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || "farm-to-home-9ff91.firebaseapp.com",
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "farm-to-home-9ff91",
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || "farm-to-home-9ff91.firebasestorage.app",
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || "841976700127",
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || "1:841976700127:web:56f9f9980c4b6e49dc1d6a",
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || "G-K2RDJXNE02",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./prisma/dev.db', './dev.db'],
    },
  },
};

export default nextConfig;
