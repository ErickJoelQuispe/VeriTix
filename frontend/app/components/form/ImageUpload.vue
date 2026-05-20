<script setup lang="ts">
import { useUploadsRepository } from '@/repositories/uploadsRepository'
import { useFormContext } from './context'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  name: string
  label: string
  help?: string
  required?: boolean
  disabled?: boolean
  folder?: 'events' | 'artists' | 'venues'
  accept?: string
  maxSizeMb?: number
}>(), {
  help: '',
  required: false,
  disabled: false,
  folder: 'events',
  accept: 'image/jpeg,image/png,image/webp,image/avif',
  maxSizeMb: 5,
})

const modelValue = defineModel<string | undefined>()
const attrs = useAttrs()
const formContext = useFormContext()
const fileInputRef = ref<HTMLInputElement | null>(null)
const dropRef = ref<HTMLElement | null>(null)
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const localPreview = ref<string | null>(null)
const errorMessage = computed(() => formContext?.errors[props.name] ?? '')
const hasError = computed(() => Boolean(errorMessage.value))
const hasPreview = computed(() => Boolean(localPreview.value || modelValue.value))
const fieldClass = computed(() => attrs.class)
const helpId = computed(() => `${props.name}-help`)
const errorId = computed(() => `${props.name}-error`)
const { uploadImage } = useUploadsRepository()

watch(modelValue, () => {
  formContext?.clearError(props.name)
})

function onDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()

  if (!props.disabled) {
    isDragOver.value = true
  }
}

function onDragLeave(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()

  if (dropRef.value && !dropRef.value.contains(event.relatedTarget as Node | null)) {
    isDragOver.value = false
  }
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false

  if (props.disabled) {
    return
  }

  const file = event.dataTransfer?.files?.[0]

  if (file) {
    handleFile(file)
  }
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    handleFile(file)
  }
}

function setError(message: string) {
  if (!formContext) {
    return
  }

  formContext.clearError(props.name)
  formContext.errors[props.name] = message
}

function handleFile(file: File) {
  if (file.size > props.maxSizeMb * 1024 * 1024) {
    setError(`La imagen supera el límite de ${props.maxSizeMb} MB`)
    return
  }

  if (!props.accept.split(',').some(type => file.type === type.trim())) {
    setError('Formato de imagen no soportado. Usá JPG, PNG, WebP o AVIF.')
    return
  }

  localPreview.value = URL.createObjectURL(file)
  uploadProgress.value = 0
  uploadToCloudinary(file)
}

async function uploadToCloudinary(file: File) {
  isUploading.value = true
  formContext?.clearError(props.name)

  try {
    const url = await uploadImage(file, props.folder)

    modelValue.value = url
    uploadProgress.value = 100
  }
  catch {
    localPreview.value = null
    setError('Error al subir la imagen. Intentalo de nuevo.')
  }
  finally {
    isUploading.value = false
  }
}

function clearImage() {
  modelValue.value = undefined
  localPreview.value = null
  uploadProgress.value = 0

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  formContext?.clearError(props.name)
}

function triggerFileInput() {
  if (!props.disabled && !isUploading.value) {
    fileInputRef.value?.click()
  }
}

const dropZoneClass = computed(() => {
  return [
    'relative flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-all duration-150',
    isDragOver.value
      ? 'border-lavender/60 bg-lavender/8'
      : hasPreview.value
        ? 'border-default/40 bg-default/10'
        : 'border-default/40 bg-default/10 hover:border-lavender/35 hover:bg-lavender/6',
    props.disabled ? 'cursor-not-allowed opacity-60' : '',
    hasError.value ? 'border-error/50' : '',
  ]
})

const previewUrl = computed(() => {
  return localPreview.value || modelValue.value || null
})
</script>

<template>
  <label class="space-y-2" :class="[fieldClass]">
    <UiMetaLabel as="span">
      {{ props.label }}
      <span v-if="props.required" class="text-warning" aria-hidden="true">*</span>
    </UiMetaLabel>

    <div
      ref="dropRef"
      :class="dropZoneClass"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        :accept="props.accept"
        class="hidden"
        :disabled="props.disabled || isUploading"
        @change="onFileSelected"
      >

      <template v-if="isUploading">
        <div class="flex flex-col items-center gap-3">
          <BaseIcon name="i-lucide-loader-circle" class="size-10 animate-spin text-lavender" />
          <p class="text-sm font-medium text-lavender">
            Subiendo imagen...
          </p>
          <div class="h-2 w-48 overflow-hidden rounded-full bg-lavender/15">
            <div
              class="h-full rounded-full bg-lavender transition-all duration-300"
              :style="{ width: `${uploadProgress}%` }"
            />
          </div>
        </div>
      </template>

      <template v-else-if="previewUrl">
        <div class="relative w-full">
          <img
            :src="previewUrl"
            alt="Vista previa"
            class="mx-auto max-h-40 rounded-lg object-contain"
          >
          <button
            type="button"
            class="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-elevated shadow-md ring-1 ring-default/30 transition-colors hover:bg-error/15 hover:text-error"
            :disabled="props.disabled"
            @click.stop="clearImage"
          >
            <BaseIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>
        <button
          type="button"
          class="text-xs text-toned underline underline-offset-2 transition-colors hover:text-highlighted"
          :disabled="props.disabled"
          @click.stop="triggerFileInput"
        >
          Reemplazar imagen
        </button>
      </template>

      <template v-else>
        <BaseIcon name="i-lucide-cloud-upload" class="size-10 text-toned/60" />
        <div class="space-y-1">
          <p class="text-sm font-medium text-highlighted">
            Arrastrá una imagen o hace clic para seleccionar
          </p>
          <p class="text-xs text-toned/70">
            JPG, PNG, WebP o AVIF — máximo {{ props.maxSizeMb }} MB
          </p>
        </div>
        <button
          type="button"
          class="mt-1 rounded-xl border border-default/55 bg-default/20 px-4 py-2 text-sm font-medium text-highlighted shadow-sm transition hover:border-lavender/35 hover:bg-lavender/8 hover:text-lavender"
          :disabled="props.disabled"
          @click.stop="triggerFileInput"
        >
          Seleccionar archivo
        </button>
      </template>
    </div>

    <input
      type="hidden"
      :name="props.name"
      :value="modelValue ?? ''"
    >

    <p v-if="hasError" :id="errorId" class="text-xs font-medium text-error" role="alert">
      {{ errorMessage }}
    </p>

    <p v-else-if="props.help" :id="helpId" class="text-xs text-toned">
      {{ props.help }}
    </p>
  </label>
</template>
