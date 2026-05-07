import process from 'node:process'
import { fileURLToPath } from 'node:url'
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
    },
  },

  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/ui', '@nuxt/fonts', '@nuxt/test-utils/module'],

  ui: {
    colorMode: false,
  },

  components: [
    {
      path: '~/components',
      pathPrefix: true,
    },
  ],

  alias: {
    '@': fileURLToPath(new URL('./app', import.meta.url)),
  },

  css: ['./app/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit', 'zod'],
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
})
