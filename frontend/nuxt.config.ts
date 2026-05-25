import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  runtimeConfig: {
    backendApiBase: process.env.NUXT_BACKEND_API_BASE || 'http://localhost:3001/api/v1',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || `${process.env.NUXT_APP_BASE_URL || '/'}api`,
      apiTimeoutMs: Number(process.env.NUXT_PUBLIC_API_TIMEOUT_MS || 8000),
      backendApiBase: process.env.NUXT_BACKEND_API_BASE || 'http://localhost:3001/api/v1',
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/fonts',
    ...(process.env.NODE_ENV !== 'production' ? ['@nuxt/test-utils/module'] : []),
  ],

  image: {
    domains: ['images.unsplash.com', 'picsum.photos'],
    provider: 'ipx',
  },

  imports: {
    dirs: ['~/composables', '~/composables/**'],
  },

  components: [
    {
      path: '~/components',
      pathPrefix: true,
    },
  ],

  css: ['./app/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['zod'],
      exclude: ['@zxing/browser'],
    },
    build: {
      rollupOptions: {
        // Limit parallel I/O ops to avoid saturating VPS resources during build
        maxParallelFileOps: 2,
      },
    },
    server: {
      allowedHosts: ['cwtg.xyz', 'localhost'],
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['node'],
      },
      include: ['../test/unit/**/*'],
    },
  },
})
