<script setup lang="ts">
import type { Money } from '~/types'
import { formatMoney } from '~/utils/currency-formatters'

const props = defineProps<{
  money: Money
}>()

const formatted = computed(() => {
  return formatMoney(props.money.amount, props.money.currency)
})
</script>

<template>
  <BaseBadge kind="price" size="sm">
    Desde {{ formatted }}
  </BaseBadge>
</template>
