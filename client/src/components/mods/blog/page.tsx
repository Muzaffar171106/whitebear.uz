"use client"

import type { SyntheticEvent } from "react"
import { BookOpen, CalendarDays, Newspaper, RefreshCw } from "lucide-react"
import { useTranslation } from "react-i18next"
import useSWR from "swr"

import { Button } from "@/components/ui/button"
import { Fetch } from "@/middlewares/Fetch"

interface Lang {
    en: string
    ru: string
    uz: string
    ch: string
}

interface BlogItem {
    _id: string
    title: Lang
    text: Lang
    image: string
    createdAt?: string
}

const localeMap: Record<keyof Lang, string> = {
    en: "en-US",
    ru: "ru-RU",
    uz: "uz-UZ",
    ch: "zh-CN",
}

const getLanguageKey = (language: string): keyof Lang => {
    const key = language.split("-")[0] as keyof Lang
    return key in localeMap ? key : "en"
}

const getLocalizedText = (value: Lang | undefined, language: string) => {
    if (!value) return ""

    const key = getLanguageKey(language)
    return value[key] || value.en || Object.values(value).find(Boolean) || ""
}

const BlogCardSkeleton = () => (
    <div className="overflow-hidden rounded-lg border border-[#dbe6ed] bg-white dark:border-white/10 dark:bg-[#0d1d29]">
        <div className="aspect-[16/10] animate-pulse bg-[#dfeaf0] dark:bg-[#142938]" />
        <div className="space-y-4 p-5 sm:p-6">
            <div className="h-4 w-28 animate-pulse rounded bg-[#dfeaf0] dark:bg-[#142938]" />
            <div className="h-7 w-4/5 animate-pulse rounded bg-[#dfeaf0] dark:bg-[#142938]" />
            <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-[#e7eef2] dark:bg-[#142938]" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-[#e7eef2] dark:bg-[#142938]" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#e7eef2] dark:bg-[#142938]" />
            </div>
        </div>
    </div>
)

export const Blog = () => {
    const { t, i18n } = useTranslation("common", {
        keyPrefix: "blog",
    })

    const fetcher = (url: string) => Fetch.get(url).then((response) => response.data)
    const {
        data: cards = [],
        error,
        isLoading,
        mutate,
    } = useSWR<BlogItem[]>("blog", fetcher, {
        dedupingInterval: 60_000,
        keepPreviousData: true,
        revalidateOnFocus: false,
        errorRetryCount: 2,
    })

    const languageKey = getLanguageKey(i18n.language)
    const dateFormatter = new Intl.DateTimeFormat(localeMap[languageKey], {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })

    const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
        const image = event.currentTarget

        if (
            image.naturalWidth === 1200 &&
            image.naturalHeight === 1076 &&
            !image.src.endsWith("/blog/blogmain.webp")
        ) {
            image.src = "/blog/blogmain.webp"
        }
    }

    const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
        const image = event.currentTarget

        if (!image.src.endsWith("/blog/blogmain.webp")) {
            image.src = "/blog/blogmain.webp"
        }
    }

    return (
        <main className="min-h-screen bg-[#f2f7fa] text-[#102a43] transition-colors dark:bg-[#07131e] dark:text-white">
            <section className="relative h-[340px] max-h-[500px] min-h-[320px] overflow-hidden border-b border-white/10 sm:h-[420px] lg:h-[48vh]">
                <img
                    src="/blog/blogmain.webp"
                    alt={t("heroImageAlt", "White Bear production facility")}
                    width={1600}
                    height={588}
                    decoding="async"
                    fetchPriority="high"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-[#071b2c]/65" />

                <div className="relative mx-auto flex h-full max-w-[1320px] items-end px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-14">
                    <div className="max-w-[760px] text-white">
                        <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase text-[#8bdcf5]">
                            <span className="h-px w-8 bg-[#55c7ef]" />
                            {t("eyebrow", "White Bear insights")}
                        </div>
                        <h1 className="text-[36px] font-semibold leading-[1.08] sm:text-[46px] lg:text-[54px]">
                            {t("heroTitle", "Ideas built for modern infrastructure")}
                        </h1>
                        <p className="mt-5 max-w-[650px] text-[15px] leading-7 text-[#d4e3ed] sm:text-base">
                            {t(
                                "heroText",
                                "Practical guidance, product knowledge and company updates from the White Bear team."
                            )}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 md:py-16">
                <header className="mb-8 flex flex-col gap-5 border-b border-[#dbe6ed] pb-7 sm:flex-row sm:items-end sm:justify-between dark:border-white/10">
                    <div className="max-w-[720px]">
                        <p className="text-xs font-semibold uppercase text-[#167ca8] dark:text-[#72d2f3]">
                            {t("sectionEyebrow", "Knowledge center")}
                        </p>
                        <h2 className="mt-2 text-[28px] font-semibold leading-tight text-[#0b2945] sm:text-[34px] dark:text-white">
                            {t("sectionTitle", "Latest articles")}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
                            {t(
                                "sectionText",
                                "Explore useful information about our solutions, materials and industry."
                            )}
                        </p>
                    </div>

                    {!isLoading && !error && cards.length > 0 && (
                        <div className="flex w-fit items-center gap-2 rounded-lg border border-[#cfe2eb] bg-white px-3.5 py-2 text-sm font-medium text-[#27455f] dark:border-white/10 dark:bg-[#102230] dark:text-slate-200">
                            <Newspaper size={16} className="text-[#178fc7] dark:text-[#72d2f3]" />
                            {t("articleCount", {
                                count: cards.length,
                                defaultValue: "{{count}} articles",
                            })}
                        </div>
                    )}
                </header>

                {isLoading && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }, (_, index) => (
                            <BlogCardSkeleton key={index} />
                        ))}
                    </div>
                )}

                {!isLoading && error && (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-red-200 bg-white px-5 py-12 text-center dark:border-red-400/20 dark:bg-[#0d1d29]">
                        <span className="flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-300">
                            <RefreshCw size={21} />
                        </span>
                        <h3 className="mt-5 text-xl font-semibold text-[#0b2945] dark:text-white">
                            {t("serverError", "Articles could not be loaded")}
                        </h3>
                        <p className="mt-2 max-w-[460px] text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {t(
                                "errorText",
                                "Please check your connection and try loading the articles again."
                            )}
                        </p>
                        <Button
                            type="button"
                            onClick={() => void mutate()}
                            className="mt-6 h-11 rounded-lg bg-[#0f79a8] px-5 text-sm font-semibold text-white hover:bg-[#0b6790] dark:bg-[#1595c8] dark:hover:bg-[#1ca4d8]"
                        >
                            <RefreshCw className="mr-2 size-4" />
                            {t("retry", "Try again")}
                        </Button>
                    </div>
                )}

                {!isLoading && !error && cards.length === 0 && (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-[#dbe6ed] bg-white px-5 py-12 text-center dark:border-white/10 dark:bg-[#0d1d29]">
                        <span className="flex size-12 items-center justify-center rounded-lg bg-[#e9f7fb] text-[#178fc7] dark:bg-[#143b4c] dark:text-[#72d2f3]">
                            <BookOpen size={22} />
                        </span>
                        <h3 className="mt-5 text-xl font-semibold text-[#0b2945] dark:text-white">
                            {t("emptyTitle", "New articles are coming")}
                        </h3>
                        <p className="mt-2 max-w-[460px] text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {t(
                                "emptyText",
                                "Our team is preparing practical materials for this section."
                            )}
                        </p>
                    </div>
                )}

                {!isLoading && !error && cards.length > 0 && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {cards.map((item) => {
                            const title = getLocalizedText(item.title, i18n.language)
                            const text = getLocalizedText(item.text, i18n.language)
                            const date =
                                item.createdAt && !Number.isNaN(Date.parse(item.createdAt))
                                    ? dateFormatter.format(new Date(item.createdAt))
                                    : null

                            return (
                                <article
                                    key={item._id}
                                    className="group overflow-hidden rounded-lg border border-[#dbe6ed] bg-white shadow-[0_14px_36px_rgba(16,42,67,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#b9d8e6] hover:shadow-[0_20px_44px_rgba(16,42,67,0.1)] dark:border-white/10 dark:bg-[#0d1d29] dark:shadow-black/20 dark:hover:border-[#55c7ef]/35"
                                >
                                    <div className="aspect-[16/10] overflow-hidden bg-[#dfeaf0] dark:bg-[#142938]">
                                        <img
                                            src={item.image || "/blog/blogmain.webp"}
                                            alt={title || t("articleImageAlt", "White Bear article")}
                                            width={720}
                                            height={450}
                                            loading="lazy"
                                            decoding="async"
                                            onLoad={handleImageLoad}
                                            onError={handleImageError}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                                        />
                                    </div>

                                    <div className="p-5 sm:p-6">
                                        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                            <span className="inline-flex items-center gap-1.5 text-[#167ca8] dark:text-[#72d2f3]">
                                                <BookOpen size={14} />
                                                {t("articleLabel", "Article")}
                                            </span>
                                            {date && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <CalendarDays size={14} />
                                                    {date}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-semibold leading-7 text-[#0b2945] dark:text-white">
                                            {title}
                                        </h3>
                                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                            {text}
                                        </p>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </section>
        </main>
    )
}
