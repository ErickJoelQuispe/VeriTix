<script setup lang="ts">
import type { ZodTypeAny } from 'zod'
import { formContextKey } from './context'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  state?: Record<string, unknown>
  schema?: ZodTypeAny
  validateOn?: unknown
}>(), {
  state: undefined,
  schema: undefined,
  validateOn: undefined,
})

const emit = defineEmits<{
  submit: [event: SubmitEvent]
}>()

const attrs = useAttrs()
const errors = reactive<Record<string, string>>({})

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const formClass = computed(() => attrs.class)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    delete errors[key]
  })
}

function clearError(name: string) {
  delete errors[name]
}

function validateState() {
  if (!props.schema) {
    return true
  }

  clearErrors()
  const result = props.schema.safeParse(toRaw(props.state ?? {}))

  if (result.success) {
    return true
  }

  for (const issue of result.error.issues) {
    const field = issue.path[0]

    if (typeof field === 'string' && !errors[field]) {
      errors[field] = issue.message
    }
  }

  return false
}

function handleSubmit(event: SubmitEvent) {
  event.preventDefault()

  if (!validateState()) {
    return
  }

  emit('submit', event)
}

provide(formContextKey, {
  errors,
  clearError,
})
</script>

<template>
  <form v-bind="forwardedAttrs" :class="formClass" @submit="handleSubmit">
    <slot />
  </form>
</template>
