<script setup lang="ts">
const currentPasswordModel = defineModel<string>('currentPassword', { default: '' })
const newPasswordModel = defineModel<string>('newPassword', { default: '' })
const confirmPasswordModel = defineModel<string>('confirmPassword', { default: '' })
const showCurrentPasswordModel = defineModel<boolean>('showCurrentPassword', { default: false })
const showNewPasswordModel = defineModel<boolean>('showNewPassword', { default: false })
const showConfirmPasswordModel = defineModel<boolean>('showConfirmPassword', { default: false })
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <div>
        <UiMetaLabel>
          Seguridad
        </UiMetaLabel>
        <h3 class="mt-3 text-2xl font-semibold text-highlighted">
          Cambiar contraseña
        </h3>
      </div>

      <p class="text-sm leading-relaxed text-toned">
        Usá una clave nueva con al menos 8 caracteres, una mayúscula y un número.
      </p>
    </div>

    <BasePasswordField
      v-model="currentPasswordModel"
      name="currentPassword"
      label="Contraseña actual"
      placeholder="Contraseña actual"
      icon="i-lucide-lock"
      :show="showCurrentPasswordModel"
      required
      @update:show="showCurrentPasswordModel = $event"
    />

    <div class="grid gap-5 lg:grid-cols-2">
      <BasePasswordField
        v-model="newPasswordModel"
        name="newPassword"
        label="Nueva contraseña"
        help="8+ caracteres · mayúscula · minúscula · número"
        placeholder="Nueva contraseña"
        icon="i-lucide-shield"
        :show="showNewPasswordModel"
        required
        @update:show="showNewPasswordModel = $event"
      />

      <BasePasswordField
        v-model="confirmPasswordModel"
        name="confirmPassword"
        label="Confirmar contraseña"
        placeholder="Confirmar contraseña"
        icon="i-lucide-check-check"
        :show="showConfirmPasswordModel"
        required
        @update:show="showConfirmPasswordModel = $event"
      />
    </div>
  </div>
</template>
