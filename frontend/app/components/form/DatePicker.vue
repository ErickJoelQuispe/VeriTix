<script setup lang="ts">
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
  placeholder?: string
  icon?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'soft' | 'subtle' | 'ghost'
  clearable?: boolean
  min?: string
  max?: string
}>(), {
  help: '',
  required: false,
  disabled: false,
  placeholder: 'Seleccioná una fecha',
  icon: 'i-lucide-calendar-days',
  size: 'lg',
  variant: 'subtle',
  clearable: true,
  min: undefined,
  max: undefined,
})

const modelValue = defineModel<string | undefined>()
const attrs = useAttrs()
const formContext = useFormContext()
const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const listboxId = `date-picker-${Math.random().toString(36).slice(2, 10)}`
const panelStyle = ref<Record<string, string>>({})

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const fieldClass = computed(() => attrs.class)

const errorMessage = computed(() => formContext?.errors[props.name] ?? '')
const hasError = computed(() => Boolean(errorMessage.value))

const helpId = computed(() => `${props.name}-help`)
const errorId = computed(() => `${props.name}-error`)

const describedBy = computed(() => {
  if (hasError.value) {
    return errorId.value
  }

  if (props.help) {
    return helpId.value
  }

  return undefined
})

const selectedDate = computed(() => parseIsoDate(modelValue.value))
const today = startOfDay(new Date())
const viewMonth = ref(startOfMonth(selectedDate.value ?? today))

const weekdayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const monthLabel = computed(() => {
  const label = viewMonth.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
})

const monthOptions = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const yearOptions = computed(() => {
  const currentYear = today.getFullYear()
  const minYear = props.min ? parseIsoDate(props.min)?.getFullYear() ?? 1900 : 1900
  const maxYear = props.max ? parseIsoDate(props.max)?.getFullYear() ?? 2100 : 2100
  const startYear = Math.max(2000, Math.min(minYear, currentYear) - 1)
  const endYear = Math.max(maxYear, currentYear) + 1

  return Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index)
})

const triggerTextClass = computed(() => selectedDate.value ? 'text-highlighted' : 'text-toned/70')

const selectedIso = computed(() => modelValue.value ?? '')

const canClear = computed(() => props.clearable && Boolean(modelValue.value) && !props.disabled)

const controlClass = computed(() => {
  const sizeClass = {
    sm: 'min-h-9 px-3.5 py-2 text-sm',
    md: 'min-h-10 px-4 py-2.5 text-sm',
    lg: 'min-h-11 px-4.5 py-3 text-base',
  }[props.size]

  const variantClass = {
    outline: 'border border-default/60 bg-default/20 shadow-sm',
    soft: 'border border-default/55 bg-elevated/45 shadow-sm',
    subtle: 'border border-default/55 bg-default/30 shadow-sm',
    ghost: 'border border-transparent bg-transparent shadow-none',
  }[props.variant]

  const leadingPadding = props.icon ? 'pl-11' : 'pl-4'
  const trailingPadding = canClear.value ? 'pr-20' : 'pr-11'

  return [
    'relative w-full rounded-xl text-left text-highlighted transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-default/40 disabled:bg-default/15 disabled:text-toned disabled:opacity-70',
    'cursor-pointer',
    sizeClass,
    variantClass,
    hasError.value ? 'border-error/70 ring-2 ring-error/20' : 'focus-visible:border-lavender/55 focus-visible:ring-2 focus-visible:ring-lavender/35',
    leadingPadding,
    trailingPadding,
  ]
})

const panelClass = computed(() => {
  return 'z-[9999] w-72 max-w-[calc(100vw-1rem)] rounded-2xl border border-lavender/30 bg-elevated p-3 shadow-[0_16px_32px_-24px_rgba(86,29,164,0.35)] ring-1 ring-lavender/10'
})

const calendarDays = computed(() => buildCalendarDays(viewMonth.value))

watch(selectedDate, (date) => {
  if (date) {
    viewMonth.value = startOfMonth(date)
  }
})

watch(modelValue, () => {
  formContext?.clearError(props.name)
})

watch(isOpen, async (open) => {
  if (!open) {
    return
  }

  await nextTick()
  updatePanelPosition()
})

function toggleOpen() {
  if (props.disabled) {
    return
  }

  isOpen.value = !isOpen.value

  if (isOpen.value && selectedDate.value) {
    viewMonth.value = startOfMonth(selectedDate.value)
  }
  else if (isOpen.value) {
    viewMonth.value = startOfMonth(today)
  }
}

function updatePanelPosition() {
  if (!rootRef.value) {
    return
  }

  const triggerRect = rootRef.value.getBoundingClientRect()
  const margin = 12
  const gap = 12
  const estimatedHeight = 392
  const panelWidth = Math.min(320, window.innerWidth - margin * 2)
  const spaceBelow = window.innerHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top
  const placeAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow

  const top = placeAbove
    ? Math.max(margin, triggerRect.top - estimatedHeight - gap)
    : Math.min(window.innerHeight - margin - estimatedHeight, triggerRect.bottom + gap)

  const left = Math.min(
    Math.max(margin, triggerRect.left),
    window.innerWidth - panelWidth - margin,
  )

  panelStyle.value = {
    position: 'fixed',
    top: `${Math.max(margin, top)}px`,
    left: `${left}px`,
    width: `${panelWidth}px`,
  }
}

function closeOpen() {
  isOpen.value = false
}

function clearSelection() {
  modelValue.value = undefined
  viewMonth.value = startOfMonth(today)
  formContext?.clearError(props.name)
  triggerRef.value?.focus()
}

function goToday() {
  viewMonth.value = startOfMonth(today)
}

function selectDate(date: Date) {
  if (isDayDisabled(date)) {
    return
  }

  modelValue.value = toIsoDate(date)
  formContext?.clearError(props.name)
  closeOpen()
}

function setViewMonth(monthIndex: number) {
  viewMonth.value = new Date(viewMonth.value.getFullYear(), monthIndex, 1)
}

function setViewYear(year: number) {
  viewMonth.value = new Date(year, viewMonth.value.getMonth(), 1)
}

function onDocumentPointerDown(event: MouseEvent) {
  if (!isOpen.value || !rootRef.value) {
    return
  }

  const target = event.target as Node | null

  if (target && (rootRef.value.contains(target) || panelRef.value?.contains(target))) {
    return
  }

  closeOpen()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeOpen()
    triggerRef.value?.focus()
  }
}

function onViewportChange() {
  if (isOpen.value) {
    updatePanelPosition()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentPointerDown)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentPointerDown)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
})

function parseIsoDate(value?: string | null) {
  if (!value) {
    return null
  }

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) {
    return null
  }

  return startOfDay(new Date(year, month - 1, day))
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function compareDates(a: Date, b: Date) {
  return a.getFullYear() - b.getFullYear()
    || a.getMonth() - b.getMonth()
    || a.getDate() - b.getDate()
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) {
    return false
  }

  return compareDates(a, b) === 0
}

function isDayDisabled(date: Date) {
  if (props.min) {
    const minDate = parseIsoDate(props.min)
    if (minDate && compareDates(date, minDate) < 0) {
      return true
    }
  }

  if (props.max) {
    const maxDate = parseIsoDate(props.max)
    if (maxDate && compareDates(date, maxDate) > 0) {
      return true
    }
  }

  return false
}

function buildCalendarDays(month: Date) {
  const firstDay = startOfMonth(month)
  const weekdayOffset = (firstDay.getDay() + 6) % 7
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - weekdayOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)

    return {
      date,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month.getMonth(),
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, selectedDate.value),
      disabled: isDayDisabled(date),
    }
  })
}

function formatSelected(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
</script>

<template>
  <label class="space-y-2" :class="[fieldClass]">
    <UiMetaLabel as="span">
      {{ props.label }}
      <span v-if="props.required" class="text-warning" aria-hidden="true">*</span>
    </UiMetaLabel>

    <div ref="rootRef" class="relative isolate z-70 w-full">
      <input
        type="hidden"
        :name="props.name"
        :value="modelValue ?? ''"
      >

      <button
        ref="triggerRef"
        type="button"
        v-bind="forwardedAttrs"
        :disabled="props.disabled"
        :class="controlClass"
        :aria-invalid="hasError ? 'true' : undefined"
        :aria-describedby="describedBy"
        aria-haspopup="dialog"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-controls="listboxId"
        @click="toggleOpen"
      >
        <BaseIcon
          v-if="props.icon"
          :name="props.icon"
          class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-lavender/80"
          aria-hidden="true"
        />

        <span class="truncate" :class="triggerTextClass">
          {{ selectedDate ? formatSelected(selectedDate) : props.placeholder }}
        </span>

        <BaseIcon
          name="i-lucide-chevron-down"
          class="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-lavender/70 transition-transform"
          :class="isOpen ? 'rotate-180' : ''"
          aria-hidden="true"
        />
      </button>

      <button
        v-if="canClear"
        type="button"
        class="absolute right-10 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-lavender/70 transition-colors hover:bg-lavender/12 hover:text-lavender"
        @click.stop="clearSelection"
      >
        <BaseIcon name="i-lucide-x" class="size-3.5" aria-hidden="true" />
      </button>

      <Teleport to="body">
        <div
          v-if="isOpen"
          :id="listboxId"
          ref="panelRef"
          role="dialog"
          :class="panelClass"
          :style="panelStyle"
        >
          <div class="flex flex-col gap-3">
            <div class="space-y-1">
              <p class="text-sm font-semibold text-lavender">
                {{ monthLabel }}
              </p>
              <p class="text-xs text-lavender/70">
                Elegí una fecha
              </p>
            </div>

            <div class="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-2">
              <label class="sr-only" :for="`${listboxId}-month`">Mes</label>
              <select
                :id="`${listboxId}-month`"
                :value="viewMonth.getMonth()"
                class="min-h-10 cursor-pointer rounded-xl border border-default/55 bg-elevated/70 px-3 text-sm font-medium text-highlighted shadow-sm outline-none transition hover:border-lavender/35 hover:bg-elevated focus:border-lavender/55 focus:ring-2 focus:ring-lavender/20"
                aria-label="Mes"
                @change="setViewMonth(Number(($event.target as HTMLSelectElement).value))"
              >
                <option v-for="(month, index) in monthOptions" :key="month" :value="index">
                  {{ month }}
                </option>
              </select>

              <select
                :value="viewMonth.getFullYear()"
                class="min-h-10 cursor-pointer rounded-xl border border-default/55 bg-elevated/70 px-3 text-sm font-medium text-highlighted shadow-sm outline-none transition hover:border-lavender/35 hover:bg-elevated focus:border-lavender/55 focus:ring-2 focus:ring-lavender/20"
                aria-label="Año"
                @change="setViewYear(Number(($event.target as HTMLSelectElement).value))"
              >
                <option v-for="year in yearOptions" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-7 gap-1 text-center text-[0.65rem] font-semibold tracking-[0.18em] text-lavender/70 uppercase">
            <span v-for="weekday in weekdayLabels" :key="weekday">{{ weekday }}</span>
          </div>

          <div class="mt-2 grid grid-cols-7 gap-1">
            <button
              v-for="day in calendarDays"
              :key="toIsoDate(day.date)"
              type="button"
              class="flex h-10 cursor-pointer items-center justify-center rounded-xl text-sm transition"
              :class="[
                day.isCurrentMonth ? 'text-highlighted' : 'text-toned/45',
                day.disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-lavender/10 hover:text-lavender',
                day.isSelected ? 'bg-lavender text-white shadow-[0_14px_26px_-18px_rgba(86,29,164,0.72)] hover:bg-lavender hover:text-white' : '',
                day.isToday && !day.isSelected ? 'ring-1 ring-inset ring-lavender/30' : '',
              ]"
              :disabled="day.disabled"
              :aria-pressed="day.isSelected ? 'true' : 'false'"
              @click="selectDate(day.date)"
            >
              {{ day.day }}
            </button>
          </div>

          <div class="mt-4 flex items-center justify-between gap-3 border-t border-lavender/20 pt-3">
            <BaseButton variant="outlined" size="sm" leading-icon="i-lucide-calendar-days" class="border-lavender/25 text-lavender hover:border-lavender/45 hover:bg-lavender/10 hover:text-lavender" @click="goToday">
              Hoy
            </BaseButton>

            <BaseButton
              v-if="selectedIso"
              variant="outlined"
              size="sm"
              leading-icon="i-lucide-trash-2"
              class="border-lavender/25 text-lavender hover:border-lavender/45 hover:bg-lavender/10 hover:text-lavender"
              aria-label="Limpiar fecha"
              @click="clearSelection"
            >
              Limpiar
            </BaseButton>
          </div>
        </div>
      </Teleport>
    </div>

    <p v-if="hasError" :id="errorId" class="text-xs font-medium text-error" role="alert">
      {{ errorMessage }}
    </p>

    <p v-else-if="props.help" :id="helpId" class="text-xs text-toned">
      {{ props.help }}
    </p>
  </label>
</template>
