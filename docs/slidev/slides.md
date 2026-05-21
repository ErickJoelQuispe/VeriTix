---
theme: default
title: VeriTix — Sistema de Gestión de Eventos y Tickets Digitales
info: |
  Proyecto Fin de Ciclo — DAW/DAM
  Instituto Fomento Ocupacional FOC
  Erick Quispe · Juan Rangel · 2026
class: text-center
highlighter: shiki
drawings:
  persist: false
transition: slide-left
mdc: true
---

<div class="flex flex-col items-center justify-center h-full gap-6">
  <div class="text-sm font-semibold tracking-widest uppercase text-violet-400 opacity-80">Proyecto Fin de Ciclo · DAW/DAM</div>

  <h1 class="text-7xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
    VeriTix
  </h1>

  <p class="text-2xl text-slate-300 font-light">
    Sistema de Gestión de Eventos y Tickets Digitales
  </p>

  <div class="h-px w-32 bg-gradient-to-r from-transparent via-violet-500 to-transparent mt-2" />

  <div class="flex gap-8 text-slate-400 text-sm mt-2">
    <span>Erick Quispe</span>
    <span class="text-violet-500">·</span>
    <span>Juan Rangel</span>
  </div>

  <div class="text-slate-500 text-xs mt-1">Instituto Fomento Ocupacional FOC · 2026</div>
</div>

<style>
.slidev-layout { background: #0d0d1a; }
</style>

---
layout: default
---

# Problema del sector

<div class="grid grid-cols-3 gap-6 mt-8">

<div class="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
  <div class="text-3xl mb-3">🏟️</div>
  <h3 class="font-bold text-violet-300 mb-2">Organizadores</h3>
  <p class="text-sm text-slate-400">Necesitan gestionar eventos, controlar aforo y ventas desde una plataforma única.</p>
</div>

<div class="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
  <div class="text-3xl mb-3">🎟️</div>
  <h3 class="font-bold text-violet-300 mb-2">Plataformas</h3>
  <p class="text-sm text-slate-400">Alto volumen transaccional con picos de concurrencia en apertura de ventas.</p>
</div>

<div class="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
  <div class="text-3xl mb-3">🔐</div>
  <h3 class="font-bold text-violet-300 mb-2">Validadores</h3>
  <p class="text-sm text-slate-400">Validación de acceso rápida, trazable y resistente a reutilización de entradas.</p>
</div>

</div>

<div class="mt-8 bg-violet-900/20 border border-violet-700/40 rounded-xl p-5">
  <h3 class="text-violet-300 font-semibold mb-3">¿Qué resuelve VeriTix?</h3>
  <div class="grid grid-cols-2 gap-3 text-sm text-slate-300">
    <div class="flex items-start gap-2"><span class="text-violet-400 mt-0.5">▸</span> Centralización operativa con API unificada</div>
    <div class="flex items-start gap-2"><span class="text-violet-400 mt-0.5">▸</span> Control de stock con transacciones atómicas</div>
    <div class="flex items-start gap-2"><span class="text-violet-400 mt-0.5">▸</span> Tickets con hash único y trazabilidad de acceso</div>
    <div class="flex items-start gap-2"><span class="text-violet-400 mt-0.5">▸</span> Automatización del flujo de cobro con Stripe</div>
  </div>
</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
h1 { color: #a78bfa; }
</style>

---
layout: default
---

# Stack tecnológico

<div class="grid grid-cols-2 gap-8 mt-6">

<div>
  <div class="flex items-center gap-2 mb-4">
    <span class="bg-violet-600 text-white text-xs font-bold px-2 py-1 rounded">BACKEND</span>
    <span class="text-slate-400 text-sm">Puerto 3001</span>
  </div>
  <div class="space-y-3">
    <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3">
      <span class="text-2xl">🦅</span>
      <div>
        <div class="font-semibold text-sm text-white">NestJS 11 + TypeScript</div>
        <div class="text-xs text-slate-400">Lógica de negocio y seguridad</div>
      </div>
    </div>
    <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3">
      <span class="text-2xl">🗄️</span>
      <div>
        <div class="font-semibold text-sm text-white">Prisma 7 + PostgreSQL</div>
        <div class="text-xs text-slate-400">Persistencia y transacciones atómicas</div>
      </div>
    </div>
    <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3">
      <span class="text-2xl">⚡</span>
      <div>
        <div class="font-semibold text-sm text-white">Redis + BullMQ</div>
        <div class="text-xs text-slate-400">Caché y colas de notificaciones</div>
      </div>
    </div>
  </div>
</div>

<div>
  <div class="flex items-center gap-2 mb-4">
    <span class="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">FRONTEND</span>
    <span class="text-slate-400 text-sm">Puerto 3000</span>
  </div>
  <div class="space-y-3">
    <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3">
      <span class="text-2xl">💚</span>
      <div>
        <div class="font-semibold text-sm text-white">Nuxt 4 + Vue 3</div>
        <div class="text-xs text-slate-400">UI, navegación y consumo de API</div>
      </div>
    </div>
    <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3">
      <span class="text-2xl">🎨</span>
      <div>
        <div class="font-semibold text-sm text-white">Tailwind 4 + Nuxt UI</div>
        <div class="text-xs text-slate-400">Sistema de diseño y componentes</div>
      </div>
    </div>
    <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3">
      <span class="text-2xl">💳</span>
      <div>
        <div class="font-semibold text-sm text-white">Stripe + Resend</div>
        <div class="text-xs text-slate-400">Pagos y notificaciones transaccionales</div>
      </div>
    </div>
  </div>
</div>

</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
h1 { color: #a78bfa; }
</style>

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
    <div class="text-xs text-slate-400 mt-1">/api/v1<br/>Swagger en /docs</div>
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

---
layout: default
---

# Flujo principal del sistema

<div class="mt-6 space-y-4">

<div class="flex items-stretch gap-0">
  <div v-for="(step, i) in [
    { num: '01', icon: '📝', title: 'Registro', desc: 'Usuario se registra. Email de verificación vía Resend + BullMQ.' },
    { num: '02', icon: '🎫', title: 'Compra', desc: 'Orden creada atómicamente. Redirect a Stripe Checkout.' },
    { num: '03', icon: '🪝', title: 'Webhook', desc: 'Stripe confirma pago. Se emiten tickets con hash SHA-256.' },
    { num: '04', icon: '📧', title: 'Notificación', desc: 'Email de confirmación con QR del ticket enviado al comprador.' },
    { num: '05', icon: '✅', title: 'Acceso', desc: 'VALIDATOR escanea QR. Backend registra validatedAt y validatedBy.' },
  ]" class="flex-1">
    <div class="bg-slate-800/60 border-t-2 border-violet-500 rounded-lg p-4 mx-1 h-full">
      <div class="text-violet-400 text-xs font-mono font-bold mb-2">{{ step.num }}</div>
      <div class="text-xl mb-2">{{ step.icon }}</div>
      <div class="font-bold text-white text-sm mb-1">{{ step.title }}</div>
      <div class="text-xs text-slate-400">{{ step.desc }}</div>
    </div>
  </div>
</div>

<div class="bg-violet-900/20 border border-violet-700/40 rounded-xl p-5 mt-4">
  <h3 class="text-violet-300 font-semibold mb-3 text-sm">Prevención de sobreventa</h3>
  <div class="grid grid-cols-3 gap-4 text-xs text-slate-300">
    <div class="flex items-start gap-2">
      <span class="text-violet-400 font-bold">1.</span>
      <span>Verificar stock disponible dentro de la transacción</span>
    </div>
    <div class="flex items-start gap-2">
      <span class="text-violet-400 font-bold">2.</span>
      <span>Decrementar <code>availableQuantity</code> atómicamente</span>
    </div>
    <div class="flex items-start gap-2">
      <span class="text-violet-400 font-bold">3.</span>
      <span>Confirmar solo si Stripe valida el pago vía webhook</span>
    </div>
  </div>
</div>

</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
h1 { color: #a78bfa; }
code { background: #1e1b4b; color: #c4b5fd; padding: 1px 4px; border-radius: 3px; }
</style>

---
layout: default
---

# Modelo de datos

<div class="grid grid-cols-2 gap-6 mt-6">

<div>
  <h3 class="text-violet-300 font-semibold mb-3 text-sm">Núcleo transaccional</h3>
  <div class="space-y-2 text-xs">
    <div v-for="rel in [
      { from: 'User (creator)', arrow: '1:N', to: 'Event' },
      { from: 'Event', arrow: '1:N', to: 'TicketType, Order, Ticket' },
      { from: 'Order', arrow: '1:N', to: 'OrderItem, Payment, Ticket' },
      { from: 'TicketType', arrow: '1:N', to: 'OrderItem, Ticket' },
      { from: 'User (buyer)', arrow: '1:N', to: 'Order, Ticket' },
      { from: 'Event + Artist', arrow: 'N:M', to: 'vía EventArtist' },
    ]" class="flex items-center gap-2 bg-slate-800/40 border border-slate-700 rounded-lg px-3 py-2">
      <span class="text-slate-300 flex-1">{{ rel.from }}</span>
      <span class="text-violet-400 font-mono font-bold text-xs">{{ rel.arrow }}</span>
      <span class="text-slate-400 flex-1 text-right">{{ rel.to }}</span>
    </div>
  </div>
</div>

<div>
  <h3 class="text-violet-300 font-semibold mb-3 text-sm">Constraints clave</h3>
  <div class="space-y-2 text-xs">
    <div class="bg-slate-800/40 border border-slate-700 rounded-lg p-3">
      <div class="text-violet-400 font-bold mb-1">Unicidad</div>
      <div class="text-slate-400 font-mono">users.email · users.phone · tickets.hash · venues.slug</div>
    </div>
    <div class="bg-slate-800/40 border border-slate-700 rounded-lg p-3">
      <div class="text-violet-400 font-bold mb-1">Índices de consulta</div>
      <div class="text-slate-400 font-mono">events(status, eventDate) · orders(buyerId) · tickets(status)</div>
    </div>
    <div class="bg-slate-800/40 border border-slate-700 rounded-lg p-3">
      <div class="text-violet-400 font-bold mb-1">Enums de dominio</div>
      <div class="text-slate-400 font-mono">Role · EventStatus · OrderStatus · TicketStatus · PaymentStatus</div>
    </div>
    <div class="bg-slate-800/40 border border-slate-700 rounded-lg p-3">
      <div class="text-violet-400 font-bold mb-1">Cascadas</div>
      <div class="text-slate-400 font-mono">RefreshToken→User · TicketType→Event · OrderItem→Order</div>
    </div>
  </div>
</div>

</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
h1 { color: #a78bfa; }
</style>

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

---
layout: default
---

# Estado del proyecto

<div class="mt-6">

<div class="grid grid-cols-2 gap-3 text-sm mb-6">
  <div v-for="phase in [
    { name: '1. Análisis y diseño', status: 'done', detail: 'Requisitos, modelo de datos, contratos API' },
    { name: '2. Autenticación y usuarios', status: 'done', detail: 'Registro, login, refresh, roles' },
    { name: '3. Gestión de eventos y catálogos', status: 'done', detail: 'CRUD eventos, recintos, artistas, géneros' },
    { name: '4. Venta de tickets', status: 'partial', detail: 'Backend completo · integración frontend pendiente' },
    { name: '5. Validación de tickets', status: 'partial', detail: 'Backend completo · UI de scanner pendiente' },
    { name: '6. Panel administrativo', status: 'done', detail: 'Área admin operativa en frontend' },
    { name: '7. Testing', status: 'done', detail: 'Unitarias, e2e, concurrencia implementadas' },
    { name: '8. Despliegue y documentación', status: 'partial', detail: 'Docker configurado · operación parcial' },
  ]" class="flex items-start gap-3 bg-slate-800/40 border rounded-lg px-4 py-3"
    :class="phase.status === 'done' ? 'border-green-700/40' : 'border-yellow-700/40'">
    <span class="text-lg mt-0.5">{{ phase.status === 'done' ? '✅' : '🔶' }}</span>
    <div>
      <div class="font-semibold" :class="phase.status === 'done' ? 'text-green-300' : 'text-yellow-300'">{{ phase.name }}</div>
      <div class="text-xs text-slate-400 mt-0.5">{{ phase.detail }}</div>
    </div>
  </div>
</div>

</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
h1 { color: #a78bfa; }
</style>

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

---
layout: default
---

# Gestión de riesgos

<div class="mt-6 space-y-2 text-sm">

<div v-for="risk in [
  { id: 'R01', title: 'Desalineación backend/frontend', prob: 'Media', impact: 'Alto', color: 'yellow', fix: 'Matriz de estado funcional por capa revisada en cada hito' },
  { id: 'R02', title: 'Errores en flujos de pago/webhook', prob: 'Media', impact: 'Alto', color: 'yellow', fix: 'Pruebas de integración y e2e en orders, tickets y webhooks' },
  { id: 'R03', title: 'Vulnerabilidad en autenticación', prob: 'Baja', impact: 'Muy alto', color: 'red', fix: 'Validación estricta de entorno + rotación de credenciales' },
  { id: 'R04', title: 'Degradación bajo concurrencia', prob: 'Media', impact: 'Alto', color: 'yellow', fix: 'Suites de concurrencia y stress (test:concurrency, test:load)' },
  { id: 'R06', title: 'Merge defectuoso a main', prob: 'Baja', impact: 'Muy alto', color: 'red', fix: 'PR obligatorio + checks CI + sin pushes directos a main' },
]" class="flex items-center gap-3 bg-slate-800/40 border border-slate-700 rounded-lg px-4 py-2.5">
  <span class="font-mono text-xs text-slate-500 w-8 shrink-0">{{ risk.id }}</span>
  <span class="text-white flex-1">{{ risk.title }}</span>
  <span class="text-xs px-2 py-0.5 rounded font-semibold shrink-0"
    :class="risk.color === 'red' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'">
    {{ risk.impact }}
  </span>
  <span class="text-xs text-slate-400 text-right w-56 shrink-0">{{ risk.fix }}</span>
</div>

</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
h1 { color: #a78bfa; }
</style>

---
layout: default
---

# Sostenibilidad

<div class="grid grid-cols-3 gap-5 mt-8">

<div class="bg-slate-800/60 border border-blue-700/40 rounded-xl p-5">
  <div class="text-3xl mb-3">🏗️</div>
  <div class="text-blue-300 font-bold text-sm mb-1">ODS 9</div>
  <div class="text-white font-semibold mb-2 text-sm">Industria e innovación</div>
  <p class="text-xs text-slate-400">
    Arquitectura modular con separación clara de capas. API documentada que facilita integración y onboarding. CI/CD con testing automatizado.
  </p>
</div>

<div class="bg-slate-800/60 border border-green-700/40 rounded-xl p-5">
  <div class="text-3xl mb-3">♻️</div>
  <div class="text-green-300 font-bold text-sm mb-1">ODS 12</div>
  <div class="text-white font-semibold mb-2 text-sm">Consumo responsable</div>
  <p class="text-xs text-slate-400">
    Código eficiente con caché Redis y consultas optimizadas. Frontend ligero. Reduce redundancia de comunicaciones físicas.
  </p>
</div>

<div class="bg-slate-800/60 border border-emerald-700/40 rounded-xl p-5">
  <div class="text-3xl mb-3">🌱</div>
  <div class="text-emerald-300 font-bold text-sm mb-1">ODS 13</div>
  <div class="text-white font-semibold mb-2 text-sm">Acción por el clima</div>
  <p class="text-xs text-slate-400">
    Reemplaza procesos manuales en papel por un sistema digital centralizado. Tickets digitales eliminan impresiones físicas.
  </p>
</div>

</div>

<div class="mt-6 bg-slate-800/40 border border-slate-700 rounded-xl p-4 text-center">
  <p class="text-sm text-slate-400">
    VeriTix digitaliza un flujo que históricamente dependía de papel, llamadas y procesos manuales —
    <span class="text-violet-300 font-semibold">reduciendo huella operativa y aumentando trazabilidad</span>.
  </p>
</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
h1 { color: #a78bfa; }
</style>

---
layout: center
class: text-center
---

<div class="flex flex-col items-center justify-center h-full gap-8">

  <div class="text-6xl font-black bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
    VeriTix
  </div>

  <div class="grid grid-cols-4 gap-4 text-sm">
    <div class="bg-slate-800/60 border border-violet-700/40 rounded-xl p-4 text-center">
      <div class="text-2xl font-black text-violet-400">80</div>
      <div class="text-xs text-slate-400 mt-1">tests frontend</div>
    </div>
    <div class="bg-slate-800/60 border border-indigo-700/40 rounded-xl p-4 text-center">
      <div class="text-2xl font-black text-indigo-400">10+</div>
      <div class="text-xs text-slate-400 mt-1">módulos backend</div>
    </div>
    <div class="bg-slate-800/60 border border-purple-700/40 rounded-xl p-4 text-center">
      <div class="text-2xl font-black text-purple-400">4</div>
      <div class="text-xs text-slate-400 mt-1">roles de usuario</div>
    </div>
    <div class="bg-slate-800/60 border border-pink-700/40 rounded-xl p-4 text-center">
      <div class="text-2xl font-black text-pink-400">∞</div>
      <div class="text-xs text-slate-400 mt-1">escalabilidad</div>
    </div>
  </div>

  <div class="h-px w-48 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

  <div class="text-slate-400 text-sm">
    <span class="text-violet-300">Erick Quispe</span> · <span class="text-violet-300">Juan Rangel</span><br/>
    <span class="text-slate-500 text-xs">DAW/DAM · Instituto FOC · 2026</span>
  </div>

</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
</style>
