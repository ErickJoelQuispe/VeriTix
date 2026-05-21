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
    <div class="flex items-start gap-2"><span class="text-violet-400 font-bold">1.</span><span>Verificar stock disponible dentro de la transacción</span></div>
    <div class="flex items-start gap-2"><span class="text-violet-400 font-bold">2.</span><span>Decrementar <code>availableQuantity</code> atómicamente</span></div>
    <div class="flex items-start gap-2"><span class="text-violet-400 font-bold">3.</span><span>Confirmar solo si Stripe valida el pago vía webhook</span></div>
  </div>
</div>

</div>

<style>
.slidev-layout { background: #0d0d1a; color: #e2e8f0; }
h1 { color: #a78bfa; }
code { background: #1e1b4b; color: #c4b5fd; padding: 1px 4px; border-radius: 3px; }
</style>
