import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc:  'app/sw.ts',
  swDest: 'public/sw.js',
  // Disable in development to avoid caching dev assets
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {},
}

export default withSerwist(nextConfig)
