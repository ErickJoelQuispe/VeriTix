<script setup lang="ts">
const toastQueue = useToastQueue()

const paginationPage = ref(3)
const popoverOpen = ref(false)

const demoForm = reactive({
  name: 'Camila Torres',
  email: 'camila@veritix.com',
  password: 'veritix-demo',
  role: 'organizer',
  notes: 'This playground mirrors the shared form shell used across backoffice screens.',
})

const rawInput = ref('VeriTix')
const rawInputOutline = ref('Outline variant')
const rawPassword = ref('veritix-demo')
const rawNotes = ref('Reusable textarea control')
const rawRole = ref('admin')

const buttonVariants = [
  { label: 'Primary', variant: 'primary', icon: 'i-lucide-sparkles' },
  { label: 'Secondary', variant: 'secondary', icon: 'i-lucide-diamond' },
  { label: 'Outlined', variant: 'outlined', icon: 'i-lucide-orbit' },
  { label: 'Reversed', variant: 'reversed', icon: 'i-lucide-arrow-right' },
] as const

const badgeVariants = [
  { label: 'Success', kind: 'status', color: 'success', icon: 'i-lucide-badge-check' },
  { label: 'Neutral', kind: 'tag', color: 'neutral', icon: 'i-lucide-tag' },
  { label: 'Info', kind: 'info', color: 'info', icon: 'i-lucide-info' },
  { label: 'Accent', kind: 'accent', color: 'primary', icon: 'i-lucide-sparkles' },
] as const

const avatarVariants = [
  { text: 'VT', size: 'xs' },
  { text: 'VT', size: 'sm' },
  { text: 'VT', size: 'md' },
  { text: 'VT', size: 'lg' },
] as const

const iconVariants = [
  { label: 'Calendar', name: 'i-lucide-calendar-days' },
  { label: 'Ticket', name: 'i-lucide-ticket' },
  { label: 'Layout', name: 'i-lucide-layout-grid' },
  { label: 'Bell', name: 'i-lucide-bell' },
] as const

const toastPresets = [
  {
    title: 'Saved',
    description: 'The green toast is the success state used for confirmations.',
    color: 'success' as const,
    icon: 'i-lucide-check-circle',
  },
  {
    title: 'Heads up',
    description: 'The amber toast is useful for soft warnings and reminders.',
    color: 'warning' as const,
    icon: 'i-lucide-alert-triangle',
  },
  {
    title: 'FYI',
    description: 'The blue toast works for neutral status updates.',
    color: 'info' as const,
    icon: 'i-lucide-info',
  },
] as const

const formRoleItems = [
  { label: 'Organizer', value: 'organizer' },
  { label: 'Artist', value: 'artist' },
  { label: 'Admin', value: 'admin' },
]

function pushToast(preset: typeof toastPresets[number]) {
  toastQueue.add({
    title: preset.title,
    description: preset.description,
    color: preset.color,
    icon: preset.icon,
  })
}

function submitDemoForm() {
  toastQueue.add({
    title: 'Form demo submitted',
    description: `${demoForm.name} can keep iterating on the playground without leaving the page.`,
    color: 'success',
    icon: 'i-lucide-send',
  })
}
</script>

<template>
  <main class="py-16 sm:py-20">
    <BaseContainer>
      <div class="space-y-16">
        <header class="max-w-3xl space-y-4">
          <p class="vtx-eyebrow">
            UI / Components
          </p>
          <h1 class="font-display text-5xl leading-none text-highlighted sm:text-6xl">
            Primitives and reusable blocks.
          </h1>
          <p class="text-base leading-relaxed text-toned sm:text-lg">
            A living playground for base primitives, shared UI blocks, form controls, and toast states.
          </p>
        </header>

        <section class="space-y-6">
          <UiSectionHeading
            eyebrow="Base"
            title="Primitives base."
            description="Buttons, badges, avatars, icons, skeletons, pagination, and popovers from the shared foundation layer."
          />

          <div class="grid gap-6 xl:grid-cols-2">
            <UiGlassPanel class="space-y-5">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Buttons and badges
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  Core actions and status chips used throughout the app.
                </p>
              </div>

              <div class="flex flex-wrap gap-3">
                <BaseButton
                  v-for="button in buttonVariants"
                  :key="button.label"
                  :variant="button.variant"
                  :leading-icon="button.icon"
                >
                  {{ button.label }}
                </BaseButton>
              </div>

              <div class="flex flex-wrap gap-2">
                <BaseBadge
                  v-for="badge in badgeVariants"
                  :key="badge.label"
                  :kind="badge.kind"
                  :color="badge.color"
                  :icon="badge.icon"
                >
                  {{ badge.label }}
                </BaseBadge>
              </div>
            </UiGlassPanel>

            <UiGlassPanel class="space-y-5">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Avatars and icons
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  Tiny identity and affordance primitives for compact interfaces.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <BaseAvatar
                  v-for="avatar in avatarVariants"
                  :key="avatar.size"
                  :text="avatar.text"
                  :size="avatar.size"
                />
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div
                  v-for="icon in iconVariants"
                  :key="icon.label"
                  class="flex items-center gap-3 rounded-xl border border-default/55 bg-default/20 px-4 py-3"
                >
                  <BaseIcon :name="icon.name" class="size-5 text-secondary" />
                  <span class="text-sm font-medium text-highlighted">{{ icon.label }}</span>
                </div>
              </div>
            </UiGlassPanel>

            <UiGlassPanel class="space-y-5">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Skeletons and pagination
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  Loading placeholders and navigation controls for denser lists.
                </p>
              </div>

              <div class="space-y-3">
                <BaseSkeleton class="h-4 w-3/4" />
                <BaseSkeleton class="h-4 w-1/2" />
                <BaseSkeleton class="h-24 w-full" />
              </div>

              <BasePagination
                v-model:page="paginationPage"
                :total="120"
                :items-per-page="10"
                show-edges
                class="justify-start"
              />

              <p class="text-xs text-toned">
                Current page: {{ paginationPage }}
              </p>
            </UiGlassPanel>

            <UiGlassPanel class="space-y-5">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Popover
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  A lightweight floating surface for compact contextual actions.
                </p>
              </div>

              <BasePopover
                v-model:open="popoverOpen"
                :content="{ align: 'center', side: 'bottom', sideOffset: 12 }"
              >
                <BaseButton variant="outlined" trailing-icon="i-lucide-chevron-down">
                  Toggle popover
                </BaseButton>

                <template #content>
                  <UiGlassPanel class="w-72 space-y-3">
                    <div class="space-y-1">
                      <p class="text-sm font-semibold text-highlighted">
                        Popover demo
                      </p>
                      <p class="text-sm leading-relaxed text-toned">
                        Great for compact menus, summaries, and quick previews.
                      </p>
                    </div>

                    <div class="flex items-center gap-2">
                      <BaseBadge kind="outline" color="secondary" icon="i-lucide-sparkles">
                        Open
                      </BaseBadge>
                      <BaseBadge kind="tag">
                        Contextual
                      </BaseBadge>
                    </div>
                  </UiGlassPanel>
                </template>
              </BasePopover>
            </UiGlassPanel>
          </div>
        </section>

        <section class="space-y-6">
          <UiSectionHeading
            eyebrow="Shared UI"
            title="Reusable blocks."
            description="Composition helpers that sit above primitives: headings, glass surfaces, labels, and empty states."
          />

          <div class="grid gap-6 lg:grid-cols-2">
            <UiGlassPanel class="space-y-5">
              <UiSectionHeading
                eyebrow="Section heading"
                title="A reusable section header."
                description="Use it to keep section hierarchy and action placement consistent."
                action-label="Browse events"
                action-to="/events"
              />
            </UiGlassPanel>

            <UiGlassPanel class="space-y-5">
              <div class="space-y-3">
                <UiMetaLabel tone="default">
                  Meta label
                </UiMetaLabel>
                <UiMetaLabel tone="accent">
                  Accent meta label
                </UiMetaLabel>
              </div>

              <UiEmptyState
                icon="i-lucide-layout-grid"
                title="Nothing selected"
                description="Empty states can guide the user toward the next action without feeling dead."
                action-label="Go to events"
                action-to="/events"
              />
            </UiGlassPanel>

            <UiGlassPanel class="space-y-5 lg:col-span-2">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Glass panels
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  The surface component used to frame cards, sections, and controls.
                </p>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <UiGlassPanel tone="subtle" padding="sm" radius="md">
                  <p class="text-sm font-medium text-highlighted">
                    Subtle panel
                  </p>
                  <p class="mt-1 text-sm text-toned">
                    Lower contrast for nested content.
                  </p>
                </UiGlassPanel>

                <UiGlassPanel tone="strong" padding="lg" radius="xl" interactive>
                  <p class="text-sm font-medium text-highlighted">
                    Interactive panel
                  </p>
                  <p class="mt-1 text-sm text-toned">
                    Hover and focus states are built in.
                  </p>
                </UiGlassPanel>
              </div>
            </UiGlassPanel>
          </div>
        </section>

        <section class="space-y-6">
          <UiSectionHeading
            eyebrow="Forms"
            title="Form primitives."
            description="Field wrappers and controls used to build the backoffice forms without duplicating patterns."
          />

          <div class="grid gap-6 xl:grid-cols-2">
            <UiGlassPanel class="space-y-5">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  FormRoot + FormField
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  This mirrors the real layout used in the admin area.
                </p>
              </div>

              <FormRoot :state="demoForm" :validate-on="[]" class="space-y-5" @submit="submitDemoForm">
                <FormField v-model="demoForm.name" name="name" label="Nombre" help="Shown in the header of the demo record." required />
                <FormField v-model="demoForm.email" name="email" label="Correo" type="email" help="Validation and error rendering are handled by the field." required />
                <FormPassword v-model="demoForm.password" name="password" label="Contraseña" help="The password control includes a visibility toggle." required />
                <FormSelect
                  v-model="demoForm.role"
                  name="role"
                  label="Rol"
                  :items="formRoleItems"
                  placeholder="Seleccioná un rol"
                  help="Selects share the same form context and error surface."
                />
                <FormTextarea v-model="demoForm.notes" name="notes" label="Notas" help="Use it for longer copy, comments, and descriptions." :rows="4" />

                <BaseButton type="submit" variant="primary" leading-icon="i-lucide-send">
                  Submit demo
                </BaseButton>
              </FormRoot>
            </UiGlassPanel>

            <UiGlassPanel class="space-y-5">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Raw control set
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  The lower-level inputs are still available when a wrapper is not needed.
                </p>
              </div>

              <div class="space-y-4">
                <FormInput v-model="rawInput" name="rawInput" placeholder="FormInput with icon" icon="i-lucide-search" />
                <FormInput v-model="rawInputOutline" name="rawInputOutline" variant="outline" placeholder="Outline variant" />
                <FormPassword v-model="rawPassword" name="rawPassword" label="Password control" />
                <FormTextarea v-model="rawNotes" name="rawNotes" placeholder="Textarea without a label" :rows="4" />
                <FormSelect v-model="rawRole" name="rawRole" label="Select control" :items="formRoleItems" />
              </div>
            </UiGlassPanel>
          </div>
        </section>

        <section class="space-y-6">
          <UiSectionHeading
            eyebrow="Notifications"
            title="Toast example."
            description="The global toast host is already mounted; these buttons push sample notifications into the queue."
          />

          <div class="grid gap-6 lg:grid-cols-[1fr_auto]">
            <UiGlassPanel class="space-y-4">
              <p class="text-sm leading-relaxed text-toned">
                Tap any action to enqueue a toast. The host renders at the bottom-right of the app shell.
              </p>

              <div class="grid gap-3 sm:grid-cols-3">
                <BaseButton
                  v-for="preset in toastPresets"
                  :key="preset.title"
                  variant="secondary"
                  :leading-icon="preset.icon"
                  @click="pushToast(preset)"
                >
                  {{ preset.title }}
                </BaseButton>
              </div>
            </UiGlassPanel>

            <UiGlassPanel class="space-y-3">
              <UiMetaLabel tone="accent">
                Live feedback
              </UiMetaLabel>
              <p class="text-sm leading-relaxed text-toned">
                Toasts are useful for ephemeral confirmations, warnings, and inline status updates.
              </p>
            </UiGlassPanel>
          </div>
        </section>
      </div>
    </BaseContainer>
  </main>
</template>
