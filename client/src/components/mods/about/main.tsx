"use client"

import { ArrowDown } from "lucide-react"
import { useTranslation } from "react-i18next"

export const Main = () => {
    const { t } = useTranslation("common", { keyPrefix: "aboutpages" })

    return (
        <section className="relative h-[min(680px,calc(100svh-145px))] min-h-[520px] overflow-hidden bg-[#071d31]">
            <picture>
                <source media="(max-width: 767px)" srcSet="/about/main2-mobile.webp" />
                <img
                    src="/about/main2.webp"
                    alt="WhiteBear manufacturing and engineering"
                    width={1600}
                    height={805}
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />
            </picture>

            <div className="absolute inset-0 bg-[#071d31]/72" />

            <div className="relative z-10 mx-auto flex h-full max-w-[1600px] items-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl">
                    <div className="mb-5 flex items-center gap-3">
                        <span className="h-0.5 w-10 bg-[#ed6d0e]" />
                        <span className="text-xs font-bold uppercase text-white/75">
                            WhiteBear Company
                        </span>
                    </div>

                    <h1 className="whitespace-pre-line text-4xl font-extrabold uppercase leading-[1.04] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                        {t("title1")}
                        <br />
                        {t("title2")}
                    </h1>

                    <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-white/80 sm:text-lg">
                        {t("description")}
                    </p>

                    <a
                        href="#company-background"
                        className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-[#ed6d0e] px-6 text-sm font-bold uppercase text-white shadow-[0_10px_28px_rgba(237,109,14,0.24)] transition hover:bg-[#d95e06]"
                    >
                        {t("button")}
                        <ArrowDown size={18} />
                    </a>
                </div>
            </div>
        </section>
    )
}
