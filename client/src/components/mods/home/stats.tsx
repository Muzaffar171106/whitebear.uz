"use client"

import { Flame, Pipette, Settings2 } from "lucide-react"
import { useTranslation } from "react-i18next"

export const Statistics = () => {
    const { t } = useTranslation("common", {
        keyPrefix: "homepage.statistics",
    })

    const systems = [
        {
            code: "PPR",
            label: t("activeUsers"),
            icon: Pipette,
        },
        {
            code: "BRASS",
            label: t("reviews"),
            icon: Settings2,
        },
        {
            code: "HVAC",
            label: t("transactions"),
            icon: Flame,
        },
    ]

    return (
        <section className="bg-white px-4 py-12 transition-colors dark:bg-[#0d1d29] sm:px-6 lg:px-8 lg:py-16">
            <div className="mx-auto max-w-[1600px]">
                <div className="grid gap-8 border-y border-slate-200 py-8 dark:border-white/10 lg:grid-cols-[1.15fr_2fr] lg:items-center">
                    <div className="lg:border-r lg:border-slate-200 lg:pr-12 dark:lg:border-white/10">
                        <p className="text-xs font-bold uppercase text-[#ed6d0e]">
                            WhiteBear Product Architecture
                        </p>
                        <h2 className="mt-3 max-w-xl whitespace-pre-line text-3xl font-bold leading-tight text-[#0b2945] dark:text-white sm:text-4xl">
                            {t("title")}
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {systems.map(({ code, label, icon: Icon }) => (
                            <div
                                key={code}
                                className="border-l-4 border-[#0b4c8c] bg-[#f3f6f8] px-5 py-6 dark:border-[#55c7ef] dark:bg-[#122432]"
                            >
                                <Icon size={22} className="text-[#ed6d0e]" />
                                <p className="mt-5 text-2xl font-extrabold text-[#0b2945] dark:text-white">
                                    {code}
                                </p>
                                <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                                    {label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
