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
  isActive: '',
})

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
    { label: 'visibles', value: meta.value.total },
    { label: 'verificados', value: verifiedUsers },
    { label: 'activos', value: activeUsers },
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
      isActive: filters.isActive,
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
  filters.isActive = ''
  page.value = 1
  void loadUsers(1)
}

function goToPage(nextPage: number) {
  void loadUsers(nextPage)
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
  <PagesBackofficePageShell
    title="Manage users"
    description="Search by status, role, and activity with a concise view."
    primary-action-to="/backoffice/users/new"
    primary-action-label="Nuevo usuario"
  >
    <div class="mx-auto max-w-7xl space-y-8" data-testid="backoffice-users-page">
      <section class="grid gap-3 rounded-2xl border border-default/70 bg-elevated/45 p-4 md:grid-cols-[1.25fr_.72fr_.72fr_auto]">
        <FormInput v-model="filters.search" placeholder="Search name or email" icon="i-lucide-search" :disabled="pending" />
        <FormSelect label="Role" name="role" :model-value="filters.role || '__all__'" :items="[{ label: 'Role: all', value: '__all__' }, ...roleFilterOptions.map(role => ({ label: role.name, value: role.id }))]" :disabled="pending" @update:model-value="filters.role = $event === '__all__' ? '' : String($event)" />
        <FormSelect label="Status" name="status" :model-value="filters.isActive || '__all__'" :items="[{ label: 'Status: all', value: '__all__' }, ...statusOptions.map(status => ({ label: status.name, value: status.id }))]" :disabled="pending" @update:model-value="filters.isActive = $event === '__all__' ? '' : String($event)" />
        <BaseButton variant="secondary" :loading="pending" @click="applyFilters">
          Search
        </BaseButton>
      </section>

      <PagesBackofficeOverviewPanel
        eyebrow="Filter"
        title="Refine list."
        description="Search by status, role, and activity with a concise view."
        variant="glass"
      >
        <template #actions>
          <div class="flex items-center gap-3 sm:self-center">
            <BaseButton variant="outlined" size="md" :disabled="pending" @click="resetFilters">
              Resetear
            </BaseButton>
            <BaseButton variant="primary" size="md" :loading="pending" @click="applyFilters">
              Aplicar
            </BaseButton>
          </div>
        </template>

        <div class="space-y-6">
          <PagesBackofficeFiltersBar
            v-model:search="filters.search"
            v-model:page-size="pageSize"
            v-model:genre-id="filters.role"
            v-model:format-id="filters.isActive"
            :page-size-options="pageSizeOptions"
            :genres="roleFilterOptions"
            :formats="statusOptions"
            :visible-filters="['pageSize', 'genre', 'format']"
            search-label="Buscar usuario"
            search-placeholder="Nombre o correo"
            genre-label="Rol"
            genre-all-label="Todos los roles"
            genre-name="role"
            format-label="Estado"
            format-name="isActive"
            :loading="pending"
            class="w-full"
          />

          <PagesBackofficeToolbarChips :items="toolbarChips" />

          <div class="rounded-xl bg-elevated/20 px-3 py-2.5 sm:px-4 sm:py-3">
            <div class="flex w-full flex-wrap items-center justify-center">
              <BasePagination
                :page="meta.page"
                :total="meta.total"
                :items-per-page="meta.limit"
                :disabled="pending"
                :sibling-count="1"
                :show-edges="meta.totalPages > 5"
                size="lg"
                @update:page="goToPage"
              />
            </div>
          </div>

          <div v-if="pending" class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <BaseSkeleton v-for="index in 6" :key="index" class="h-80 rounded-2xl" />
          </div>

          <UiEmptyState
            v-else-if="users.length === 0"
            icon="i-lucide-users"
            title="Sin usuarios"
            description="No encontramos usuarios para estos filtros."
            action-label="Crear usuario"
            action-to="/backoffice/users/new"
          />

          <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <UiPanel
              v-for="user in users"
              :key="user.id"
              variant="glass"
              radius="lg"
              padding="md"
              class="h-full border-default/65 bg-elevated/20"
            >
              <div class="flex h-full flex-col gap-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <BaseAvatar
                      :src="user.avatarUrl || undefined"
                      :alt="`${user.name} ${user.lastName}`.trim() || user.email"
                      :text="userInitials(user)"
                      size="xl"
                      class="ring-1 ring-default/60"
                    />

                    <div class="min-w-0 space-y-1">
                      <p class="truncate text-base font-semibold text-highlighted">
                        {{ user.name }} {{ user.lastName }}
                      </p>
                      <p class="truncate text-sm text-toned">
                        {{ user.email }}
                      </p>
                    </div>
                  </div>

                  <BaseBadge
                    kind="role"
                    size="sm"
                    :color="roleBadgeColor(user.role)"
                    :icon="roleBadgeIcon(user.role)"
                    leading
                  >
                    {{ roleLabel(user.role) }}
                  </BaseBadge>
                </div>

                <div class="space-y-2 text-sm">
                  <div class="flex items-center justify-between border-b border-default/60 pb-2">
                    <span class="text-muted">Teléfono</span>
                    <span class="truncate text-toned">{{ user.phone }}</span>
                  </div>

                  <div class="flex items-center justify-between border-b border-default/60 pb-2">
                    <span class="text-muted">Estado</span>
                    <span :class="user.isActive ? 'text-success' : 'text-muted'" class="font-medium">
                      {{ user.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-muted">Email</span>
                    <span :class="user.emailVerified ? 'text-success' : 'text-warning'" class="font-medium">
                      {{ user.emailVerified ? 'Verificado' : 'Pendiente' }}
                    </span>
                  </div>
                </div>

                <div class="mt-auto grid grid-cols-2 gap-2 border-t border-default/60 pt-3">
                  <BaseButton variant="secondary" size="sm" block :to="`/backoffice/users/${user.id}/edit`">
                    Editar
                  </BaseButton>
                  <PagesBackofficeDeleteAction
                    item-label="el usuario"
                    trigger-variant="outlined"
                    trigger-class="w-full justify-center text-error hover:bg-error/10"
                    :pending="deletingId === user.id"
                    @confirm="removeUser(user.id)"
                  />
                </div>
              </div>
            </UiPanel>
          </div>

          <div class="rounded-xl bg-elevated/20 px-3 py-2.5 sm:px-4 sm:py-3">
            <div class="flex w-full flex-wrap items-center justify-center">
              <BasePagination
                :page="meta.page"
                :total="meta.total"
                :items-per-page="meta.limit"
                :disabled="pending"
                :sibling-count="1"
                :show-edges="meta.totalPages > 5"
                size="lg"
                @update:page="goToPage"
              />
            </div>
          </div>
        </div>
      </PagesBackofficeOverviewPanel>
    </div>
  </PagesBackofficePageShell>
</template>
