// Type declarations for Nuxt test-utils macros
// These are transformed at build time by @nuxt/test-utils/runtime

declare function mockNuxtImport<T = unknown>(
  name: string | ((original: T) => T),
  factory?: (original: T) => T,
): void
