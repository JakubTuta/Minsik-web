export interface User {
  user_id: number
  email: string
  username: string
  display_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  role: string
  is_active: boolean
  created_at: string
  preferred_language: string
}

export interface SessionData {
  user: User
  expires_in: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface UpdateProfileRequest {
  display_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  preferred_language?: string | null
}

export interface GoogleAuthRequest {
  code: string
  redirect_uri: string
}
