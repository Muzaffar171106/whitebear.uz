"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function NotFound() {

    const { t } = useTranslation();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted)
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#f3f6f8] dark:bg-[#07131e]">
                <img src="/loading.svg" alt="Logo" width={250} height={200} />
            </div>
        );


    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f3f6f8] px-6 text-center transition-colors dark:bg-[#07131e]">
            <div className="relative flex items-center justify-center">
                <img
                    src="/not-found.png"
                    alt="Not Found"
                    width={300}
                    height={300}
                    className="w-64 h-64 md:w-100 md:h-100 object-contain"
                />
            </div>

            <h2 className="mt-6 text-3xl font-bold text-[#0b2945] dark:text-white md:text-4xl">
                {t("notFoundTitle")}
            </h2>

            <p className="mt-4 max-w-md text-sm text-slate-600 dark:text-slate-300 md:text-base">
                {t("notFoundDescription")}
            </p>

            <a
                href="/"
                className="mt-8 rounded-lg bg-[#0b4c8c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#083b6d] dark:bg-[#1595c8] dark:hover:bg-[#1ca4d8]"
            >
                {t("backToHome")}
            </a>
        </div>
    );
}
