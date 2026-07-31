type CacheEntry<T> = {
    data: T
    savedAt: number
}

export const readResponseCache = <T,>(
    key: string,
    maxAge = 10 * 60 * 1000
): T | undefined => {
    try {
        const value = window.localStorage.getItem(key)
        if (!value) return undefined

        const parsed = JSON.parse(value) as CacheEntry<T>
        if (!parsed.savedAt || Date.now() - parsed.savedAt > maxAge) {
            window.localStorage.removeItem(key)
            return undefined
        }

        return parsed.data
    } catch {
        window.localStorage.removeItem(key)
        return undefined
    }
}

export const writeResponseCache = <T,>(key: string, data: T) => {
    try {
        const entry: CacheEntry<T> = {
            data,
            savedAt: Date.now(),
        }
        window.localStorage.setItem(key, JSON.stringify(entry))
    } catch {
        // The live response still works when storage is unavailable or full.
    }
}
