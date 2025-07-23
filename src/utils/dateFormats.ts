export const convertSecondsToTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':')
}

export const safeParseDate = (value: unknown, now: string): Date => {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    value instanceof Date
  ) {
    return new Date(value)
  }

  return new Date(now)
}
