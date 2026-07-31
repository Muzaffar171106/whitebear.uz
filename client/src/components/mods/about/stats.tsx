"use client"
import { Star, User } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Statistics = () => {

    const { t } = useTranslation("common", { keyPrefix: "statistics" })

    return (
        <section className="relative overflow-hidden bg-[#0F4B87] text-white px-[5%] mt-14 pb-6 md:pb-0">

            <div className="absolute left-0 top-0 opacity-80">
                <img
                    src="/45.svg"
                    alt="shape"
                    width={1000}
                    height={1000}
                    className="w-28"
                />
            </div>

            <div className="absolute right-0 top-0 opacity-60">
                <img
                    src="/44.svg"
                    alt="shape"
                    width={1000}
                    height={1000}
                    className="w-28"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 items-center">

                <div className="border-r-0 md:border-r-3 border-[#2c5f99] py-8 md:py-10  z-10">
                    <h2 className="text-xl md:text-3xl lg:text-5xl font-bold leading-tight md:leading-none max-w-full">
                        {t("title")}
                    </h2>
                </div>

                <div className="px-0 md:px-14">
                    <h3 className="text-4xl md:text-5xl font-bold text-[#F26419]">{t("users.value")}</h3>

                    <div className="mt-5 flex items-center gap-2 text-lg md:text-xl">
                        <User className="fill-lime-400 text-lime-400" size={20} />
                        <span className="text-white/90">{t("activeUsers")}</span>
                    </div>
                </div>

                <div className="px-0 md:px-14">
                    <h3 className="text-4xl md:text-5xl font-bold text-[#F26419]">{t("reviews.value")}</h3>

                    <div className="mt-5 flex items-center gap-2 text-lg md:text-xl">
                        <Star className="fill-lime-400 text-lime-400" size={20} />
                        <span className="text-white/90">{t("reviewsLabel")}</span>
                    </div>
                </div>

                <div className="px-0 md:px-14">
                    <h3 className="text-4xl md:text-5xl font-bold text-[#F26419]">{t("transactions.value")}</h3>

                    <div className="mt-5 flex items-center gap-2 text-lg md:text-xl">
                        <Star className="fill-lime-400 text-lime-400" size={20} />
                        <span className="text-white/90">{t("transactionsLabel")}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}