export type UserRole = 'BUYER' | 'CREATOR' | 'VALIDATOR' | 'ADMIN'

export interface UserProfile {
  id: string
  email: string
  name: string
  lastName: string
  role: UserRole
  avatarUrl: string | null
  phone?: string
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
