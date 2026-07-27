export interface FieldRequirement {
  text: string
  test: (v: string) => boolean
}

// Built from character codes rather than a backslash-u escape literal so the
// source file only contains plain ASCII — matches the same excluded set as
// the original pattern (CR/LF and the Unicode line/paragraph separators).
const EMAIL_EXCLUDED_CHARS = `\n\r@${String.fromCharCode(0x2028)}${String.fromCharCode(0x2029)}`
const EMAIL_PATTERN = new RegExp(`.[^${EMAIL_EXCLUDED_CHARS}]*@.+\\..+`)

const UPPERCASE_PATTERN = /[A-Z]/
const LOWERCASE_PATTERN = /[a-z]/
const DIGIT_PATTERN = /\d/
const USERNAME_CHARSET_PATTERN = /^[\w-]+$/

/**
 * Vuetify field rules and the requirement checklists shown under the
 * username/password fields — a composable (not static exports) so every
 * message re-translates when the interface language changes.
 */
export function useValidationRules() {
  const { t } = useI18n()

  const emailRules = computed(() => [
    (v: string) => !!v || t('validation.emailRequired'),
    (v: string) => EMAIL_PATTERN.test(v) || t('validation.emailInvalid'),
  ])

  const passwordRules = computed(() => [
    (v: string) => !!v || t('validation.passwordRequired'),
    (v: string) => v.length >= 8 || t('validation.passwordMinLength'),
    (v: string) => UPPERCASE_PATTERN.test(v) || t('validation.passwordUppercase'),
    (v: string) => LOWERCASE_PATTERN.test(v) || t('validation.passwordLowercase'),
    (v: string) => DIGIT_PATTERN.test(v) || t('validation.passwordDigit'),
  ])

  const usernameRules = computed(() => [
    (v: string) => !!v || t('validation.usernameRequired'),
    (v: string) => v.length >= 3 || t('validation.usernameMinLength'),
    (v: string) => v.length <= 50 || t('validation.usernameMaxLength'),
    (v: string) => USERNAME_CHARSET_PATTERN.test(v) || t('validation.usernameCharset'),
  ])

  const usernameRequirements = computed<FieldRequirement[]>(() => [
    { text: t('validation.usernameReqMinLength'), test: (v: string) => v.length >= 3 },
    { text: t('validation.usernameReqMaxLength'), test: (v: string) => v.length <= 50 },
    { text: t('validation.usernameReqCharset'), test: (v: string) => USERNAME_CHARSET_PATTERN.test(v) },
  ])

  const passwordRequirements = computed<FieldRequirement[]>(() => [
    { text: t('validation.passwordReqLength'), test: (v: string) => v.length >= 8 },
    { text: t('validation.passwordReqUppercase'), test: (v: string) => UPPERCASE_PATTERN.test(v) },
    { text: t('validation.passwordReqLowercase'), test: (v: string) => LOWERCASE_PATTERN.test(v) },
    { text: t('validation.passwordReqDigit'), test: (v: string) => DIGIT_PATTERN.test(v) },
  ])

  return {
    emailRules,
    passwordRules,
    usernameRules,
    usernameRequirements,
    passwordRequirements,
  }
}
