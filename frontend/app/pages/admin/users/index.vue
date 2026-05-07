<script setup lang="ts">
import type {
  AdminOption,
  AdminUserRecord,
  PaginatedMeta,
} from '~/types'
import { useAdminUsersRepository } from '~/repositories/adminUsersRepository'
import { PAGE_SIZE_OPTIONS } from '~/utils/admin/pagination'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Usuarios | Admin VeriTix' })

const { listUsers, deleteUser } = useAdminUsersRepository()
const { roleOptions } = useAdminApi()
const { isApiAuthError } = useApiErrorMessage()
const { notifyApiError, notifySuccess } = useAppNotifications()

const users = ref<AdminUserRecord[]>([])
const pending = ref(true)
const deletingId = ref('')

const page = ref(1)
const pageSize = ref(12)
const pageSizeOptions = PAGE_SIZE_OPTIONS

const meta = ref<PaginatedMeta>({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
})

const statusOptions: AdminOption[] = [
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

function userInitials(user: AdminUserRecord) {
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
  <AdminPageShell
    title="Usuarios"
    description="Gestioná cuentas, roles y estado de acceso del equipo y de los compradores."
    primary-action-to="/admin/users/new"
    primary-action-label="Nuevo usuario"
  >
    <div class="mx-auto max-w-7xl space-y-8" data-testid="admin-users-page">
      <AdminOverviewPanel
        eyebrow="Administración"
        title="Directorio de usuarios"
        description="Busca por nombre o correo, filtra por rol y controla quién mantiene acceso activo."
        tone="subtle"
      >
        <template #actions>
          <div class="flex items-center gap-3 sm:self-center">
            <BaseButton kind="tertiary" size="md" :disabled="pending" @click="resetFilters">
              Resetear
            </BaseButton>
            <BaseButton kind="primary" size="md" :loading="pending" @click="applyFilters">
              Aplicar
            </BaseButton>
          </div>
        </template>

        <div class="space-y-6">
          <AdminFiltersBar
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

          <AdminPaginationBar
            :page="meta.page"
            :total-pages="meta.totalPages"
            :total-items="meta.total"
            :page-size="meta.limit"
            :pending="pending"
            @change="goToPage"
          />

          <div v-if="pending" class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <USkeleton v-for="index in 6" :key="index" class="h-80 rounded-2xl" />
          </div>

          <AdminEmptyState
            v-else-if="users.length === 0"
            icon="i-lucide-users"
            title="Sin usuarios"
            description="No encontramos usuarios para estos filtros."
            action-label="Crear usuario"
            action-to="/admin/users/new"
          />

          <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AdminCard
              v-for="user in users"
              :key="user.id"
              class="h-full border-default/65 bg-elevated/20"
            >
              <div class="flex h-full flex-col gap-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <UAvatar
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
                  <BaseButton kind="secondary" size="sm" block :to="`/admin/users/${user.id}/edit`">
                    Editar
                  </BaseButton>
                  <AdminDeleteAction
                    item-label="el usuario"
                    trigger-kind="tertiary"
                    trigger-class="w-full justify-center text-error hover:bg-error/10"
                    :pending="deletingId === user.id"
                    @confirm="removeUser(user.id)"
                  />
                </div>
              </div>
            </AdminCard>
          </div>

          <AdminPaginationBar
            :page="meta.page"
            :total-pages="meta.totalPages"
            :total-items="meta.total"
            :page-size="meta.limit"
            :pending="pending"
            @change="goToPage"
          />
        </div>
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
