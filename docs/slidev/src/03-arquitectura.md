---
layout: default
---

# Arquitectura del sistema

<div class="grid grid-cols-3 gap-4 mt-6 text-sm">

<div class="col-span-1 flex flex-col gap-3">
  <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
    <div class="text-2xl mb-2">🌐</div>
    <div class="font-bold text-indigo-300">Frontend</div>
    <div class="text-xs text-slate-400 mt-1">Nuxt 4 / Vue 3<br/>SSR + SPA</div>
  </div>
  <div class="text-center text-violet-400 text-lg">↕</div>
  <div class="bg-slate-800/60 border border-violet-700/50 rounded-xl p-4 text-center">
    <div class="text-2xl mb-2">🔌</div>
    <div class="font-bold text-violet-300">REST API</div>
    <div class="text-xs text-slate-400 mt-1">/api/v1 · Swagger en /docs</div>
  </div>
  <div class="text-center text-violet-400 text-lg">↕</div>
  <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
    <div class="text-2xl mb-2">🦅</div>
    <div class="font-bold text-violet-300">Backend</div>
    <div class="text-xs text-slate-400 mt-1">NestJS 11<br/>Módulos de dominio</div>
  </div>
</div>

<div class="col-span-2">
  <h3 class="text-violet-300 font-semibold mb-3">Módulos backend</h3>
  <div class="grid grid-cols-2 gap-2 text-xs">
    <div class="bg-slate-800/40 border border-slate-700 rounded-lg p-3">
      <div class="text-violet-400 font-bold mb-1">Identidad y acceso</div>
      <div class="text-slate-400">auth · users</div>
    </div>
    <div class="bg-slate-800/40 border border-slate-700 rounded-lg p-3">
      <div class="text-violet-400 font-bold mb-1">Catálogo y eventos</div>
      <div class="text-slate-400">events · ticket-types · event-artists</div>
    </div>
    <div class="bg-slate-800/40 border border-slate-700 rounded-lg p-3">
      <div class="text-violet-400 font-bold mb-1">Transacción y emisión</div>
      <div class="text-slate-400">orders · tickets · webhooks</div>
    </div>
    <div class="bg-slate-800/40 border border-slate-700 rounded-lg p-3">
      <div class="text-violet-400 font-bold mb-1">Infraestructura</div>
      <div class="text-slate-400">venues · artists · genres · formats</div>
    </div>
    <div class="col-span-2 bg-slate-800/40 border border-slate-700 rounded-lg p-3">
      <div class="text-violet-400 font-bold mb-1">Soporte operativo</div>
      <div class="text-slate-400">notifications · queues · cache</div>
    </div>
  </div>

  <h3 class="text-violet-300 font-semibold mb-3 mt-4">Seguridad</h3>
  <div class="grid grid-cols-2 gap-2 text-xs">
    <div class="flex items-start gap-2 text-slate-300"><span class="text-violet-400">▸</span> JWT + refresh token rotativo (HTTP-only cookie)</div>
    <div class="flex items-start gap-2 text-slate-300"><span class="text-violet-400">▸</span> Roles: BUYER · CREATOR · VALIDATOR · ADMIN</div>
    <div class="flex items-start gap-2 text-slate-300"><span class="text-violet-400">▸</span> Transacciones atómicas con <code>prisma.$transaction()</code></div>
    <div class="flex items-start gap-2 text-slate-300"><span class="text-violet-400">▸</span> Hash SHA-256 por ticket como payload QR</div>
  </div>
</div>

</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
h1 { color: #a78bfa; }
code { background: #1e1b4b; color: #c4b5fd; padding: 1px 4px; border-radius: 3px; }
</style>
