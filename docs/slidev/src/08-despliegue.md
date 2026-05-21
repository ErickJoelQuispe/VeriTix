---
layout: default
---

# Despliegue y contenerización

<div class="grid grid-cols-2 gap-6 mt-6">

<div>
  <h3 class="text-violet-300 font-semibold mb-3 text-sm">Servicios Docker</h3>
  <div class="space-y-2">
    <div v-for="svc in [
      { name: 'PostgreSQL 18', tag: 'postgres:18-alpine', port: '5432', icon: '🐘' },
      { name: 'Redis 8', tag: 'redis:8-alpine', port: '6379', icon: '⚡' },
      { name: 'Backend API', tag: 'Dockerfile.dev', port: '3001', icon: '🦅' },
      { name: 'Frontend', tag: 'multi-stage build', port: '3000', icon: '💚' },
    ]" class="flex items-center gap-3 bg-slate-800/40 border border-slate-700 rounded-lg px-4 py-2 text-sm">
      <span class="text-xl">{{ svc.icon }}</span>
      <div class="flex-1">
        <div class="font-semibold text-white">{{ svc.name }}</div>
        <div class="text-xs text-slate-500 font-mono">{{ svc.tag }}</div>
      </div>
      <span class="text-xs text-violet-400 font-mono">:{{ svc.port }}</span>
    </div>
  </div>
</div>

<div>
  <h3 class="text-violet-300 font-semibold mb-3 text-sm">Frontend Dockerfile multi-stage</h3>
  <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-xs space-y-1">
    <div><span class="text-blue-400">FROM</span> <span class="text-green-400">oven/bun:1-alpine</span> <span class="text-yellow-400">AS base</span></div>
    <div class="text-slate-500">── deps: install --frozen-lockfile</div>
    <div class="text-slate-500">── builder: bun run build</div>
    <div><span class="text-blue-400">FROM</span> <span class="text-green-400">oven/bun:1-alpine</span> <span class="text-yellow-400">AS production</span></div>
    <div><span class="text-purple-400">USER</span> nuxt</div>
    <div><span class="text-purple-400">EXPOSE</span> 3000</div>
    <div><span class="text-purple-400">CMD</span> [<span class="text-orange-300">"bun"</span>, <span class="text-orange-300">".output/server/index.mjs"</span>]</div>
  </div>

  <h3 class="text-violet-300 font-semibold mb-3 mt-4 text-sm">Variables de entorno</h3>
  <div class="text-xs text-slate-400 font-mono space-y-1 bg-slate-900 border border-slate-700 rounded-xl p-4">
    <div>DATABASE_URL · JWT_SECRET</div>
    <div>STRIPE_SECRET_KEY · STRIPE_WEBHOOK_SECRET</div>
    <div>RESEND_API_KEY · REDIS_URL</div>
    <div>CORS_ORIGIN · API_PREFIX</div>
  </div>
</div>

</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
h1 { color: #a78bfa; }
</style>
