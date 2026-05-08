export type UserRole = 'BUYER' | 'CREATOR' | 'VALIDATOR' | 'ADMIN'

export interface UserIdentity {
  id: string
  email: string
  name: string
  lastName: string
  role: UserRole
  avatarUrl: string | null
}

export interface UserProfile extends UserIdentity {
  phone?: string
  isActive?: boolean
  emailVerified?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UpdateProfileRequest {
  name?: string
  lastName?: string
  phone?: string
  avatarUrl?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
