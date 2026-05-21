---
layout: default
---

# Gestión de riesgos

<div class="mt-6 space-y-2 text-sm">

<div v-for="risk in [
  { id: 'R01', title: 'Desalineación backend/frontend', color: 'yellow', impact: 'Alto', fix: 'Matriz de estado funcional por capa revisada en cada hito' },
  { id: 'R02', title: 'Errores en flujos de pago/webhook', color: 'yellow', impact: 'Alto', fix: 'Pruebas de integración y e2e en orders, tickets y webhooks' },
  { id: 'R03', title: 'Vulnerabilidad en autenticación', color: 'red', impact: 'Muy alto', fix: 'Validación estricta de entorno + rotación de credenciales' },
  { id: 'R04', title: 'Degradación bajo concurrencia', color: 'yellow', impact: 'Alto', fix: 'Suites de concurrencia y stress (test:concurrency, test:load)' },
  { id: 'R06', title: 'Merge defectuoso a main', color: 'red', impact: 'Muy alto', fix: 'PR obligatorio + checks CI + sin pushes directos a main' },
]" class="flex items-center gap-3 bg-slate-800/40 border border-slate-700 rounded-lg px-4 py-2.5">
  <span class="font-mono text-xs text-slate-500 w-8 shrink-0">{{ risk.id }}</span>
  <span class="text-white flex-1">{{ risk.title }}</span>
  <span class="text-xs px-2 py-0.5 rounded font-semibold shrink-0"
    :class="risk.color === 'red' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'">{{ risk.impact }}</span>
  <span class="text-xs text-slate-400 text-right w-56 shrink-0">{{ risk.fix }}</span>
</div>

</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
h1 { color: #a78bfa; }
</style>
