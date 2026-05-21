import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },

  runtimeConfig: {
    backendApiBase: process.env.NUXT_BACKEND_API_BASE || 'http://localhost:3001/api/v1',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || `${process.env.NUXT_APP_BASE_URL || '/'}api`,
      apiTimeoutMs: Number(process.env.NUXT_PUBLIC_API_TIMEOUT_MS || 8000),
      backendApiBase: process.env.NUXT_BACKEND_API_BASE || 'http://localhost:3001/api/v1',
    },
  },

  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/fonts', '@nuxt/test-utils/module'],

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
      include: ['@vue/devtools-core', '@vue/devtools-kit', 'zod'],
      exclude: ['@zxing/browser'],
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
