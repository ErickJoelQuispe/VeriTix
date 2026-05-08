import type { UserIdentity } from './user'

export interface AuthUser extends UserIdentity {}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  lastName: string
  phone: string
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export interface RegisterResponse {
  message: string
}
