"use client"
import { Separator } from "@/components/ui/separator"
import { LanguageSelect } from "@/langs/language"
import { useClerk, useUser } from "@clerk/react"
import { MapPin } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export const Header = () => {

    const { t } = useTranslation("common", { keyPrefix: "homepage.header" })
    const { isSignedIn, isLoaded } = useUser()
    const { signOut } = useClerk()
    return (
        <div className="bg-[#061724] text-white/70">
            <div className="mx-auto flex h-9 max-w-[1600px] items-center justify-between px-4 text-xs font-medium sm:px-6 md:text-sm lg:px-8">
                <p className="flex min-w-0 items-center gap-1.5">
                    <MapPin size={15} className="shrink-0 text-[#ff8b38]" />
                    <span className="hidden md:block">{t("location")}:</span>
                    <span className="truncate">{t("place")}</span>
                </p>
                <div className="flex items-center gap-2.5">
                    <LanguageSelect />
                    <span className="hidden sm:inline">USD</span>
                    <Separator orientation="vertical" className="hidden h-4 bg-white/15 sm:block" />
                    {
                        isSignedIn && isLoaded ? (
                            <button onClick={() => signOut()} className="cursor-pointer text-[#ff8b38] transition hover:text-white">
                                {t("sign-out")}
                            </button>
                        ) : (
                            <div className="hidden items-center gap-1 sm:flex">
                                <Link to="/sign-in" className="transition hover:text-white">
                                    {t("sign-in")}
                                </Link>
                                /
                                <Link to="/sign-up" className="transition hover:text-white">
                                    {t("sign-up")}
                                </Link>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}
