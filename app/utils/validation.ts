export const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.[^\n\r@\u2028\u2029]*@.+\..+/.test(v) || 'Email must be valid',
]

export const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
  (v: string) => /[A-Z]/.test(v) || 'Password must contain an uppercase letter',
  (v: string) => /[a-z]/.test(v) || 'Password must contain a lowercase letter',
  (v: string) => /\d/.test(v) || 'Password must contain a digit',
]

export const usernameRules = [
  (v: string) => !!v || 'Username is required',
  (v: string) => v.length >= 3 || 'Username must be at least 3 characters',
  (v: string) => v.length <= 50 || 'Username must be at most 50 characters',
  (v: string) => /^[\w-]+$/.test(v) || 'Username can only contain letters, numbers, _ and -',
]

export interface UsernameRequirement {
  text: string
  test: (v: string) => boolean
}

export const usernameRequirements: UsernameRequirement[] = [
  { text: 'At least 3 characters', test: (v: string) => v.length >= 3 },
  { text: 'At most 50 characters', test: (v: string) => v.length <= 50 },
  { text: 'Only letters, numbers, _ and -', test: (v: string) => /^[\w-]+$/.test(v) },
]

export interface PasswordRequirement {
  text: string
  test: (v: string) => boolean
}

export const passwordRequirements: PasswordRequirement[] = [
  { text: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { text: 'Contains uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { text: 'Contains lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { text: 'Contains digit', test: (v: string) => /\d/.test(v) },
]

export const apiKeyNameRules = [
  (v: string) => !!v || 'API key name is required',
  (v: string) => v.length >= 1 || 'API key name must be at least 1 character',
  (v: string) => v.length <= 255 || 'API key name must be at most 255 characters',
]
