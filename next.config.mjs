/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimización de imágenes habilitada para mejor rendimiento
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Optimizaciones de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Habilitar SWC minification para mejor rendimiento
  swcMinify: true,
  // Optimizar fuentes
  optimizeFonts: true,
  // Comprimir páginas
  compress: true,
  // Optimizaciones experimentales
  experimental: {
    // optimizeCss: true, // Deshabilitado temporalmente - requiere critters package
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Headers para resolver problema de CSP en producción
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
