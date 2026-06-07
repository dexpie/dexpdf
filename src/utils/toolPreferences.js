export const RECENT_TOOLS_KEY = 'dexpdf_recent_tools'
export const FAVORITE_TOOLS_KEY = 'dexpdf_favorite_tools'
export const TOOL_USAGE_KEY = 'dexpdf_tool_usage'
export const PREFERENCES_EVENT = 'dexpdf:preferences-changed'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function readJson(key, fallback) {
  if (!canUseStorage()) return fallback

  try {
    const value = JSON.parse(window.localStorage.getItem(key) || 'null')
    return value ?? fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  if (!canUseStorage()) return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT))
  } catch {
    // Personalization is optional when storage is blocked.
  }
}

export function getRecentToolIds() {
  const ids = readJson(RECENT_TOOLS_KEY, [])
  return Array.isArray(ids) ? ids.filter(id => typeof id === 'string') : []
}

export function getFavoriteToolIds() {
  const ids = readJson(FAVORITE_TOOLS_KEY, [])
  return Array.isArray(ids) ? ids.filter(id => typeof id === 'string') : []
}

export function getMostUsedToolIds(limit = 8) {
  const usage = readJson(TOOL_USAGE_KEY, {})
  if (!usage || typeof usage !== 'object' || Array.isArray(usage)) return []

  return Object.entries(usage)
    .filter(([, count]) => typeof count === 'number')
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => id)
}

export function recordToolUse(toolId) {
  if (!toolId || typeof toolId !== 'string') return

  const recent = getRecentToolIds()
  writeJson(RECENT_TOOLS_KEY, [toolId, ...recent.filter(id => id !== toolId)].slice(0, 8))

  const usage = readJson(TOOL_USAGE_KEY, {})
  writeJson(TOOL_USAGE_KEY, {
    ...(usage && typeof usage === 'object' && !Array.isArray(usage) ? usage : {}),
    [toolId]: (Number(usage?.[toolId]) || 0) + 1,
  })
}

export function toggleFavoriteTool(toolId) {
  const favorites = getFavoriteToolIds()
  const next = favorites.includes(toolId)
    ? favorites.filter(id => id !== toolId)
    : [toolId, ...favorites]

  writeJson(FAVORITE_TOOLS_KEY, next)
  return next
}
