"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { ChevronLeft, ChevronRight, Heart, Minus, PackageSearch, Plus, SlidersHorizontal, X } from "lucide-react"
import { Fetch } from "@/middlewares/Fetch"
import { useTranslation } from "react-i18next"
import { Link, useSearchParams } from "react-router-dom"
import { resolveLanguage } from "@/lib/locale"
import {
    CART_STORAGE_KEY,
    readStoredArray,
    WISHLIST_STORAGE_KEY,
    writeStoredArray,
} from "@/lib/storage"
import { getPreferredSize, getSizePrice } from "@/lib/product"
import { toast } from "sonner"
import { readResponseCache, writeResponseCache } from "@/lib/response-cache"

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

interface Product {
    _id: string
    image: string
    category?: string
    title: {
        en: string
        uz: string
        ru: string
        ch: string
    }
    price: number
    old_price?: number
    sizes?: Array<{
        size: string
        stock: boolean
        package: string
        price: {
            usd: string;
            uzs: string;
            rub: string;
            yuan: string;
        }
    }>
    stock?: boolean
}

type ProductResponse = {
    products?: Product[]
    totalPages?: number
    totalProducts?: number
}

type CartItem = Product & {
    quantity: number
    selectedSize?: {
        size: string
        stock: boolean
        package: string
        price: {
            usd: string
            uzs: string
            rub: string
            yuan: string
        }
    } | null
}

const getSizeKey = (selectedSize?: CartItem["selectedSize"] | null) =>
    selectedSize ? `${selectedSize.size}-${selectedSize.package}` : "default"

export const AllProducts = () => {
    const { t, i18n } = useTranslation()
    const currency = "USD"
    const [searchParams] = useSearchParams()
    const searchQuery = searchParams.get("q")?.trim() ?? ""

    const [categories, setCategories] = useState<CategoryOption[]>([])
    const [categoriesLoading, setCategoriesLoading] = useState(false)
    const [categoriesError, setCategoriesError] = useState("")

    const currentLanguage = useMemo(
        () => resolveLanguage(i18n.language),
        [i18n.language],
    )

    const CATEGORY_OPTIONS = [
        { value: "", label: t("all") },
        ...categories.map((category) => ({
            value: category.slug,
            label: category.name?.[currentLanguage] || category.name?.en || category.slug,
        })),
    ] as const

    const STOCK_OPTIONS = [
        { value: "both", label: t("all") },
        { value: "in", label: t("inStock") },
        { value: "out", label: t("outOfStock") },
    ] as const

    const [filterOpen, setFilterOpen] = useState(false)

    const [page, setPage] = useState(1)

    const [category, setCategory] = useState("")
    const [stock, setStock] = useState("")
    const [cart, setCart] = useState<CartItem[]>([])
    const [wishlist, setWishlist] = useState<Product[]>([])

    useEffect(() => {
        setPage(1)
    }, [searchQuery])

    const queryString = useMemo(() => {
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", "8")

        if (category) params.set("category", category)
        if (stock && stock !== "both") params.set("stock", stock)
        if (searchQuery) params.set("q", searchQuery)
        return params.toString()
    }, [category, page, searchQuery, stock])

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
            } catch (err) {
                console.error(err)
                setCategoriesError("Failed to load categories")
            } finally {
                setCategoriesLoading(false)
            }
        }

        loadCategories()
    }, [])

    const productQuery = `/product?${queryString}`
    const productCacheKey = `whitebear:products:${productQuery}`
    const fallbackData = useMemo(
        () => readResponseCache<ProductResponse>(productCacheKey),
        [productCacheKey]
    )
    const { data, isLoading, error } = useSWR<ProductResponse>(
        productQuery,
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
    const products = Array.isArray(data?.products) ? data.products : []
    const totalPages = data?.totalPages || 1
    const totalProducts = data?.totalProducts || 0

    const handleClearFilters = () => {
        setCategory("")
        setStock("")
        setPage(1)
        setFilterOpen(false)
    }

    const handleCategoryChange = (value: string) => {
        setCategory(value)
        setPage(1)
    }

    const handleStockChange = (value: string) => {
        setStock(value)
        setPage(1)
    }

    const handlePageChange = (selectedPage: number) => {
        setPage(selectedPage)
    }


    const updateCartQuantity = (product: Product, delta: number) => {
        const selectedSize = getPreferredSize(product.sizes)
        const price = getSizePrice(selectedSize)

        if (
            !selectedSize ||
            product.stock === false ||
            selectedSize.stock === false ||
            price === null
        ) {
            return
        }

        const itemKey = getSizeKey(selectedSize)
        const existingIndex = cart.findIndex(
            (item) => item._id === product._id && getSizeKey(item.selectedSize) === itemKey
        )
        if (existingIndex < 0 && delta <= 0) return

        const nextQuantity = Math.min(
            999,
            Math.max(0, (cart[existingIndex]?.quantity ?? 0) + delta)
        )
        const updatedCart = existingIndex >= 0
            ? nextQuantity === 0
                ? cart.filter(
                    (item) =>
                        !(
                            item._id === product._id &&
                            getSizeKey(item.selectedSize) === itemKey
                        )
                )
                : cart.map((item) =>
                    item._id === product._id && getSizeKey(item.selectedSize) === itemKey
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
        if (existingIndex < 0 && delta > 0) toast.success(t("addToCart"))
    }

    const handleAddToWishlist = (product: Product) => {
        const isInWishlist = wishlist.some(
            (item) => item._id === product._id
        )

        const updatedWishlist = isInWishlist
            ? wishlist.filter((item) => item._id !== product._id)
            : [...wishlist, product]

        setWishlist(updatedWishlist)

        writeStoredArray(WISHLIST_STORAGE_KEY, updatedWishlist, "wishlist-update")
    }
    const isInWishlist = (productId: string) =>
        wishlist.some((item) => item._id === productId)
    const getCartQuantity = (productId: string, selectedSize?: CartItem["selectedSize"] | null) =>
        cart
            .filter((item) => item._id === productId && getSizeKey(item.selectedSize) === getSizeKey(selectedSize))
            .reduce((total, item) => total + item.quantity, 0)

    useEffect(() => {
        setCart(readStoredArray<CartItem>(CART_STORAGE_KEY))
        setWishlist(readStoredArray<Product>(WISHLIST_STORAGE_KEY))
    }, [])


    return (
        <section className="min-h-screen bg-[#f3f6f8] transition-colors dark:bg-[#0f171f]">
            <div className="max-w-[1600px] mx-auto px-4 py-10">

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                    <aside className="hidden md:block md:w-[280px] md:border-r md:border-slate-200 md:pr-6 dark:md:border-white/10">
                        <div className="p-4">
                            <div className="border-b pb-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg">{t("category")}</h3>
                                    <button
                                        onClick={handleClearFilters}
                                        className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
                                    >
                                        {t("clearAll")}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {categoriesLoading ? (
                                        Array.from({ length: 4 }).map((_, index) => (
                                            <div key={index} className="premium-skeleton h-5 w-full rounded-md" />
                                        ))
                                    ) : categoriesError ? (
                                        <p className="text-sm text-red-500">{categoriesError}</p>
                                    ) : (
                                        CATEGORY_OPTIONS.map((option) => (
                                            <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                                                <input
                                                    type="radio"
                                                    name="desktop-category"
                                                    checked={category === option.value}
                                                    onChange={() => handleCategoryChange(option.value)}
                                                    className="h-4 w-4 accent-[#0B4C8C]"
                                                />
                                                {option.label}
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">{t("stockStatus")}</h3>

                                <div className="space-y-3">
                                    {STOCK_OPTIONS.map((option) => (
                                        <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                                            <input
                                                type="radio"
                                                name="desktop-stock"
                                                checked={(stock || "both") === option.value}
                                                onChange={() => handleStockChange(option.value)}
                                                className="h-4 w-4 accent-[#0B4C8C]"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>


                        </div>
                    </aside>

                    {filterOpen && (
                        <div
                            className="fixed inset-0 z-20 bg-black/40 md:hidden"
                            onClick={() => setFilterOpen(false)}
                        />
                    )}

                    <div
                        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-[#111a23] md:hidden ${filterOpen ? "translate-x-0" : "-translate-x-full"}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 h-full overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold text-xl"> {t("filters")}</h2>

                                <button
                                    onClick={() => setFilterOpen(false)}
                                    className="p-1"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="border-b pb-6 mb-6">
                                <h3 className="font-semibold mb-4"> {t("category")}</h3>

                                <div className="space-y-3">
                                    {categoriesLoading ? (
                                        Array.from({ length: 4 }).map((_, index) => (
                                            <div key={index} className="premium-skeleton h-5 w-full rounded-md" />
                                        ))
                                    ) : categoriesError ? (
                                        <p className="text-sm text-red-500">{categoriesError}</p>
                                    ) : (
                                        CATEGORY_OPTIONS.map((option) => (
                                            <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                                                <input
                                                    type="radio"
                                                    name="mobile-category"
                                                    checked={category === option.value}
                                                    onChange={() => handleCategoryChange(option.value)}
                                                    className="h-4 w-4 accent-[#0B4C8C]"
                                                />
                                                {option.label}
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-4">{t("stockStatus")}</h3>

                                <div className="space-y-3">
                                    {STOCK_OPTIONS.map((option) => (
                                        <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                                            <input
                                                type="radio"
                                                name="mobile-stock"
                                                checked={(stock || "both") === option.value}
                                                onChange={() => handleStockChange(option.value)}
                                                className="h-4 w-4 accent-[#0B4C8C]"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleClearFilters}
                                className="mt-8 w-full cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
                            >
                                {t("clearAll")}
                            </button>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="flex-1 w-full">

                        {/* Header with Filter Toggle and Sort */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-10 gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-semibold text-[#163555] dark:text-white sm:text-4xl">{t("products")}</h1>
                                    {searchQuery && (
                                        <p className="mt-1 text-sm font-medium text-[#0B4C8C] dark:text-[#72d2f3]">
                                            “{searchQuery}”
                                        </p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                        {isLoading ? t("loading") : `${totalProducts} ${t("results")}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 flex-col sm:flex-row">
                                <button
                                    onClick={() => setFilterOpen(true)}
                                    className="flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm md:hidden"
                                >
                                    <SlidersHorizontal size={17} />
                                    {t("filters")}
                                </button>
                            </div>
                        </div>

                        {error ? (
                            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">{t("error") || "Something went wrong"}</div>
                        ) : isLoading ? (
                            <ShopProductSkeleton />
                        ) : (
                            <>
                                {products.length === 0 ? (
                                    <div className="flex min-h-80 flex-col items-center justify-center border-y border-gray-200 px-4 text-center dark:border-white/10">
                                        <PackageSearch size={42} className="text-[#0B4C8C] dark:text-[#72d2f3]" />
                                        <h2 className="mt-4 text-xl font-semibold text-[#163555] dark:text-white">
                                            {t("noProducts", { defaultValue: "No products found" })}
                                        </h2>
                                        <button
                                            onClick={handleClearFilters}
                                            className="mt-5 rounded-md bg-[#ED6D0E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d95e06]"
                                        >
                                            {t("clearAll")}
                                        </button>
                                    </div>
                                ) : (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                                    {products.map((product: Product, index: number) => (
                                        <div
                                            key={product._id}
                                            className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_8px_28px_rgba(11,41,69,0.06)] transition hover:-translate-y-0.5 hover:border-[#0B4C8C]/40 hover:shadow-[0_14px_34px_rgba(11,41,69,0.12)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/20 dark:hover:border-[#f78a32]/60"
                                        >
                                            <Link to={`/shop/${product._id}`}>
                                                <div className="relative h-40 bg-[#f4f7fa] p-3 sm:h-64 sm:p-5">
                                                    <img
                                                        src={product.image}
                                                        alt={product.title?.[currentLanguage] || product.title?.en}
                                                        className="h-full w-full object-contain object-center transition duration-300 group-hover:scale-[1.03]"
                                                        loading={index < 4 ? "eager" : "lazy"}
                                                        fetchPriority={index < 4 ? "high" : "auto"}
                                                    />
                                                </div>

                                                <div className="p-3 sm:p-4 ">
                                                    <h3 className="font-semibold text-sm sm:text-base mb-1">
                                                        {product.title?.[currentLanguage]}
                                                    </h3>

                                                    <p className="mb-2 text-xs uppercase text-gray-500 dark:text-slate-400">
                                                        {product.category}
                                                    </p>

                                                    <p className={`text-xs font-semibold mb-2 ${product.stock === false ? "text-red-500" : "text-emerald-600"}`}>
                                                        {/* {product.stock === false ? "Out of stock" : "In stock"} */}
                                                        {product.stock === false
                                                            ? t("outOfStock")
                                                            : t("inStock")}
                                                    </p>

                                                    <div className="flex items-center gap-2 mb-3">
                                                        {getSizePrice(getPreferredSize(product.sizes)) !== null ? (
                                                            <span className="text-lg font-bold text-[#0B4C8C] dark:text-[#f78a32] sm:text-xl">
                                                                {getSizePrice(getPreferredSize(product.sizes))?.toLocaleString()} {currency}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm font-semibold text-gray-600 dark:text-slate-300">
                                                                {t("priceOnRequest")}
                                                            </span>
                                                        )}
                                                        {typeof product.old_price === "number" && product.old_price > 0 && (
                                                            <span className="text-xs text-gray-500 line-through dark:text-slate-400 sm:text-sm">
                                                                ${product.old_price}
                                                            </span>
                                                        )}
                                                    </div>

                                                </div>
                                            </Link>
                                            <div className="flex gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
                                                {getCartQuantity(product._id, getPreferredSize(product.sizes)) > 0 ? (
                                                    <div
                                                        data-testid="shop-quantity-stepper"
                                                        className="grid min-h-10 flex-1 grid-cols-[40px_1fr_40px] overflow-hidden rounded-md border border-slate-300 bg-white dark:border-white/15 dark:bg-[#111a23]"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => updateCartQuantity(product, -1)}
                                                            aria-label={`Decrease ${product.title?.[currentLanguage] || product.title?.en}`}
                                                            className="flex items-center justify-center text-[#0b2945] transition hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="flex items-center justify-center border-x border-slate-300 text-sm font-bold text-[#0b2945] dark:border-white/15 dark:text-white">
                                                            {getCartQuantity(product._id, getPreferredSize(product.sizes))}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateCartQuantity(product, 1)}
                                                            disabled={getCartQuantity(product._id, getPreferredSize(product.sizes)) >= 999}
                                                            aria-label={`Increase ${product.title?.[currentLanguage] || product.title?.en}`}
                                                            className="flex items-center justify-center bg-[#ed6d0e] text-white transition hover:bg-[#d95e06] disabled:bg-slate-300"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCartQuantity(product, 1)}
                                                        disabled={
                                                            product.stock === false ||
                                                            getSizePrice(getPreferredSize(product.sizes)) === null
                                                        }
                                                        className="flex min-h-10 flex-1 items-center justify-center rounded-md bg-[#0b2945] px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,41,69,0.14)] transition hover:bg-[#0b4c8c] disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none dark:bg-[#f78a32] dark:text-[#08121b] dark:shadow-black/20 dark:hover:bg-[#ed6d0e]"
                                                    >
                                                        {t("addToCart")}
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleAddToWishlist(product)}
                                                    aria-label={t("wishlist")}
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition hover:bg-red-50 dark:hover:bg-red-500/10 sm:h-11 sm:w-11"
                                                >
                                                    <Heart
                                                        size={18}
                                                        className={isInWishlist(product._id) ? "fill-red-500 text-red-500" : "hover:fill-red-500 hover:text-red-500"}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                )}

                                {totalPages > 1 && (
                                <div className="mt-10 flex flex-wrap items-center justify-center gap-2 lg:mt-12">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => handlePageChange(page - 1)}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg border transition hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-white/10"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter((item) => totalPages <= 7 || item === 1 || item === totalPages || Math.abs(item - page) <= 1)
                                        .map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => handlePageChange(item)}
                                            className={`h-10 w-10 rounded-md transition ${page === item
                                                ? "bg-[#0B4C8C] text-white"
                                                : "border hover:bg-gray-100 dark:hover:bg-white/10"
                                                }`}
                                        >
                                            {item}
                                        </button>
                                    ))}

                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => handlePageChange(page + 1)}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg border transition hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-white/10"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section >
    )
}

const ShopProductSkeleton = () => (
    <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6"
        aria-label="Loading products"
        role="status"
    >
        {Array.from({ length: 8 }).map((_, index) => (
            <div
                key={index}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_8px_28px_rgba(11,41,69,0.06)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/20"
            >
                <div className="premium-skeleton h-40 sm:h-64" />
                <div className="space-y-3 p-3 sm:p-4">
                    <div className="premium-skeleton h-4 w-3/4 rounded-md" />
                    <div className="premium-skeleton h-3 w-2/5 rounded-md" />
                    <div className="premium-skeleton h-6 w-24 rounded-md" />
                    <div className="premium-skeleton mt-4 h-10 w-full rounded-md" />
                </div>
            </div>
        ))}
        <span className="sr-only">Loading products</span>
    </div>
)

