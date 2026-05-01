import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  outputFileTracingIncludes: {
    '/**': [
      './lib/generated/prisma/**/*.node',
      './lib/generated/prisma/schema.prisma',
    ],
  },
}

export default nextConfig
