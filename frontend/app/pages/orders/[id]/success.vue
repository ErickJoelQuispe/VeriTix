<script setup lang="ts">
import type { UserOrderDetail } from '~~/shared/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { fetchOrderDetail } = useMyOrders()

const orderId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

const order = ref<(UserOrderDetail & { checkoutUrl: string | null }) | null>(null)

onMounted(async () => {
  try {
    const detail = await fetchOrderDetail(orderId.value)
    order.value = detail as UserOrderDetail & { checkoutUrl: string | null }
  }
  catch {
    await navigateTo('/')
  }
})

const totalTickets = computed(() => {
  if (!order.value) return 0
  return order.value.items.reduce((sum, item) => sum + item.quantity, 0)
})

const formattedTotal = computed(() => {
  if (!order.value) return '0.00'
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(order.value.totalAmount)
})
</script>

<template>
  <section class="relative py-10 sm:py-14 lg:py-16">
    <BaseContainer>
      <div class="mx-auto max-w-lg space-y-8 text-center">
        <div class="space-y-4">
          <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15">
            <BaseIcon name="i-lucide-circle-check" class="size-8 text-success" />
          </div>

          <div class="space-y-2">
            <h1 class="font-display text-3xl font-bold text-highlighted">
              ¡Pago procesado!
            </h1>
            <p class="text-base leading-relaxed text-toned">
              Tus entradas están siendo generadas. Te llegará una confirmación por email.
            </p>
          </div>
        </div>

        <div v-if="order" class="rounded-2xl border border-default/55 bg-elevated/25 px-6 py-6 text-left space-y-4">
          <div class="space-y-1">
            <p class="text-xs font-medium tracking-widest text-muted uppercase">
              Evento
            </p>
            <p class="text-lg font-semibold text-highlighted">
              {{ order.event.name }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <p class="text-xs font-medium tracking-widest text-muted uppercase">
                Entradas
              </p>
              <p class="text-base font-semibold text-highlighted">
                {{ totalTickets }}
              </p>
            </div>

            <div class="space-y-1">
              <p class="text-xs font-medium tracking-widest text-muted uppercase">
                Total
              </p>
              <p class="text-base font-semibold text-highlighted">
                ${{ formattedTotal }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="space-y-3">
          <BaseSkeleton class="h-6 rounded-xl" />
          <BaseSkeleton class="h-24 rounded-2xl" />
        </div>

        <BaseButton
          to="/users/me/events"
          variant="primary"
          size="lg"
          class="w-full"
        >
          Ver mis eventos
        </BaseButton>
      </div>
    </BaseContainer>
  </section>
</template>
