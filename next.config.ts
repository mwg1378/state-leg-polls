import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/**/*': ['./lib/generated/prisma/**/*'],
  },
  serverExternalPackages: ['@prisma/client'],
}

export default nextConfig
