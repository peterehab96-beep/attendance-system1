/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Node.js modules that are not compatible with the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        child_process: false,
        stream: false,
        util: false,
        http: false,
        https: false,
        zlib: false,
        querystring: false,
        url: false,
        os: false,
        path: false,
      }
    }
    return config
  },
  experimental: {
    esmExternals: 'loose',
  },
}

export default nextConfig
