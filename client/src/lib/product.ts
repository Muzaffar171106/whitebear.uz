type ProductPrice = {
    usd?: string | number
    uzs?: string | number
    rub?: string | number
    yuan?: string | number
}

type ProductSize = {
    stock?: boolean
    price?: ProductPrice
}

type CurrencyKey = keyof ProductPrice

const hasValidPrice = (size: ProductSize, currency: CurrencyKey) => {
    const value = size.price?.[currency]
    return value !== "" && value !== undefined && Number.isFinite(Number(value))
}

export function getPreferredSize<T extends ProductSize>(
    sizes?: T[],
    currency: CurrencyKey = "usd",
): T | null {
    if (!sizes?.length) return null

    return (
        sizes.find((size) => size.stock !== false && hasValidPrice(size, currency)) ??
        sizes.find((size) => size.stock !== false) ??
        sizes.find((size) => hasValidPrice(size, currency)) ??
        sizes[0] ??
        null
    )
}

export function getSizePrice(
    size: ProductSize | null | undefined,
    currency: CurrencyKey = "usd",
): number | null {
    if (!size || !hasValidPrice(size, currency)) return null
    return Number(size.price?.[currency])
}
