"use client"

import { Button } from "@/components/ui/button"
import { Fetch } from "@/middlewares/Fetch"
import { resolveLanguage } from "@/lib/locale"
import { getPreferredSize, getSizePrice } from "@/lib/product"
import {
    CART_STORAGE_KEY,
    readStoredArray,
    writeStoredArray,
} from "@/lib/storage"
import { readResponseCache, writeResponseCache } from "@/lib/response-cache"
import { ArrowRight, Minus, PackageSearch, Plus, RefreshCw, ShoppingBag } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import useSWR from "swr"

interface CategoryOption {
    _id: string
    slug: string
    name: {
        en: string
        uz: string
        ru: string
        ch: string
    }
}

interface ProductSize {
    size: string
    stock: boolean
    package: string
    price: {
        usd: string
        uzs: string
        rub: string
        yuan: string
    }
}

interface Product {
    _id: string
    image: string
    category?: string
    price?: number
    stock?: boolean
    title: {
        en: string
        uz: string
        ru: string
        ch: string
    }
    number: number
    sizes?: ProductSize[]
}

type ProductResponse = {
    products?: Product[]
}

type CartItem = Product & {
    quantity: number
    selectedSize?: ProductSize | null
}

const getSizeKey = (selectedSize?: ProductSize | null) =>
    selectedSize ? `${selectedSize.size}-${selectedSize.package}` : "default"

export const Products = () => {
    const currency = "USD"
    const { t, i18n } = useTranslation("common", {
        keyPrefix: "homepage.products",
    })
    const [activeTab, setActiveTab] = useState("all")
    const [cart, setCart] = useState<CartItem[]>([])
    const [categories, setCategories] = useState<CategoryOption[]>([])
    const [categoriesLoading, setCategoriesLoading] = useState(false)
    const [categoriesError, setCategoriesError] = useState("")

    const currentLanguage = useMemo(
        () => resolveLanguage(i18n.language),
        [i18n.language]
    )

    useEffect(() => {
        const syncCart = () =>
            setCart(readStoredArray<CartItem>(CART_STORAGE_KEY))

        syncCart()
        window.addEventListener("cart-update", syncCart)
        return () => window.removeEventListener("cart-update", syncCart)
    }, [])

    useEffect(() => {
        const loadCategories = async () => {
            const cachedCategories = readResponseCache<CategoryOption[]>(
                "whitebear:categories"
            )
            if (cachedCategories) {
                setCategories(cachedCategories)
                return
            }

            try {
                setCategoriesLoading(true)
                setCategoriesError("")
                const response = await Fetch.get("/category")
                const nextCategories = response.data?.categories || []
                setCategories(nextCategories)
                writeResponseCache("whitebear:categories", nextCategories)
            } catch {
                setCategoriesError(t("serverError"))
            } finally {
                setCategoriesLoading(false)
            }
        }

        loadCategories()
    }, [t])

    const query =
        activeTab === "all"
            ? "/product?page=1&limit=8"
            : `/product?page=1&limit=8&category=${encodeURIComponent(activeTab)}`
    const productCacheKey = `whitebear:products:${query}`
    const fallbackData = useMemo(
        () => readResponseCache<ProductResponse>(productCacheKey),
        [productCacheKey]
    )
    const { data, error, isLoading, mutate } = useSWR<ProductResponse>(
        query,
        async (url: string) => {
            const response = await Fetch.get(url)
            writeResponseCache(productCacheKey, response.data)
            return response.data
        },
        {
            fallbackData,
            revalidateOnMount: !fallbackData,
        }
    )
    const products: Product[] = Array.isArray(data?.products)
        ? data.products
        : []

    const updateCartQuantity = (product: Product, delta: number) => {
        const selectedSize = getPreferredSize(product.sizes)
        const price = getSizePrice(selectedSize)

        if (!selectedSize || selectedSize.stock === false || price === null) return

        const sizeKey = getSizeKey(selectedSize)
        const existing = cart.find(
            (item) =>
                item._id === product._id &&
                getSizeKey(item.selectedSize) === sizeKey
        )
        if (!existing && delta <= 0) return

        const nextQuantity = Math.min(999, Math.max(0, (existing?.quantity ?? 0) + delta))
        const updatedCart = existing
            ? nextQuantity === 0
                ? cart.filter(
                    (item) =>
                        !(
                            item._id === product._id &&
                            getSizeKey(item.selectedSize) === sizeKey
                        )
                )
                : cart.map((item) =>
                    item._id === product._id &&
                    getSizeKey(item.selectedSize) === sizeKey
                        ? { ...item, quantity: nextQuantity }
                        : item
                )
            : [
                ...cart,
                {
                    ...product,
                    quantity: 1,
                    selectedSize,
                    price,
                },
            ]

        setCart(updatedCart)
        writeStoredArray(CART_STORAGE_KEY, updatedCart, "cart-update")
        if (!existing && delta > 0) toast.success(t("addToCart"))
    }

    return (
        <section
            id="products"
            className="bg-[var(--brand-canvas)] px-4 py-14 transition-colors sm:px-6 lg:px-8 lg:py-20"
        >
            <div className="mx-auto max-w-[1600px]">
                <div className="mb-10 flex flex-col gap-6 border-b border-slate-300 pb-7 dark:border-white/15 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase text-[#ed6d0e]">
                            WhiteBear Product Centre
                        </p>
                        <h2 className="mt-2 text-3xl font-extrabold uppercase text-[#0b2945] dark:text-white sm:text-4xl lg:text-5xl">
                            {t("title")}
                        </h2>
                    </div>

                    <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                        <CategoryButton
                            active={activeTab === "all"}
                            onClick={() => setActiveTab("all")}
                        >
                            {t("tabs.all")}
                        </CategoryButton>
                        {categoriesLoading &&
                            Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="premium-skeleton h-10 w-24 shrink-0 rounded-md"
                                />
                            ))}
                        {categories.map((category) => (
                            <CategoryButton
                                key={category._id}
                                active={activeTab === category.slug}
                                onClick={() => setActiveTab(category.slug)}
                            >
                                {category.name[currentLanguage] || category.name.en}
                            </CategoryButton>
                        ))}
                    </div>
                </div>

                {(categoriesError || error) && (
                    <div
                        className="mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between"
                        role="alert"
                    >
                        <p>{categoriesError || t("serverError")}</p>
                        {error && (
                            <button
                                type="button"
                                onClick={() => void mutate()}
                                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-red-300 px-3 font-semibold transition hover:bg-red-100 dark:border-red-400/30 dark:hover:bg-red-500/10"
                            >
                                <RefreshCw size={15} />
                                {t("retry", { defaultValue: "Try again" })}
                            </button>
                        )}
                    </div>
                )}

                {isLoading ? (
                    <ProductGridSkeleton />
                ) : products.length === 0 ? (
                    <div className="flex min-h-72 flex-col items-center justify-center border-y border-slate-300 text-center dark:border-white/15">
                        <PackageSearch size={42} className="text-[#0b4c8c]" />
                        <p className="mt-4 font-semibold text-[#0b2945] dark:text-white">
                            {t("serverError")}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                        {products.map((product, index) => {
                            const selectedSize = getPreferredSize(product.sizes)
                            const price = getSizePrice(selectedSize)
                            const unavailable =
                                product.stock === false ||
                                selectedSize?.stock === false ||
                                price === null
                            const cartQuantity = cart
                                .filter(
                                    (item) =>
                                        item._id === product._id &&
                                        getSizeKey(item.selectedSize) ===
                                            getSizeKey(selectedSize)
                                )
                                .reduce((total, item) => total + item.quantity, 0)

                            return (
                                <article
                                    key={product._id}
                                    data-testid="home-product-card"
                                    className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_28px_rgba(11,41,69,0.06)] transition hover:-translate-y-0.5 hover:border-[#0b4c8c]/50 hover:shadow-[0_14px_34px_rgba(11,41,69,0.12)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/20 dark:hover:border-[#f78a32]/60"
                                >
                                    <Link
                                        to={`/shop/${product._id}`}
                                        className="block"
                                    >
                                        <div className="relative h-40 bg-white p-4 dark:bg-[#f5f7f8] sm:h-64 sm:p-6">
                                            <img
                                                src={product.image}
                                                alt={product.title[currentLanguage]}
                                                className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                                                loading={index < 4 ? "eager" : "lazy"}
                                                fetchPriority={index < 4 ? "high" : "auto"}
                                                decoding="async"
                                            />
                                            <span className="absolute left-3 top-3 rounded-md bg-[#e9f0f5] px-2 py-1 text-[10px] font-bold uppercase text-[#0b4c8c]">
                                                {product.category || "WhiteBear"}
                                            </span>
                                            <span
                                                className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md border bg-white/90 ${
                                                    unavailable
                                                        ? "border-red-200 text-red-600"
                                                        : "border-emerald-200 text-emerald-600"
                                                }`}
                                                title={unavailable ? t("outOfStock") : t("inStock")}
                                                aria-label={unavailable ? t("outOfStock") : t("inStock")}
                                            >
                                                <span className="h-2 w-2 rounded-full bg-current" />
                                            </span>
                                        </div>

                                        <div className="border-t border-slate-100 px-3 pt-4 dark:border-white/10 sm:px-5">
                                            <p className="text-[10px] font-bold uppercase text-slate-400">
                                                No. {product.number}
                                            </p>
                                            <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[#0b2945] dark:text-white sm:text-base">
                                                {product.title[currentLanguage]}
                                            </h3>
                                        </div>
                                    </Link>

                                    <div className="mt-auto flex flex-col gap-3 px-3 pb-4 pt-4 sm:flex-row sm:items-end sm:justify-between sm:px-5 sm:pb-5">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase text-slate-400">
                                                {selectedSize?.size || "Standard"}
                                            </p>
                                            <p className="mt-1 text-base font-extrabold text-[#0b4c8c] dark:text-[#f78a32] sm:text-xl">
                                                {price === null
                                                    ? t("priceOnRequest")
                                                    : `${price.toLocaleString()} ${currency}`}
                                            </p>
                                        </div>

                                        {cartQuantity > 0 ? (
                                            <div
                                                data-testid="home-quantity-stepper"
                                                className="grid h-11 w-full shrink-0 grid-cols-[36px_1fr_36px] overflow-hidden rounded-md border border-slate-300 bg-white dark:border-white/15 dark:bg-[#111a23] sm:w-28"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => updateCartQuantity(product, -1)}
                                                    aria-label={`Decrease ${product.title[currentLanguage]}`}
                                                    className="flex items-center justify-center text-[#0b2945] transition hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
                                                >
                                                    <Minus size={15} />
                                                </button>
                                                <span className="flex items-center justify-center border-x border-slate-300 text-sm font-bold text-[#0b2945] dark:border-white/15 dark:text-white">
                                                    {cartQuantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateCartQuantity(product, 1)}
                                                    disabled={cartQuantity >= 999}
                                                    aria-label={`Increase ${product.title[currentLanguage]}`}
                                                    className="flex items-center justify-center bg-[#ed6d0e] text-white transition hover:bg-[#d95e06] disabled:bg-slate-300"
                                                >
                                                    <Plus size={15} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => updateCartQuantity(product, 1)}
                                                disabled={unavailable}
                                                aria-label={`${t("addToCart")}: ${product.title[currentLanguage]}`}
                                                className="flex h-11 w-full shrink-0 items-center justify-center rounded-md bg-[#ed6d0e] text-white shadow-[0_8px_20px_rgba(237,109,14,0.2)] transition hover:bg-[#d95e06] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:w-12"
                                            >
                                                <ShoppingBag size={19} />
                                            </button>
                                        )}
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}

                <Button
                    asChild
                    className="mt-10 h-12 w-full rounded-md bg-[#0b2945] px-6 text-sm font-bold uppercase text-white shadow-[0_10px_24px_rgba(11,41,69,0.16)] hover:bg-[#0b4c8c] dark:bg-[#f78a32] dark:text-[#08121b] dark:shadow-black/20 dark:hover:bg-[#ed6d0e] sm:w-auto"
                >
                    <Link to="/shop">
                        {t("showAll")}
                        <ArrowRight size={18} />
                    </Link>
                </Button>
            </div>
        </section>
    )
}

const CategoryButton = ({
    active,
    onClick,
    children,
}: {
    active: boolean
    onClick: () => void
    children: ReactNode
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`h-10 shrink-0 rounded-md border px-4 text-xs font-bold uppercase transition ${
            active
                ? "border-[#0b4c8c] bg-[#0b4c8c] text-white dark:border-[#f78a32] dark:bg-[#f78a32] dark:text-[#08121b]"
                : "border-slate-300 bg-white text-slate-600 hover:border-[#0b4c8c] hover:text-[#0b4c8c] dark:border-white/15 dark:bg-[#111a23] dark:text-slate-300 dark:hover:border-[#f78a32] dark:hover:text-[#f78a32]"
        }`}
    >
        {children}
    </button>
)

const ProductGridSkeleton = () => (
    <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4"
        aria-label="Loading products"
        role="status"
    >
        {Array.from({ length: 8 }).map((_, index) => (
            <div
                key={index}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_28px_rgba(11,41,69,0.06)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/20"
            >
                <div className="premium-skeleton h-40 sm:h-64" />
                <div className="space-y-3 p-4 sm:p-5">
                    <div className="premium-skeleton h-2.5 w-16 rounded-md" />
                    <div className="premium-skeleton h-4 w-3/4 rounded-md" />
                    <div className="flex items-end justify-between pt-5">
                        <div className="premium-skeleton h-6 w-24 rounded-md" />
                        <div className="premium-skeleton h-11 w-11 rounded-md" />
                    </div>
                </div>
            </div>
        ))}
        <span className="sr-only">Loading products</span>
    </div>
)
