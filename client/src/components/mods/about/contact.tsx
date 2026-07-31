"use client"

import { useTranslation } from "react-i18next"

const sections = [
    {
        image: "/about/factory.webp",
        alt: "WhiteBear factory",
        textKey: "section1.desc",
        reverse: false,
    },
    {
        image: "/about/whitebearsmall.webp",
        alt: "WhiteBear products",
        textKey: "section2.desc",
        reverse: true,
    },
    {
        image: "/about/production.webp",
        alt: "WhiteBear production",
        textKey: "section3.desc",
        reverse: false,
    },
] as const

export const Contact = () => {
    const { t } = useTranslation("common")

    return (
        <section
            id="company-background"
            className="scroll-mt-6 bg-[#f3f6f8] px-4 py-14 transition-colors dark:bg-[#0f171f] sm:px-6 lg:px-8 lg:py-20"
        >
            <div className="mx-auto max-w-[1600px]">
                <div className="mb-12 border-b border-slate-300 pb-7 dark:border-white/15">
                    <p className="text-xs font-bold uppercase text-[#ed6d0e]">
                        WhiteBear
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold uppercase text-[#0b2945] dark:text-white sm:text-4xl lg:text-5xl">
                        {t("aboutpages.button")}
                    </h2>
                </div>

                <div className="divide-y divide-slate-300 border-y border-slate-300 dark:divide-white/15 dark:border-white/15">
                    {sections.map((section, index) => (
                        <article
                            key={section.image}
                            className="grid items-center gap-8 py-10 lg:grid-cols-2 lg:gap-16 lg:py-14"
                        >
                            <div
                                className={`overflow-hidden rounded-lg bg-white shadow-[0_12px_32px_rgba(11,41,69,0.08)] dark:bg-[#111a23] dark:shadow-black/25 ${
                                    section.reverse ? "lg:order-2" : ""
                                }`}
                            >
                                <img
                                    src={section.image}
                                    alt={section.alt}
                                    width={760}
                                    height={520}
                                    loading="lazy"
                                    decoding="async"
                                    className="aspect-[4/3] w-full object-cover"
                                />
                            </div>

                            <div className={section.reverse ? "lg:order-1" : ""}>
                                <p className="text-xs font-bold uppercase text-[#0b4c8c] dark:text-[#f78a32]">
                                    0{index + 1}
                                </p>
                                <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-slate-700 dark:text-slate-300 sm:text-lg lg:text-xl">
                                    {t(section.textKey)}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
