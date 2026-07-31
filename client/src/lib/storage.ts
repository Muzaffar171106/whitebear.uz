export const CART_STORAGE_KEY = "cart"
export const WISHLIST_STORAGE_KEY = "wishlist"

export function readStoredArray<T>(key: string): T[] {
    try {
        const value = localStorage.getItem(key)
        if (!value) return []

        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        localStorage.removeItem(key)
        return []
    }
}

export function writeStoredArray<T>(
    key: string,
    value: T[],
    eventName: string,
) {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new Event(eventName))
}

export function getStoredCartCount() {
    return readStoredArray<{ quantity?: number }>(CART_STORAGE_KEY).reduce(
        (total, item) => total + Math.max(1, Number(item.quantity) || 1),
        0,
    )
}
