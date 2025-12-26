// Minimal localStorage helper for recent files
const RECENT_KEY = 'dexpdf:recent'
const MAX_ITEMS = 8

export function getRecent() {
    try {
        if (typeof window === 'undefined') return []
        const raw = localStorage.getItem(RECENT_KEY)
        if (!raw) return []
        return JSON.parse(raw)
    } catch (e) {
        console.error('Failed to read recent files', e)
        return []
    }
}

export function pushRecent(item) {
    try {
        if (!item || !item.id) return
        const list = getRecent()
        // Remove any existing with same id
        const filtered = list.filter(i => i.id !== item.id)
        filtered.unshift({ ...item, time: Date.now() })
        const sliced = filtered.slice(0, MAX_ITEMS)
        localStorage.setItem(RECENT_KEY, JSON.stringify(sliced))
        return sliced
    } catch (e) {
        console.error('Failed to push recent', e)
        return []
    }
}

export function clearRecent() {
    try {
        localStorage.removeItem(RECENT_KEY)
    } catch (e) {
        console.error('Failed to clear recent', e)
    }
}

export default { getRecent, pushRecent, clearRecent }
