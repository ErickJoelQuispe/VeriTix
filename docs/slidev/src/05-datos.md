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
