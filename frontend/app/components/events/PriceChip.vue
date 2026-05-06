<script setup lang="ts">
import type { Money } from '~/types'
import { formatMoney } from '~/utils/currency-formatters'

const props = defineProps<{
  money: Money
}>()
</script>

<template>
  <span class="inline-flex items-center gap-1 text-sm font-medium text-toned">
    <span>Desde</span>
    <span>{{ formatMoney(props.money.amount, props.money.currency) }}</span>
  </span>
</template>
