// Helpers for converting between Go-style duration strings and a
// {value, unit} pair editable in the UI. The backend accepts the string
// form ("10m", "20s", "1h30m") on save.

// parse('10m') => 600 (seconds)
// parse('1h30m') => 5400
// parse('5.5s') => 5.5 (Go emits fractional seconds for sub-second values)
export function toSeconds(s) {
  if (typeof s !== 'string') return 0
  // Longest units first so "500ms" matches "ms", not "m"; allow a decimal
  // fraction because Go's time.Duration.String() emits e.g. "1.5s".
  const re = /(\d+(?:\.\d+)?)(ns|us|µs|ms|h|m|s)/g
  let total = 0, m
  while ((m = re.exec(s)) !== null) {
    const n = parseFloat(m[1])
    switch (m[2]) {
      case 'h': total += n * 3600; break
      case 'm': total += n * 60; break
      case 'ms': total += n / 1000; break
      case 'us':
      case 'µs': total += n / 1e6; break
      case 'ns': total += n / 1e9; break
      default: total += n
    }
  }
  return total
}

// fromSeconds(620, 'm') => '10m20s'
// Picks a sensible representation: drops zero parts.
export function fromSeconds(secs) {
  secs = Math.max(0, Math.floor(secs))
  if (secs === 0) return '0s'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  let out = ''
  if (h) out += `${h}h`
  if (m) out += `${m}m`
  if (s) out += `${s}s`
  return out
}

// toMinutes / fromMinutes — handy for fields that natively show minutes
export const toMinutes   = (s) => Math.round(toSeconds(s) / 60)
export const fromMinutes = (n) => fromSeconds(Math.max(0, n) * 60)
