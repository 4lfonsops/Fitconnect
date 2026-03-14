export const normalizePhoneDigits = (value: string): string => value.replace(/\D/g, '').slice(0, 10)

export const isValidPhone10Digits = (value: string): boolean => normalizePhoneDigits(value).length === 10

export const isValidEmail = (value: string): boolean => {
  const email = value.trim().toLowerCase()
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
