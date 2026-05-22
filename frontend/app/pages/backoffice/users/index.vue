<script setup lang="ts">
import type { PaginationMeta } from '~~/shared/api/types'
import type {
  BackofficeOption,
  BackofficeUserRecord,
} from '~~/shared/types'
import { useBackofficeUsersRepository } from '@/repositories/backofficeUsersRepository'
import { PAGE_SIZE_OPTIONS } from '@/utils/backoffice/pagination'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Usuarios | Backoffice VeriTix' })

const { listUsers, deleteUser } = useBackofficeUsersRepository()
const { roleOptions } = useBackofficeApi()
const { isApiAuthError } = useApiErrorMessage()
const { notifyApiError, notifySuccess } = useAppNotifications()

const users = ref<BackofficeUserRecord[]>([])
const pending = ref(true)
const deletingId = ref('')
const deletingTarget = ref('')
const deleteModalOpen = ref(false)
const actionMenuOpen = reactive<Record<string, boolean>>({})

const page = ref(1)
const pageSize = ref(12)
const pageSizeOptions = PAGE_SIZE_OPTIONS

const meta = ref<PaginationMeta>({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
})

const statusOptions: BackofficeOption[] = [
  { id: 'true', name: 'Activo' },
  { id: 'false', name: 'Inactivo' },
]

const filters = reactive({
  search: '',
  role: '',
  status: '',
})

const filtersOpen = ref(false)

const roleFilterOptions = computed(() => {
  return roleOptions.map(option => ({
    id: option.value,
    name: option.label,
  }))
})

const toolbarChips = computed(() => {
  const verifiedUsers = users.value.filter(user => user.emailVerified).length
  const activeUsers = users.value.filter(user => user.isActive).length

  return [
    { label: 'visibles', value: meta.value.total, icon: 'i-lucide-chart-column' },
    { label: 'verificados', value: verifiedUsers, icon: 'i-lucide-badge-check' },
    { label: 'activos', value: activeUsers, icon: 'i-lucide-user-check' },
  ]
})

function userInitials(user: BackofficeUserRecord) {
  const initials = [user.name, user.lastName]
    .map(value => value?.trim()?.charAt(0)?.toUpperCase() ?? '')
    .join('')

  if (initials) {
    return initials
  }

  return user.email?.trim()?.charAt(0)?.toUpperCase() || 'U'
}

function roleLabel(role: string) {
  if (role === 'ADMIN') {
    return 'Administrador'
  }
  if (role === 'CREATOR') {
    return 'Creador'
  }
  if (role === 'VALIDATOR') {
    return 'Validador'
  }

  return 'Usuario'
}

function roleBadgeColor(role: string) {
  if (role === 'ADMIN') {
    return 'primary'
  }
  if (role === 'CREATOR') {
    return 'secondary'
  }
  if (role === 'VALIDATOR') {
    return 'info'
  }

  return 'neutral'
}

function roleBadgeIcon(role: string) {
  if (role === 'ADMIN') {
    return 'i-lucide-shield'
  }
  if (role === 'CREATOR') {
    return 'i-lucide-wand-sparkles'
  }
  if (role === 'VALIDATOR') {
    return 'i-lucide-badge-check'
  }

  return 'i-lucide-user'
}

async function loadUsers(targetPage = page.value) {
  pending.value = true

  try {
    const response = await listUsers({
      pageValue: targetPage,
      pageSize: pageSize.value,
      search: filters.search,
      role: filters.role,
      isActive: filters.status,
    })

    users.value = response.data
    meta.value = response.meta
    page.value = response.meta.page
  }
  catch (error) {
    if (isApiAuthError(error)) {
      await navigateTo('/login')
      return
    }

    notifyApiError(error, 'No pudimos cargar los usuarios.', { id: 'admin-users-load-error' })
  }
  finally {
    pending.value = false
  }
}

function applyFilters() {
  page.value = 1
  void loadUsers(1)
}

function resetFilters() {
  filters.search = ''
  filters.role = ''
  filters.status = ''
  page.value = 1
  void loadUsers(1)
}

function goToPage(nextPage: number) {
  void loadUsers(nextPage)
}

function confirmDelete(userId: string) {
  deletingTarget.value = userId
  deleteModalOpen.value = true
}

function handleDeleteConfirm() {
  if (deletingTarget.value) {
    removeUser(deletingTarget.value)
  }

  deleteModalOpen.value = false
}

async function removeUser(userId: string) {
  deletingId.value = userId

  try {
    await deleteUser(userId)

    notifySuccess('Usuario eliminado correctamente.', { id: `admin-users-delete-${userId}` })
    await loadUsers(page.value)
  }
  catch (error) {
    if (isApiAuthError(error)) {
      await navigateTo('/login')
      return
    }

    notifyApiError(error, 'No pudimos eliminar el usuario.', { id: `admin-users-delete-error-${userId}` })
  }
  finally {
    deletingId.value = ''
  }
}

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8" data-testid="backoffice-users-page">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Usuarios"
          description="Buscá usuarios por rol, estado y actividad desde un panel único."
          action-label="Nuevo usuario"
          action-to="/backoffice/users/new"
        />

        <PagesBackofficeOverviewPanel
          eyebrow="Filtros"
          title="Lista de usuarios"
          variant="glass"
        >
          <template #actions>
            <div class="flex items-center gap-3 sm:self-center">
              <BaseButton
                variant="outlined"
                size="sm"
                class="lg:hidden"
                leading-icon="i-lucide-sliders-horizontal"
                @click="filtersOpen = !filtersOpen"
              >
                {{ filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros' }}
              </BaseButton>

              <div class="hidden gap-3 lg:flex">
                <BaseButton variant="primary" size="md" :loading="pending" @click="applyFilters">
                  Buscar
                </BaseButton>
                <BaseButton variant="reversed" size="md" :disabled="pending" @click="resetFilters">
                  Limpiar filtros
                </BaseButton>
              </div>
            </div>
          </template>

          <template #summary>
            <div class="flex flex-wrap items-center gap-2.5">
              <BaseBadge
                v-for="item in toolbarChips"
                :key="item.label"
                kind="tag"
                color="primary"
                size="sm"
                :icon="item.icon"
                class="min-w-28 justify-center rounded-full"
              >
                {{ item.label }}: {{ item.value }}
              </BaseBadge>
            </div>
          </template>

          <div class="space-y-6">
            <div class="space-y-6 lg:block" :class="[filtersOpen ? 'block' : 'hidden']">
              <PagesBackofficeFiltersBar
                v-model:search="filters.search"
                v-model:page-size="pageSize"
                v-model:role="filters.role"
                v-model:status="filters.status"
                :page-size-options="pageSizeOptions"
                :roles="roleFilterOptions"
                :statuses="statusOptions"
                :visible-filters="['pageSize', 'role', 'status']"
                search-label="Buscar usuario"
                search-placeholder="Nombre o correo"
                role-label="Rol"
                role-all-label="Todos los roles"
                role-name="role"
                role-icon="i-lucide-shield-check"
                status-label="Estado"
                status-all-label="Todos los estados"
                status-name="status"
                status-icon="i-lucide-badge-check"
                :loading="pending"
                class="w-full"
              />

              <div class="flex flex-col gap-2 sm:flex-row sm:items-center lg:hidden">
                <BaseButton
                  variant="primary"
                  type="button"
                  size="sm"
                  class="w-full sm:w-auto order-first"
                  :loading="pending"
                  :leading-icon="pending ? undefined : 'i-lucide-search'"
                  @click="applyFilters"
                >
                  Buscar
                </BaseButton>

                <BaseButton
                  variant="reversed"
                  type="button"
                  size="sm"
                  class="w-full sm:w-auto"
                  :disabled="pending"
                  leading-icon="i-lucide-rotate-ccw"
                  @click="resetFilters"
                >
                  Limpiar filtros
                </BaseButton>
              </div>
            </div>

            <div class="flex justify-center pt-1 pb-1">
              <BasePagination
                :page="meta.page"
                :total="meta.total"
                :items-per-page="meta.limit"
                :disabled="pending"
                :sibling-count="1"
                size="sm"
                color="neutral"
                variant="ghost"
                active-color="primary"
                active-variant="soft"
                show-edges
                @update:page="goToPage"
              />
            </div>

            <div v-if="pending" class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <BaseSpinner v-for="index in 6" :key="index" class="h-80 rounded-2xl" />
            </div>

            <UiEmptyState
              v-else-if="users.length === 0"
              icon="i-lucide-users"
              title="Sin usuarios"
              description="No encontramos usuarios para estos filtros."
              action-label="Crear usuario"
              action-to="/backoffice/users/new"
            />

            <div v-else class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <UiPanel
                v-for="user in users"
                :key="user.id"
                variant="glass"
                radius="lg"
                padding="md"
                class="group relative h-full border-default/50 bg-linear-to-b from-elevated/25 to-elevated/10 shadow-sm transition hover:border-lavender/20 hover:shadow-md"
              >
                <div class="flex h-full flex-col">
                  <div class="absolute right-3 top-3 z-10">
                    <BasePopover
                      v-model:open="actionMenuOpen[user.id]"
                      :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
                      class="shrink-0"
                    >
                      <BaseButton
                        variant="secondary"
                        size="sm"
                        class="px-3"
                        :disabled="pending || deletingId === user.id"
                        aria-label="Abrir acciones"
                      >
                        <BaseIcon name="i-lucide-ellipsis-vertical" class="size-4" aria-hidden="true" />
                      </BaseButton>

                      <template #content>
                        <div class="w-56 rounded-3xl border border-white/10 bg-linear-to-b from-elevated/98 to-elevated/88 p-3 shadow-[0_28px_70px_-34px_rgb(0_0_0_/_0.82)] ring-1 ring-black/10 backdrop-blur-2xl">
                          <div class="space-y-3">
                            <p class="px-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-toned/55">
                              Acciones
                            </p>

                            <BaseButton
                              variant="primary"
                              size="md"
                              block
                              class="justify-start"
                              :to="`/backoffice/users/${user.id}/edit`"
                              @click="actionMenuOpen[user.id] = false"
                            >
                              <BaseIcon name="i-lucide-pencil" class="size-4" aria-hidden="true" />
                              Editar usuario
                            </BaseButton>

                            <BaseButton
                              variant="danger"
                              size="md"
                              block
                              class="justify-start"
                              :disabled="deletingId === user.id"
                              @click="actionMenuOpen[user.id] = false; confirmDelete(user.id)"
                            >
                              <BaseIcon name="i-lucide-trash-2" class="size-4" aria-hidden="true" />
                              Eliminar usuario
                            </BaseButton>
                          </div>
                        </div>
                      </template>
                    </BasePopover>
                  </div>

                  <div class="flex items-start gap-4 pr-12">
                    <div class="flex min-w-0 items-center gap-3.5">
                      <div class="shrink-0">
                        <BaseAvatar
                          :src="user.avatarUrl || undefined"
                          :alt="`${user.name} ${user.lastName}`.trim() || user.email"
                          :text="userInitials(user)"
                          size="xl"
                          class="ring-2 ring-default/50"
                        />
                      </div>

                      <div class="min-w-0 space-y-0.5">
                        <p class="truncate text-base font-semibold text-highlighted">
                          {{ user.name }} {{ user.lastName }}
                        </p>
                        <p class="truncate text-sm text-toned/70">
                          {{ user.email }}
                        </p>
                        <div class="mt-1.5 flex items-center gap-1.5">
                          <BaseIcon :name="roleBadgeIcon(user.role)" class="size-3.5" :class="roleBadgeColor(user.role) === 'primary' ? 'text-primary' : roleBadgeColor(user.role) === 'secondary' ? 'text-accent' : roleBadgeColor(user.role) === 'info' ? 'text-info' : 'text-muted'" />
                          <span class="text-xs font-medium" :class="roleBadgeColor(user.role) === 'primary' ? 'text-primary' : roleBadgeColor(user.role) === 'secondary' ? 'text-accent' : roleBadgeColor(user.role) === 'info' ? 'text-info' : 'text-muted'">
                            {{ roleLabel(user.role) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-5 space-y-3">
                    <div class="flex items-center gap-3">
                      <div class="flex size-9 items-center justify-center rounded-lg bg-lavender/10">
                        <BaseIcon name="i-lucide-phone" class="size-4 text-lavender" />
                      </div>
                      <div>
                        <p class="text-xs text-toned/50">
                          Teléfono
                        </p>
                        <p class="text-sm text-highlighted">
                          {{ user.phone }}
                        </p>
                      </div>
                    </div>
                    <div class="border-t border-default/30" />
                    <div class="flex items-center gap-3">
                      <div class="flex size-9 items-center justify-center rounded-lg" :class="user.isActive ? 'bg-success/12' : 'bg-toned/8'">
                        <BaseIcon :name="user.isActive ? 'i-lucide-user-check' : 'i-lucide-user-x'" class="size-4" :class="user.isActive ? 'text-success' : 'text-toned/50'" />
                      </div>
                      <div>
                        <p class="text-xs text-toned/50">
                          Estado
                        </p>
                        <p class="text-sm font-medium text-highlighted">
                          {{ user.isActive ? 'Activo' : 'Inactivo' }}
                        </p>
                      </div>
                    </div>
                    <div class="border-t border-default/30" />
                    <div class="flex items-center gap-3">
                      <div class="flex size-9 items-center justify-center rounded-lg" :class="user.emailVerified ? 'bg-info/12' : 'bg-warning/12'">
                        <BaseIcon name="i-lucide-mail" class="size-4" :class="user.emailVerified ? 'text-info' : 'text-warning'" />
                      </div>
                      <div>
                        <p class="text-xs text-toned/50">
                          Email
                        </p>
                        <span
                          class="inline-block rounded-md px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-widest"
                          :class="user.emailVerified ? 'bg-success/12 text-success' : 'bg-warning/12 text-warning'"
                        >
                          {{ user.emailVerified ? 'Verificado' : 'Pendiente' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </UiPanel>
            </div>

            <div class="flex justify-center pt-1 pb-1">
              <BasePagination
                :page="meta.page"
                :total="meta.total"
                :items-per-page="meta.limit"
                :disabled="pending"
                :sibling-count="1"
                size="sm"
                color="neutral"
                variant="ghost"
                active-color="primary"
                active-variant="soft"
                show-edges
                @update:page="goToPage"
              />
            </div>
          </div>
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>

    <UiConfirmModal
      :open="deleteModalOpen"
      title="Eliminar usuario"
      description="¿Estás seguro de que querés eliminar este usuario? Esta acción no se puede deshacer."
      confirm-label="Eliminar"
      cancel-label="Cancelar"
      :pending="deletingId === deletingTarget"
      @confirm="handleDeleteConfirm"
      @cancel="deleteModalOpen = false; deletingTarget = ''"
    />
  </section>
</template>
