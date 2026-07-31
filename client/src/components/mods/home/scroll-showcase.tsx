"use client"

import { Fetch } from "@/middlewares/Fetch"
import { resolveLanguage } from "@/lib/locale"
import { getPreferredSize, getSizePrice } from "@/lib/product"
import { readResponseCache, writeResponseCache } from "@/lib/response-cache"
import {
    CART_STORAGE_KEY,
    readStoredArray,
    writeStoredArray,
} from "@/lib/storage"
import { ArrowUpRight, ShoppingBag } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLayoutEffect, useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import useSWR from "swr"

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
    price?: number
}

const QUERY = "/product?page=1&limit=8"
const CACHE_KEY = `whitebear:products:${QUERY}`

const sceneStyles = [
    "bg-[#dceef4] text-[#0b2945] dark:bg-[#122b3a] dark:text-white",
    "bg-[#f3c969] text-[#17202a] dark:bg-[#4a3815] dark:text-white",
    "bg-[#dce7d3] text-[#183023] dark:bg-[#203528] dark:text-white",
]

const getSizeKey = (size?: ProductSize | null) =>
    size ? `${size.size}-${size.package}` : "default"

export const ScrollShowcase = () => {
    const { t, i18n } = useTranslation("common")
    const rootRef = useRef<HTMLElement>(null)
    const fallbackData = useMemo(
        () => readResponseCache<ProductResponse>(CACHE_KEY),
        []
    )
    const currentLanguage = useMemo(
        () => resolveLanguage(i18n.language),
        [i18n.language]
    )
    const { data, isLoading } = useSWR<ProductResponse>(
        QUERY,
        async (url: string) => {
            const response = await Fetch.get(url)
            writeResponseCache(CACHE_KEY, response.data)
            return response.data
        },
        {
            fallbackData,
            revalidateOnMount: !fallbackData,
        }
    )
    const products = Array.isArray(data?.products)
        ? data.products.slice(0, 3)
        : []

    useLayoutEffect(() => {
        if (!products.length) return

        gsap.registerPlugin(ScrollTrigger)
        const context = gsap.context(() => {
            const media = gsap.matchMedia()

            media.add(
                "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
                () => {
                    gsap.utils
                        .toArray<HTMLElement>("[data-showcase-scene]")
                        .forEach((scene) => {
                            const image = scene.querySelector(
                                "[data-showcase-image]"
                            )
                            const copy = scene.querySelector("[data-showcase-copy]")
                            const meta = scene.querySelector("[data-showcase-meta]")

                            gsap.fromTo(
                                image,
                                { yPercent: 16, rotate: -7, scale: 0.84 },
                                {
                                    yPercent: -12,
                                    rotate: 6,
                                    scale: 1.06,
                                    ease: "none",
                                    scrollTrigger: {
                                        trigger: scene,
                                        start: "top bottom",
                                        end: "bottom top",
                                        scrub: 0.65,
                                    },
                                }
                            )
                            gsap.from(copy, {
                                x: -70,
                                opacity: 0,
                                duration: 0.75,
                                ease: "power3.out",
                                scrollTrigger: {
                                    trigger: scene,
                                    start: "top 62%",
                                    toggleActions: "play none none reverse",
                                },
                            })
                            gsap.from(meta, {
                                x: 70,
                                opacity: 0,
                                duration: 0.75,
                                ease: "power3.out",
                                scrollTrigger: {
                                    trigger: scene,
                                    start: "top 62%",
                                    toggleActions: "play none none reverse",
                                },
                            })
                        })
                }
            )
        }, rootRef)

        return () => context.revert()
    }, [products.length])

    const addToCart = (product: Product) => {
        const selectedSize = getPreferredSize(product.sizes)
        const price = getSizePrice(selectedSize)
        if (!selectedSize || selectedSize.stock === false || price === null) return

        const cart = readStoredArray<CartItem>(CART_STORAGE_KEY)
        const sizeKey = getSizeKey(selectedSize)
        const existing = cart.find(
            (item) =>
                item._id === product._id &&
                getSizeKey(item.selectedSize) === sizeKey
        )
        const updatedCart = existing
            ? cart.map((item) =>
                item._id === product._id &&
                getSizeKey(item.selectedSize) === sizeKey
                    ? {
                        ...item,
                        quantity: Math.min(999, (item.quantity || 1) + 1),
                    }
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

        writeStoredArray(CART_STORAGE_KEY, updatedCart, "cart-update")
        toast.success(t("homepage.products.addToCart"))
    }

    if (isLoading && !fallbackData) return <ShowcaseSkeleton />
    if (!products.length) return null

    return (
        <section
            ref={rootRef}
            id="featured-products"
            className="relative bg-[#dceef4] transition-colors dark:bg-[#122b3a]"
        >
            {products.map((product, index) => {
                const selectedSize = getPreferredSize(product.sizes)
                const price = getSizePrice(selectedSize)
                const unavailable =
                    product.stock === false ||
                    selectedSize?.stock === false ||
                    price === null

                return (
                    <article
                        key={product._id}
                        data-showcase-scene
                        className={`relative lg:min-h-[115svh] ${sceneStyles[index]}`}
                    >
                        <div className="relative flex items-center overflow-visible lg:sticky lg:top-[72px] lg:min-h-[calc(100svh-72px)] lg:overflow-hidden">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute left-1/2 top-1/2 w-max -translate-x-1/2 -translate-y-1/2 text-[clamp(5rem,16vw,15rem)] font-black uppercase leading-none text-current opacity-[0.055]"
                            >
                                {product.category || "WhiteBear"}
                            </div>

                            <div className="relative z-10 mx-auto grid w-full max-w-[1600px] items-center gap-5 px-4 pb-24 pt-10 sm:gap-8 sm:px-6 sm:py-14 lg:grid-cols-[0.82fr_1.3fr_0.78fr] lg:px-8 lg:py-16">
                                <div data-showcase-copy className="max-w-md">
                                    <p className="text-xs font-bold uppercase opacity-65">
                                        {t("homepage.showcase.eyebrow")} · 0{index + 1}
                                    </p>
                                    <h2 className="mt-3 text-3xl font-black leading-[1.06] sm:mt-4 sm:text-4xl lg:text-5xl">
                                        {product.title[currentLanguage] ||
                                            product.title.en}
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 opacity-72 sm:mt-5 sm:text-base sm:leading-7">
                                        {t("homepage.showcase.description")}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold sm:mt-6">
                                        <span className="rounded-md border border-current/20 px-3 py-2">
                                            No. {product.number}
                                        </span>
                                        {selectedSize?.size && (
                                            <span className="rounded-md border border-current/20 px-3 py-2">
                                                {selectedSize.size}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="relative flex min-h-[240px] items-center justify-center sm:min-h-[360px] lg:min-h-[610px]">
                                    <img
                                        data-showcase-image
                                        src={product.image}
                                        alt={
                                            product.title[currentLanguage] ||
                                            product.title.en
                                        }
                                        width={720}
                                        height={720}
                                        loading={index === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                        className="relative z-10 max-h-[270px] w-full max-w-[620px] object-contain drop-shadow-[0_28px_26px_rgba(0,0,0,0.2)] sm:max-h-[480px] lg:max-h-[620px]"
                                    />
                                </div>

                                <div data-showcase-meta className="lg:justify-self-end">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-70">
                                        <span
                                            className={`h-2.5 w-2.5 rounded-full ${
                                                unavailable
                                                    ? "bg-red-500"
                                                    : "bg-emerald-600"
                                            }`}
                                        />
                                        {unavailable
                                            ? t("homepage.products.serverError")
                                            : t("homepage.showcase.inStock")}
                                    </div>
                                    <p className="mt-4 text-xs font-bold uppercase opacity-60 sm:mt-6">
                                        {t("homepage.showcase.price")}
                                    </p>
                                    <p className="mt-1 text-3xl font-black sm:mt-2 sm:text-4xl">
                                        {price === null
                                            ? t("homepage.products.serverError")
                                            : `${price.toLocaleString()} USD`}
                                    </p>
                                    <div className="mt-5 grid grid-cols-2 gap-2 lg:mt-8 lg:grid-cols-1 lg:gap-3">
                                        <button
                                            type="button"
                                            onClick={() => addToCart(product)}
                                            disabled={unavailable}
                                            className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#ed6d0e] px-3 text-xs font-bold uppercase text-white shadow-[0_12px_28px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-[#d95e06] disabled:cursor-not-allowed disabled:opacity-50 lg:h-12 lg:px-5 lg:text-sm"
                                        >
                                            <ShoppingBag size={18} />
                                            {t("homepage.products.addToCart")}
                                        </button>
                                        <Link
                                            to={`/shop/${product._id}`}
                                            className="flex h-11 items-center justify-center gap-2 rounded-md border border-current/25 px-3 text-xs font-bold uppercase transition hover:bg-black/5 dark:hover:bg-white/5 lg:h-12 lg:justify-between lg:px-5 lg:text-sm"
                                        >
                                            {t("homepage.showcase.details")}
                                            <ArrowUpRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                )
            })}
        </section>
    )
}

const ShowcaseSkeleton = () => (
    <section
        id="featured-products"
        className="flex min-h-[100svh] items-center bg-[#dceef4] px-4 py-12 dark:bg-[#122b3a] md:min-h-[calc(100svh-72px)] md:py-16"
        role="status"
        aria-label="Loading featured products"
    >
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-8 lg:grid-cols-3">
            <div className="space-y-4">
                <div className="premium-skeleton h-3 w-32 rounded-md" />
                <div className="premium-skeleton h-12 w-full rounded-lg" />
                <div className="premium-skeleton h-20 w-full rounded-lg" />
            </div>
            <div className="premium-skeleton mx-auto h-[360px] w-full max-w-[520px] rounded-lg lg:h-[560px]" />
            <div className="space-y-4">
                <div className="premium-skeleton h-4 w-24 rounded-md" />
                <div className="premium-skeleton h-10 w-40 rounded-lg" />
                <div className="premium-skeleton h-12 w-full rounded-lg" />
            </div>
        </div>
        <span className="sr-only">Loading featured products</span>
    </section>
)
