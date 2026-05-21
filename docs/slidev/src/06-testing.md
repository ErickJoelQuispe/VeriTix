---
layout: default
---

# Testing

<div class="grid grid-cols-2 gap-6 mt-6">

<div>
  <h3 class="text-indigo-300 font-semibold mb-3">Backend</h3>
  <div class="space-y-2 text-sm">
    <div class="bg-slate-800/60 border-l-4 border-violet-500 rounded-r-lg px-4 py-2">
      <div class="font-semibold text-white">Unitarias</div>
      <div class="text-xs text-slate-400">Servicios y controladores · auth, events, orders, tickets, webhooks</div>
    </div>
    <div class="bg-slate-800/60 border-l-4 border-indigo-500 rounded-r-lg px-4 py-2">
      <div class="font-semibold text-white">Integración / e2e</div>
      <div class="text-xs text-slate-400">Suites completas por módulo en <code>backend/test/</code></div>
    </div>
    <div class="bg-slate-800/60 border-l-4 border-pink-500 rounded-r-lg px-4 py-2">
      <div class="font-semibold text-white">Concurrencia y carga</div>
      <div class="text-xs text-slate-400"><code>test:concurrency</code> · <code>test:load</code> · <code>test:stress</code> · <code>test:soak</code></div>
    </div>
    <div class="bg-slate-800/60 border-l-4 border-yellow-500 rounded-r-lg px-4 py-2">
      <div class="font-semibold text-white">Seguridad funcional</div>
      <div class="text-xs text-slate-400">JWT, permisos por rol, validación de tickets</div>
    </div>
  </div>
</div>

<div>
  <h3 class="text-indigo-300 font-semibold mb-3">Frontend — 80 tests con Vitest</h3>
  <div class="space-y-2 text-sm">
    <div class="bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3">
      <div class="flex justify-between items-center mb-1">
        <span class="font-semibold text-white">unit (44 tests)</span>
        <span class="text-xs bg-violet-800 text-violet-200 px-2 py-0.5 rounded">Node</span>
      </div>
      <div class="text-xs text-slate-400">Mappers, filtros, formateo, normalización HTTP, repositorios</div>
    </div>
    <div class="bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3">
      <div class="flex justify-between items-center mb-1">
        <span class="font-semibold text-white">nuxt (36 tests)</span>
        <span class="text-xs bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded">Nuxt runtime</span>
      </div>
      <div class="text-xs text-slate-400">useAuth, useApiRequest, middlewares, auto-retry 401, toast queue</div>
    </div>
  </div>
  <div class="mt-4 bg-green-900/20 border border-green-700/40 rounded-xl p-3 text-center">
    <div class="text-3xl font-black text-green-400">80</div>
    <div class="text-xs text-slate-400 mt-1">tests frontend pasando</div>
  </div>
</div>

</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
h1 { color: #a78bfa; }
code { background: #1e1b4b; color: #c4b5fd; padding: 1px 4px; border-radius: 3px; }
</style>
