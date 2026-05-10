// @vitest-environment nuxt
// Declarations for Nuxt test-utils macros used in test/nuxt/
// These are provided at runtime by @nuxt/test-utils/runtime

declare function mockNuxtImport<T = unknown>(
  name: string | ((original: T) => T),
  factory?: (original: T) => T,
): void
