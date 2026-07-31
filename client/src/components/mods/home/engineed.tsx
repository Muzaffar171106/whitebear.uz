"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpRight, CheckCircle2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export const Engineered = () => {
    const { t } = useTranslation("common", { keyPrefix: "homepage.engineered" })
    const title = t("title").replace(/\n/g, " ")
    const introduction = createExcerpt(t("description1"), 180)
    const featureOne = createExcerpt(t("description2"), 120)
    const featureTwo = createExcerpt(t("description3"), 120)

    return (
        <section className="bg-[#eef3f6] px-4 py-14 transition-colors dark:bg-[#0b1117] sm:px-6 sm:py-16 lg:px-8 lg:py-14">
            <div className="mx-auto max-w-[1600px]">
                <div className="grid overflow-hidden rounded-lg border border-[#0b2945]/15 bg-white/45 shadow-[0_14px_38px_rgba(11,41,69,0.07)] dark:border-white/15 dark:bg-[#111a23]/45 dark:shadow-black/20 lg:grid-cols-12">
                    <div className="flex flex-col justify-center px-5 py-10 sm:px-7 lg:col-span-5 lg:px-9 lg:py-8">
                        <p className="flex items-center gap-3 text-xs font-bold uppercase text-[#d95e06] dark:text-[#f78a32]">
                            <span className="h-0.5 w-10 bg-current" />
                            WhiteBear Engineering
                        </p>

                        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold uppercase leading-[1.08] text-[#0b2945] dark:text-white sm:text-4xl lg:text-5xl">
                            {title}
                        </h2>

                        <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                            {introduction}
                        </p>

                        <div className="mt-5 divide-y divide-[#0b2945]/15 border-y border-[#0b2945]/15 dark:divide-white/15 dark:border-white/15">
                            <Feature text={featureOne} />
                            <Feature text={featureTwo} />
                        </div>

                        <Button
                            asChild
                            className="mt-6 h-12 w-full justify-between rounded-md bg-[#ed6d0e] px-5 text-sm font-bold uppercase text-white shadow-[0_10px_24px_rgba(237,109,14,0.22)] hover:bg-[#d95e06] sm:w-52"
                        >
                            <Link to="/blog">
                                {t("button")}
                                <ArrowUpRight size={18} />
                            </Link>
                        </Button>
                    </div>

                    <figure className="relative min-h-[360px] bg-[#dce5eb] dark:bg-[#17232d] sm:min-h-[460px] lg:col-span-7 lg:min-h-[620px]">
                        <img
                            src="/engineed/1.webp"
                            alt="WhiteBear modern manufacturing"
                            width={585}
                            height={807}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                        <figcaption className="absolute inset-x-0 bottom-0 bg-[#071d31]/92 px-5 py-4 text-white sm:px-6">
                            <p className="text-xs font-bold uppercase text-[#f78a32]">
                                Precision manufacturing
                            </p>
                            <p className="mt-1 text-sm font-semibold sm:text-base">
                                Quality controlled at every production stage
                            </p>
                        </figcaption>
                    </figure>
                </div>
            </div>
        </section>
    )
}

const Feature = ({ text }: { text: string }) => (
    <div className="grid grid-cols-[20px_1fr] gap-3 py-4">
        <CheckCircle2
            size={18}
            className="mt-1 text-[#d95e06] dark:text-[#f78a32]"
        />
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            {text}
        </p>
    </div>
)

const createExcerpt = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text

    const clipped = text.slice(0, maxLength + 1)
    const lastSpace = clipped.lastIndexOf(" ")
    const end = lastSpace > maxLength * 0.7 ? lastSpace : maxLength
    return `${text.slice(0, end).trimEnd()}...`
}
