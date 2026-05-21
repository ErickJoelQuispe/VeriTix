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
