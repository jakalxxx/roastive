/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Next 14.x와 ESLint 9 조합의 옵션 불일치로 빌드 실패 방지
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ['@roastive/ui','@roastive/validation'],
};

module.exports = nextConfig;

