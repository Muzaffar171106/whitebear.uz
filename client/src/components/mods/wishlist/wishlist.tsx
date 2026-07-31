"use client"

import { Heart } from "lucide-react"
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getPreferredSize, getSizePrice } from "@/lib/product";


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

    number: number
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
}
interface WishlistProps {
    wishlistItems: Product[]
    currentLanguage: "en" | "uz" | "ru" | "ch"
    onAddToCart?: (product: Product) => void
    onRemoveWishlist?: (productId: string) => void
    shopText?: string
    titleText?: string
}



export default function Wishlist({
    wishlistItems,
    currentLanguage,
    onRemoveWishlist,
    titleText,
}: WishlistProps) {

    const { t } = useTranslation();
    const currency = "USD"

    return (
        <div className="mx-auto w-full max-w-[1600px] bg-white px-4 py-12 transition-colors dark:bg-[#0f171f] sm:px-6 lg:px-8">

            {/* HEADER */}
            <div className="flex flex-col gap-8 text-left">

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[#191C1F] dark:text-white">
                        {titleText ?? t("wishlist")}
                    </h1>
                </div>

                {wishlistItems.length === 0 && (
                    <Link
                        to="/shop"
                        className="inline-flex w-auto self-center rounded-md bg-[#ED6D0E] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#d95e06]"
                    >
                        {t("goToShop")}
                    </Link>
                )}
            </div>

            {/* ITEMS */}

            {wishlistItems.length > 0 && (
                <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {wishlistItems.map((product) => (
                        <div
                            key={product._id}
                            className="overflow-hidden rounded-lg border border-[#E4E7E9] bg-white shadow-[0_8px_28px_rgba(11,41,69,0.06)] transition hover:-translate-y-0.5 hover:border-[#0B4C8C]/40 hover:shadow-[0_14px_34px_rgba(11,41,69,0.12)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/20"
                        >
                            <div className="relative h-56 bg-[#f4f7fa]">
                                <img
                                    src={product.image}
                                    alt={product.title?.[currentLanguage]}
                                    className="h-full w-full object-contain object-center p-4"
                                />
                            </div>

                            <div className="p-4">
                                <h3 className="line-clamp-2 min-h-[48px] font-medium text-[#191C1F] dark:text-white">
                                    {product.title?.[currentLanguage]}
                                </h3>

                                <p className="mt-3 text-2xl font-bold text-[#0B4C8C] dark:text-[#f78a32]">
                                    {getSizePrice(getPreferredSize(product.sizes)) !== null ? (
                                        <span>
                                            {getSizePrice(getPreferredSize(product.sizes))?.toLocaleString()} {currency}
                                        </span>
                                    ) : (
                                        <span className="text-sm">{t("priceOnRequest")}</span>
                                    )}

                                </p>

                                <div className="mt-2">
                                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                                        {(product.sizes?.some((size) => size.stock !== false) ?? true)
                                            ? t("inStock")
                                            : t("outOfStock")}
                                    </span>
                                </div>

                                <div className="mt-5 flex gap-2">
                                    <Link to={`/shop/${product._id}`} className="w-full">
                                        <button className="w-full flex-1 rounded-md bg-[#ED6D0E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d95e06]">
                                            {t("detail")}
                                        </button>
                                    </Link>

                                    <button onClick={() => onRemoveWishlist?.(product._id)}
                                        aria-label={t("wishlist")}
                                        className="flex h-12 w-12 items-center justify-center rounded-md border border-[#E4E7E9] transition hover:bg-red-50 dark:border-white/10 dark:hover:bg-red-500/10">
                                        <Heart
                                            size={18}
                                            className="fill-red-500 text-red-500"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
