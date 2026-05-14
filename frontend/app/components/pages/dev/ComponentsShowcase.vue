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
const wrappedInput = ref('Search term')
const rawInputHero = ref('Hero variant')
const rawPassword = ref('veritix-demo')
const rawNotes = ref('Reusable textarea control')
const rawRole = ref('admin')
const rawDate = ref('2026-05-14')

const buttonVariants = [
  { label: 'Primary', variant: 'primary', icon: 'i-lucide-sparkles' },
  { label: 'Secondary', variant: 'secondary', icon: 'i-lucide-diamond' },
  { label: 'Outlined', variant: 'outlined', icon: 'i-lucide-orbit' },
  { label: 'Reversed', variant: 'reversed', icon: 'i-lucide-arrow-right' },
  { label: 'Warning', variant: 'warning', icon: 'i-lucide-sun-medium' },
  { label: 'Danger', variant: 'danger', icon: 'i-lucide-triangle-alert' },
] as const

const buttonSizeVariants = [
  { label: 'XS', size: 'xs' },
  { label: 'SM', size: 'sm' },
  { label: 'MD', size: 'md' },
  { label: 'LG', size: 'lg' },
  { label: 'XL', size: 'xl' },
] as const

const badgeKindVariants = [
  { label: 'Status', kind: 'status', color: 'success', icon: 'i-lucide-activity' },
  { label: 'Tag', kind: 'tag', color: 'neutral', icon: 'i-lucide-tag' },
  { label: 'Outline', kind: 'outline', color: 'info', icon: 'i-lucide-circle-dashed' },
  { label: 'Info', kind: 'info', color: 'info', icon: 'i-lucide-info' },
  { label: 'Role', kind: 'role', color: 'primary', icon: 'i-lucide-shield-check' },
  { label: 'Price', kind: 'price', color: 'warning', icon: 'i-lucide-ticket' },
  { label: 'Accent', kind: 'accent', color: 'primary', icon: 'i-lucide-sparkles' },
] as const

const badgeColorVariants = [
  { label: 'Primary', color: 'primary' },
  { label: 'Secondary', color: 'secondary' },
  { label: 'Success', color: 'success' },
  { label: 'Info', color: 'info' },
  { label: 'Warning', color: 'warning' },
  { label: 'Error', color: 'error' },
  { label: 'Neutral', color: 'neutral' },
] as const

const badgeSizeVariants = [
  { label: 'XS', size: 'xs' },
  { label: 'SM', size: 'sm' },
  { label: 'MD', size: 'md' },
  { label: 'LG', size: 'lg' },
  { label: 'XL', size: 'xl' },
] as const

const avatarVariants = [
  { text: 'VT', size: 'lg' },
  { text: 'VT', size: 'xl' },
] as const

const iconVariants = [
  { label: 'Calendar', name: 'i-lucide-calendar-days' },
  { label: 'Ticket', name: 'i-lucide-ticket' },
  { label: 'Layout', name: 'i-lucide-layout-grid' },
  { label: 'Bell', name: 'i-lucide-bell' },
] as const

const toastPresets = [
  {
    title: 'Error',
    description: 'Use this for failures, validation issues, and actions that could not complete.',
    color: 'error' as const,
    icon: 'i-lucide-circle-alert',
  },
  {
    title: 'Saved',
    description: 'The green toast is the success state used for confirmations.',
    color: 'success' as const,
    icon: 'i-lucide-circle-check',
  },
  {
    title: 'Heads up',
    description: 'The amber toast is useful for soft warnings and reminders.',
    color: 'warning' as const,
    icon: 'i-lucide-triangle-alert',
  },
  {
    title: 'FYI',
    description: 'The blue toast works for neutral status updates.',
    color: 'info' as const,
    icon: 'i-lucide-info',
  },
  {
    title: 'Neutral',
    description: 'Neutral toasts are useful for generic, non-blocking updates.',
    color: 'neutral' as const,
    icon: 'i-lucide-bell',
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
        <section id="base" class="space-y-6 scroll-mt-24">
          <UiSectionHeading
            eyebrow="Base"
            title="Primitives base."
            description="Buttons, badges, avatars, icons, skeletons, pagination, and popovers from the shared foundation layer."
          />

          <div class="grid gap-6 lg:grid-cols-2">
            <UiPanel class="space-y-6 lg:col-span-2">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Buttons
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  Full reference of button kinds/variants used across screens and flows.
                </p>
              </div>

              <div class="space-y-3">
                <p class="text-xs font-medium tracking-wide text-toned uppercase">
                  All kinds
                </p>

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
              </div>

              <div class="space-y-3">
                <p class="text-xs font-medium tracking-wide text-toned uppercase">
                  All sizes
                </p>

                <div class="flex flex-wrap items-center gap-3">
                  <BaseButton
                    v-for="button in buttonSizeVariants"
                    :key="`button-size-${button.size}`"
                    variant="secondary"
                    :size="button.size"
                  >
                    Size {{ button.label }}
                  </BaseButton>
                </div>
              </div>
            </UiPanel>

            <UiPanel class="space-y-6 lg:col-span-2">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Badges
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  Full reference for badge kinds, colors, and sizing options.
                </p>
              </div>

              <div class="grid gap-5 lg:grid-cols-3">
                <div class="space-y-3">
                  <p class="text-xs font-medium tracking-wide text-toned uppercase">
                    All kinds
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <BaseBadge
                      v-for="badge in badgeKindVariants"
                      :key="`kind-${badge.kind}`"
                      :kind="badge.kind"
                      :color="badge.color"
                      :icon="badge.icon"
                    >
                      {{ badge.label }}
                    </BaseBadge>
                  </div>
                </div>

                <div class="space-y-3">
                  <p class="text-xs font-medium tracking-wide text-toned uppercase">
                    All colors
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <BaseBadge
                      v-for="badge in badgeColorVariants"
                      :key="`color-${badge.color}`"
                      kind="accent"
                      :color="badge.color"
                    >
                      {{ badge.label }}
                    </BaseBadge>
                  </div>
                </div>

                <div class="space-y-3">
                  <p class="text-xs font-medium tracking-wide text-toned uppercase">
                    All sizes
                  </p>
                  <div class="flex flex-wrap items-center gap-2">
                    <BaseBadge
                      v-for="badge in badgeSizeVariants"
                      :key="`size-${badge.size}`"
                      kind="accent"
                      color="primary"
                      :size="badge.size"
                    >
                      Size {{ badge.label }}
                    </BaseBadge>
                  </div>
                </div>
              </div>
            </UiPanel>

            <UiPanel class="space-y-5 xl:col-span-2">
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
            </UiPanel>

            <UiPanel class="space-y-5 xl:col-span-2">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Skeletons and pagination
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  Loading placeholders and navigation controls for denser lists.
                </p>
              </div>

              <div class="space-y-3">
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
            </UiPanel>

            <UiPanel class="space-y-5">
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
                  <UiPanel class="w-72 space-y-3">
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
                  </UiPanel>
                </template>
              </BasePopover>
            </UiPanel>
          </div>
        </section>

        <section id="shared-ui" class="space-y-6 scroll-mt-24">
          <UiSectionHeading
            eyebrow="Shared UI"
            title="Reusable blocks."
            description="Composition helpers that sit above primitives: headings, labels, and empty states."
          />

          <div class="grid gap-6 lg:grid-cols-2">
            <UiPanel class="space-y-5">
              <UiSectionHeading
                eyebrow="Section heading"
                title="A reusable section header."
                description="Use it to keep section hierarchy and action placement consistent."
                action-label="Browse events"
                action-to="/events"
              />
            </UiPanel>

            <UiPanel class="space-y-5">
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
            </UiPanel>
          </div>
        </section>

        <section id="panels" class="space-y-6 scroll-mt-24">
          <UiSectionHeading
            eyebrow="Panels"
            title="Standalone surfaces."
            description="Show each panel on its own so the surface, spacing, and hierarchy are easy to judge at a glance."
          />

          <div class="grid gap-6 lg:grid-cols-2">
            <UiPanel class="space-y-3">
              <UiMetaLabel tone="accent">
                Solid
              </UiMetaLabel>
              <p class="text-sm font-semibold text-highlighted">
                Default panel
              </p>
              <p class="text-sm leading-relaxed text-toned">
                The main surface for cards, sections, and grouped content.
              </p>
            </UiPanel>

            <UiPanel variant="glass" class="space-y-3" padding="sm" radius="md">
              <UiMetaLabel tone="default">
                Glass
              </UiMetaLabel>
              <p class="text-sm font-semibold text-highlighted">
                Softer surface
              </p>
              <p class="text-sm leading-relaxed text-toned">
                A lighter surface for secondary content and low-emphasis blocks.
              </p>
            </UiPanel>

            <UiPanel padding="lg" radius="xl" interactive class="space-y-3">
              <UiMetaLabel tone="accent">
                Interactive
              </UiMetaLabel>
              <p class="text-sm font-semibold text-highlighted">
                Hover-ready panel
              </p>
              <p class="text-sm leading-relaxed text-toned">
                Useful for cards that behave like actions or navigation targets.
              </p>
            </UiPanel>

            <UiPanel padding="sm" radius="md" class="space-y-3">
              <UiMetaLabel tone="default">
                Compact
              </UiMetaLabel>
              <p class="text-sm font-semibold text-highlighted">
                Dense panel
              </p>
              <p class="text-sm leading-relaxed text-toned">
                A tighter composition for smaller surfaces and side content.
              </p>
            </UiPanel>
          </div>
        </section>

        <section id="forms" class="space-y-6 scroll-mt-24">
          <UiSectionHeading
            eyebrow="Forms"
            title="Form building blocks."
            description="Split by the pieces that matter in real screens: full shells, wrapped fields, raw controls, and the date picker."
          />

          <div class="grid gap-6 xl:grid-cols-2">
            <UiPanel class="space-y-5 xl:col-span-2">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Form shell
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  This mirrors the real layout used in the admin area.
                </p>
              </div>

              <FormRoot :state="demoForm" :validate-on="[]" class="space-y-5" @submit="submitDemoForm">
                <FormField v-model="demoForm.name" name="name" label="Name" help="Shown in the header of the demo record." required />
                <FormField v-model="demoForm.email" name="email" label="Email" type="email" help="Validation and error rendering are handled by the field." required />
                <FormPassword v-model="demoForm.password" name="password" label="Password" help="The password control includes a visibility toggle." required />
                <FormSelect
                  v-model="demoForm.role"
                  name="role"
                  label="Role"
                  :items="formRoleItems"
                  placeholder="Select a role"
                  help="Selects share the same form context and error surface."
                />
                <FormTextarea v-model="demoForm.notes" name="notes" label="Notes" help="Use it for longer copy, comments, and descriptions." :rows="4" />

                <BaseButton type="submit" variant="primary" leading-icon="i-lucide-send">
                  Submit demo
                </BaseButton>
              </FormRoot>
            </UiPanel>

            <UiPanel class="space-y-5">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Wrapped fields
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  Labels, help text, and validation stay together when the field owns the layout.
                </p>
              </div>

              <div class="space-y-4">
                <FormField v-model="wrappedInput" name="wrappedInput" label="Search term" help="The wrapper keeps the field readable in denser layouts." />
                <FormPassword v-model="rawPassword" name="rawPassword" label="Password" help="Password fields still belong in the same form model." />
                <FormSelect v-model="rawRole" name="rawRole" label="Select" :items="formRoleItems" help="Selects should feel like a first-class field, not a special case." />
                <FormTextarea v-model="rawNotes" name="rawNotes" label="Notes" help="Use it when the field needs more breathing room." :rows="4" />
              </div>
            </UiPanel>

            <UiPanel class="space-y-5">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Raw controls
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  Lower-level inputs are still available when you need to compose a custom layout.
                </p>
              </div>

              <div class="space-y-4">
                <FormInput v-model="rawInputHero" name="rawInputHero" variant="hero" placeholder="Hero variant" />
                <FormInput v-model="rawInput" name="rawInput" placeholder="FormInput with icon" icon="i-lucide-search" />
              </div>
            </UiPanel>

            <UiPanel class="space-y-5 xl:col-span-2">
              <div class="space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  Date picker
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  Shared calendar field with lavender accents, popover navigation, and form-context validation.
                </p>
              </div>

              <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
                <FormDatePicker
                  v-model="rawDate"
                  name="rawDate"
                  label="Event date"
                  help="Pick a date to see the shared calendar field in action."
                  placeholder="Choose a date"
                  class="w-full"
                />

                <div class="space-y-3 rounded-2xl border border-default/60 bg-default/20 p-4">
                  <UiMetaLabel tone="accent">
                    Value preview
                  </UiMetaLabel>
                  <p class="text-sm text-toned">
                    {{ rawDate || 'No date selected' }}
                  </p>
                  <BaseButton variant="outlined" size="sm" leading-icon="i-lucide-trash-2" @click="rawDate = ''">
                    Clear
                  </BaseButton>
                </div>
              </div>
            </UiPanel>
          </div>
        </section>

        <section id="notifications" class="space-y-6 scroll-mt-24">
          <UiSectionHeading
            eyebrow="Notifications"
            title="Toast example."
            description="The global toast host is already mounted; these buttons push sample notifications into the queue."
          />

          <div class="grid gap-6 lg:grid-cols-[1fr_auto]">
            <UiPanel class="space-y-3">
              <UiMetaLabel tone="accent">
                Live feedback
              </UiMetaLabel>
              <p class="text-sm leading-relaxed text-toned">
                Toasts are useful for ephemeral confirmations, warnings, and inline status updates.
              </p>
              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
            </UiPanel>
          </div>
        </section>
      </div>
    </BaseContainer>
  </main>
</template>
