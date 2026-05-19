<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { fetchOrderDetail } = useMyOrders()

const orderId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

onMounted(async () => {
  try {
    const order = await fetchOrderDetail(orderId.value)
    await navigateTo(`/events/${order.event.id}`)
  }
  catch {
    await navigateTo('/events')
  }
})
</script>

<template>
  <section class="relative py-10 sm:py-14">
    <BaseContainer>
      <div class="flex items-center justify-center py-16">
        <div class="space-y-3 text-center">
          <BaseSkeleton class="mx-auto h-8 w-48 rounded-xl" />
          <p class="text-sm text-toned">
            Redirigiendo...
          </p>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
