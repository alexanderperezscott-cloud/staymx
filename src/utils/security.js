export function sanitizeText(input, maxLength = 200) {
  if (typeof input !== 'string') return ''

  const normalized = input
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()

  return normalized.slice(0, maxLength)
}

export function sanitizeImageUrl(value, fallback = '') {
  if (typeof value !== 'string') return fallback

  const trimmed = value.trim()
  if (!trimmed) return fallback

  const normalized = trimmed.replace(/\s+/g, '')
  if (!/^(https?:\/\/|\/)/i.test(normalized)) return fallback

  return normalized
}

export function sanitizePhone(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return ''
  return String(value).replace(/\D/g, '').slice(0, 15)
}

export function sanitizeNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function sanitizeStringArray(values) {
  if (!Array.isArray(values)) return []
  return values
    .filter((item) => typeof item === 'string')
    .map((item) => sanitizeText(item, 80))
    .filter(Boolean)
}
