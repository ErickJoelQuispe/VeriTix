<script setup lang="ts">
import { z } from 'zod'

const props = defineProps<{
  ticketId: string
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const transferSchema = z.object({
  recipientEmail: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresá un email válido'),
})

const formState = reactive({ recipientEmail: '' })
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const { initiateTicketTransfer, isLoading } = useTicketTransfer()

async function handleSubmit() {
  errorMessage.value = null
  successMessage.value = null

  try {
    await initiateTicketTransfer({
      ticketId: props.ticketId,
      recipientEmail: formState.recipientEmail.trim(),
    })
    successMessage.value = 'Transferencia iniciada. El destinatario recibirá un email.'
    emit('success')
  }
  catch (err: unknown) {
    if (err instanceof Error) {
      errorMessage.value = err.message
    }
    else {
      errorMessage.value = 'No pudimos completar la transferencia.'
    }
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <FormRoot
    :state="formState"
    :schema="transferSchema"
    :validate-on="[]"
    class="space-y-4"
    @submit="handleSubmit"
  >
    <FormField
      v-model="formState.recipientEmail"
      name="recipientEmail"
      label="Correo electrónico del destinatario"
      type="email"
      placeholder="destinatario@ejemplo.com"
      icon="i-lucide-mail"
      required
    />

    <!-- Success message -->
    <p v-if="successMessage" class="rounded-lg bg-success/12 px-4 py-3 text-sm text-success">
      {{ successMessage }}
    </p>

    <!-- Error message -->
    <p v-if="errorMessage" class="rounded-lg bg-error/12 px-4 py-3 text-sm text-error">
      {{ errorMessage }}
    </p>

    <div class="flex items-center justify-end gap-3 pt-1">
      <BaseButton
        variant="outlined"
        size="sm"
        type="button"
        :disabled="isLoading"
        @click="handleCancel"
      >
        Cancelar
      </BaseButton>

      <BaseButton
        variant="primary"
        size="sm"
        type="submit"
        trailing-icon="i-lucide-arrow-right"
        :loading="isLoading"
      >
        Transferir
      </BaseButton>
    </div>
  </FormRoot>
</template>
