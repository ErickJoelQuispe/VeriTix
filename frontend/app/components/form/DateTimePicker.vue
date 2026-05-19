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
  clearable?: boolean
  min?: string
  max?: string
}>(), {
  help: '',
  required: false,
  disabled: false,
  placeholder: 'Seleccioná una fecha y hora',
  icon: 'i-lucide-calendar-days',
  size: 'lg',
  clearable: true,
  min: undefined,
  max: undefined,
})

const modelValue = defineModel<string | undefined>()
const attrs = useAttrs()
const formContext = useFormContext()
const isOpen = ref(false)
const activeMenu = ref<'month' | 'year' | null>(null)
const activeTimeMenu = ref<'hour' | 'minute' | null>(null)
const rootRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const listboxId = `datetime-picker-${Math.random().toString(36).slice(2, 10)}`
const panelStyle = ref<Record<string, string>>({})
const hourValue = ref('00')
const minuteValue = ref('00')

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

const TIME_REGEX = /T(\d{2}:\d{2})/
const HOUR_REGEX = /T(\d{2})/
const MINUTE_REGEX = /:(\d{2})/

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

const currentMonthLabel = computed(() => monthOptions[viewMonth.value.getMonth()])
const currentYearLabel = computed(() => `${viewMonth.value.getFullYear()}`)

const yearOptions = computed(() => {
  const currentYear = today.getFullYear()
  const minYear = props.min ? parseIsoDate(props.min)?.getFullYear() ?? 1900 : 1900
  const maxYear = props.max ? parseIsoDate(props.max)?.getFullYear() ?? 2100 : 2100
  const startYear = Math.max(2000, Math.min(minYear, currentYear) - 1)
  const endYear = Math.max(maxYear, currentYear) + 1

  return Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index)
})

const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))

const minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

const triggerTextClass = computed(() => selectedDate.value ? 'text-highlighted' : 'text-toned/70')

const selectedIso = computed(() => modelValue.value ?? '')

const canClear = computed(() => props.clearable && Boolean(modelValue.value) && !props.disabled)

const controlClass = computed(() => {
  const sizeClass = {
    sm: 'min-h-9 px-3.5 py-2 text-sm',
    md: 'min-h-10 px-4 py-2.5 text-sm',
    lg: 'min-h-11 px-4.5 py-3 text-base',
  }[props.size]

  const leadingPadding = props.icon ? 'pl-11' : 'pl-4'
  const trailingPadding = canClear.value ? 'pr-20' : 'pr-11'

  return [
    'relative w-full rounded-xl border border-default/55 bg-default/30 text-left text-highlighted shadow-sm transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-default/40 disabled:bg-default/15 disabled:text-toned disabled:opacity-70',
    'cursor-pointer',
    sizeClass,
    hasError.value ? 'border-error/70 ring-2 ring-error/20' : 'focus-visible:border-lavender/55 focus-visible:ring-2 focus-visible:ring-lavender/35',
    leadingPadding,
    trailingPadding,
  ]
})

const panelClass = computed(() => {
  return 'z-[9999] w-72 max-w-[calc(100vw-1rem)] rounded-2xl border border-lavender/45 bg-elevated p-3 shadow-[0_16px_32px_-24px_rgba(86,29,164,0.28)] ring-1 ring-lavender/15'
})

const calendarDays = computed(() => buildCalendarDays(viewMonth.value))

const triggerText = computed(() => {
  if (!modelValue.value) {
    return props.placeholder
  }

  const date = parseIsoDate(modelValue.value)

  if (!date) {
    return props.placeholder
  }

  const datePart = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)

  const timeMatch = modelValue.value.match(TIME_REGEX)

  return timeMatch ? `${datePart}, ${timeMatch[1]}` : datePart
})

watch(selectedDate, (date) => {
  if (date) {
    viewMonth.value = startOfMonth(date)
  }
})

watch(modelValue, (val) => {
  if (val) {
    const h = val.match(HOUR_REGEX)
    hourValue.value = h?.[1] ?? '00'

    const m = val.match(MINUTE_REGEX)
    minuteValue.value = m?.[1] ?? '00'
  }

  formContext?.clearError(props.name)
}, { immediate: true })

watch(isOpen, async (open) => {
  if (!open) {
    activeMenu.value = null
    activeTimeMenu.value = null
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
  activeMenu.value = null
  activeTimeMenu.value = null

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
  const estimatedHeight = 580
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
  activeMenu.value = null
  activeTimeMenu.value = null
}

function clearSelection() {
  modelValue.value = undefined
  hourValue.value = '00'
  minuteValue.value = '00'
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

  modelValue.value = toIsoDateTime(date, hourValue.value, minuteValue.value)
  formContext?.clearError(props.name)
}

function selectHour(hour: string) {
  hourValue.value = hour
  activeTimeMenu.value = null

  if (selectedDate.value) {
    modelValue.value = toIsoDateTime(selectedDate.value, hour, minuteValue.value)
  }
}

function selectMinute(minute: string) {
  minuteValue.value = minute
  activeTimeMenu.value = null

  if (selectedDate.value) {
    modelValue.value = toIsoDateTime(selectedDate.value, hourValue.value, minute)
  }
}

function setViewMonth(monthIndex: number) {
  viewMonth.value = new Date(viewMonth.value.getFullYear(), monthIndex, 1)
}

function setViewYear(year: number) {
  viewMonth.value = new Date(year, viewMonth.value.getMonth(), 1)
}

function toggleMenu(menu: 'month' | 'year') {
  activeTimeMenu.value = null
  activeMenu.value = activeMenu.value === menu ? null : menu
}

function toggleTimeMenu(menu: 'hour' | 'minute') {
  activeMenu.value = null
  activeTimeMenu.value = activeTimeMenu.value === menu ? null : menu
}

function selectMonth(monthIndex: number) {
  setViewMonth(monthIndex)
  activeMenu.value = null
}

function selectYear(year: number) {
  setViewYear(year)
  activeMenu.value = null
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
    if (activeTimeMenu.value) {
      activeTimeMenu.value = null
    }
    else if (activeMenu.value) {
      activeMenu.value = null
    }
    else {
      closeOpen()
      triggerRef.value?.focus()
    }
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

  const [dateStr] = value.split('T')

  if (!dateStr) {
    return null
  }

  const [year, month, day] = dateStr.split('-').map(Number)

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

function toIsoDateTime(date: Date, hour: string, minute: string) {
  return `${toIsoDate(date)}T${hour}:${minute}`
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
          class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/60"
          aria-hidden="true"
        />

        <span class="truncate" :class="triggerTextClass">
          {{ triggerText }}
        </span>

        <BaseIcon
          name="i-lucide-chevron-down"
          class="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-white/45 transition-transform"
          :class="isOpen ? 'rotate-180' : ''"
          aria-hidden="true"
        />
      </button>

      <button
        v-if="canClear"
        type="button"
        class="absolute right-10 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white/80"
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
          <div class="flex flex-col gap-3 border-b border-lavender/15 pb-3">
            <div class="space-y-1">
              <p class="text-sm font-semibold text-lavender">
                {{ monthLabel }}
              </p>
              <p class="text-xs text-lavender/70">
                Elegí una fecha y hora
              </p>
            </div>

            <div class="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-2">
              <div class="relative">
                <button
                  type="button"
                  class="flex min-h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-default/55 bg-default/20 px-3 text-sm font-medium text-highlighted shadow-sm transition hover:border-lavender/35 hover:bg-default/30 focus-visible:border-lavender/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/20"
                  aria-haspopup="listbox"
                  :aria-expanded="activeMenu === 'month' ? 'true' : 'false'"
                  @click="toggleMenu('month')"
                >
                  <span class="truncate">{{ currentMonthLabel }}</span>
                  <BaseIcon name="i-lucide-chevron-down" class="size-4 text-toned transition-transform" :class="activeMenu === 'month' ? 'rotate-180' : ''" />
                </button>

                <div
                  v-if="activeMenu === 'month'"
                  class="absolute left-0 top-full z-10 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-lavender/25 bg-elevated p-1 shadow-lg"
                >
                  <button
                    v-for="(month, index) in monthOptions"
                    :key="month"
                    type="button"
                    class="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-lavender/10 hover:text-lavender"
                    :class="viewMonth.getMonth() === index ? 'bg-lavender/10 text-lavender' : 'text-highlighted'"
                    @click="selectMonth(index)"
                  >
                    <span>{{ month }}</span>
                    <BaseIcon v-if="viewMonth.getMonth() === index" name="i-lucide-check" class="size-4" />
                  </button>
                </div>
              </div>

              <div class="relative">
                <button
                  type="button"
                  class="flex min-h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-default/55 bg-default/20 px-3 text-sm font-medium text-highlighted shadow-sm transition hover:border-lavender/35 hover:bg-default/30 focus-visible:border-lavender/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/20"
                  aria-haspopup="listbox"
                  :aria-expanded="activeMenu === 'year' ? 'true' : 'false'"
                  @click="toggleMenu('year')"
                >
                  <span class="truncate">{{ currentYearLabel }}</span>
                  <BaseIcon name="i-lucide-chevron-down" class="size-4 text-toned transition-transform" :class="activeMenu === 'year' ? 'rotate-180' : ''" />
                </button>

                <div
                  v-if="activeMenu === 'year'"
                  class="absolute right-0 top-full z-10 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-lavender/25 bg-elevated p-1 shadow-lg"
                >
                  <button
                    v-for="year in yearOptions"
                    :key="year"
                    type="button"
                    class="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-lavender/10 hover:text-lavender"
                    :class="viewMonth.getFullYear() === year ? 'bg-lavender/10 text-lavender' : 'text-highlighted'"
                    @click="selectYear(year)"
                  >
                    <span>{{ year }}</span>
                    <BaseIcon v-if="viewMonth.getFullYear() === year" name="i-lucide-check" class="size-4" />
                  </button>
                </div>
              </div>
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
              class="flex h-10 cursor-pointer items-center justify-center rounded-xl text-sm font-medium transition"
              :class="[
                day.isCurrentMonth ? 'text-highlighted' : 'text-toned/45',
                day.disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-lavender/10 hover:text-lavender',
                day.isSelected ? 'bg-lavender text-white shadow-sm hover:bg-lavender hover:text-white' : '',
                day.isToday && !day.isSelected ? 'ring-1 ring-inset ring-lavender/30' : '',
              ]"
              :disabled="day.disabled"
              :aria-pressed="day.isSelected ? 'true' : 'false'"
              @click="selectDate(day.date)"
            >
              {{ day.day }}
            </button>
          </div>

          <div class="mt-4 border-t border-lavender/20 pt-3">
            <p class="mb-2 text-xs font-medium text-lavender/70">
              Hora
            </p>

            <div class="grid grid-cols-2 gap-2">
              <div class="relative">
                <button
                  type="button"
                  class="flex min-h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-default/55 bg-default/20 px-3 text-sm font-medium text-highlighted shadow-sm transition hover:border-lavender/35 hover:bg-default/30 focus-visible:border-lavender/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/20"
                  aria-haspopup="listbox"
                  :aria-expanded="activeTimeMenu === 'hour' ? 'true' : 'false'"
                  @click="toggleTimeMenu('hour')"
                >
                  <span>{{ hourValue }}</span>
                  <BaseIcon name="i-lucide-chevron-down" class="size-4 text-toned transition-transform" :class="activeTimeMenu === 'hour' ? 'rotate-180' : ''" />
                </button>

                <div
                  v-if="activeTimeMenu === 'hour'"
                  class="absolute left-0 top-full z-10 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-lavender/25 bg-elevated p-1 shadow-lg"
                >
                  <button
                    v-for="hour in hourOptions"
                    :key="hour"
                    type="button"
                    class="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-lavender/10 hover:text-lavender"
                    :class="hourValue === hour ? 'bg-lavender/10 text-lavender' : 'text-highlighted'"
                    @click="selectHour(hour)"
                  >
                    <span>{{ hour }}</span>
                    <BaseIcon v-if="hourValue === hour" name="i-lucide-check" class="size-4" />
                  </button>
                </div>
              </div>

              <div class="relative">
                <button
                  type="button"
                  class="flex min-h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-default/55 bg-default/20 px-3 text-sm font-medium text-highlighted shadow-sm transition hover:border-lavender/35 hover:bg-default/30 focus-visible:border-lavender/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/20"
                  aria-haspopup="listbox"
                  :aria-expanded="activeTimeMenu === 'minute' ? 'true' : 'false'"
                  @click="toggleTimeMenu('minute')"
                >
                  <span>{{ minuteValue }}</span>
                  <BaseIcon name="i-lucide-chevron-down" class="size-4 text-toned transition-transform" :class="activeTimeMenu === 'minute' ? 'rotate-180' : ''" />
                </button>

                <div
                  v-if="activeTimeMenu === 'minute'"
                  class="absolute left-0 top-full z-10 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-lavender/25 bg-elevated p-1 shadow-lg"
                >
                  <button
                    v-for="minute in minuteOptions"
                    :key="minute"
                    type="button"
                    class="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-lavender/10 hover:text-lavender"
                    :class="minuteValue === minute ? 'bg-lavender/10 text-lavender' : 'text-highlighted'"
                    @click="selectMinute(minute)"
                  >
                    <span>{{ minute }}</span>
                    <BaseIcon v-if="minuteValue === minute" name="i-lucide-check" class="size-4" />
                  </button>
                </div>
              </div>
            </div>
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
              aria-label="Limpiar fecha y hora"
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
