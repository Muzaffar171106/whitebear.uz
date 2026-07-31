"use client";
import { useTranslation } from "react-i18next"
import { ShowerHead, Home, Cog, Flame, Bath, Wrench } from "lucide-react"
export const Categories = () => {

    const { t } = useTranslation();

    const categories = [
        {
            icon: ShowerHead,
            title: t("faucets"),
            count: "240+",
        },
        {
            icon: Home,
            title: t("toilets"),
            count: "85+",
        },
        {
            icon: Cog,
            title: t("pumps"),
            count: "120+",
        },
        {
            icon: Flame,
            title: t("pipes"),
            count: "500+",
        },
        {
            icon: Flame,
            title: t("radiators"),
            count: "95+",
        },
        {
            icon: Bath,
            title: t("showers"),
            count: "180+",
        },
        {
            icon: Wrench,
            title: t("accessories"),
            count: "300+",
        },
        {
            icon: Wrench,
            title: t("accessories"),
            count: "300+",
        },
    ]

    return (
        <div className="bg-[#163555] md:px-[10%] px-[5%] pt-4 md:pt-10 pb-0 border-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 md:mb-10">

                <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold uppercase">
                  {t("categories")}
                </h2>

                <div className="
                    flex
                    md:hidden
                    items-center
                    gap-3
                    overflow-x-auto
                    scrollbar-none
                    pb-2
                ">
                    {categories.map((item, index) => (
                        <button
                            key={index}
                            className={`
                                flex
                                items-center
                                gap-2
                                whitespace-nowrap
                                px-4
                                md:px-6
                                py-2.5
                                md:py-3
                                rounded-full
                                font-semibold
                                text-sm
                                transition
                                bg-white text-[#14395B]
                            `}
                        >

                            {/* <span className="text-lg hidden md:block">
                                {item.icon}
                            </span> */}

                            <span>
                                {item.title}
                            </span>

                        </button>
                    ))}
                </div>

            </div>

            <div className="
                hidden
                md:grid
                grid-cols-8
                gap-4
            ">

                {categories.map((item, index) => {
                    const Icon = item.icon
                    return (
                        <div
                            key={index}
                            className="
                            bg-white
                            rounded-2xl
                            md:rounded-3xl
                            flex
                            flex-col
                            items-center
                            justify-center
                            text-center
                            cursor-pointer
                            h-28
                            sm:h-32
                            transition-all
                            duration-300
                            hover:scale-105
                            hover:bg-gray-100
                        "
                        >

                            <span className="text-3xl sm:text-4xl md:text-5xl mb-2 md:mb-3">
                                <Icon />
                            </span>

                            <h3 className="text-[#14395B] text-xs sm:text-sm font-semibold">
                                {item.title}
                            </h3>

                            <p className="text-[#14395B] text-xs sm:text-sm font-bold">
                                {item.count}
                            </p>

                        </div>
                    )
                })}

            </div>

        </div>
    )
}