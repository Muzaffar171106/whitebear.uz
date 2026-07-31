"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/mods/home/header"
import { Navbar } from "@/components/mods/home/navbar"
import { useTranslation } from "react-i18next"
import Wishlist from "@/components/mods/wishlist/wishlist"
import { Footer } from "@/components/mods/home/footer"
import { resolveLanguage } from "@/lib/locale"
import {
    readStoredArray,
    WISHLIST_STORAGE_KEY,
    writeStoredArray,
} from "@/lib/storage"

interface Product {
    _id: string
    image: string
    category?: string

    title: {
        en: string
        uz: string
        ru: string
        ch: string
    }

    number: number
    sizes?: Array<{
        size: string
        stock: boolean
        package: string
        price: {
            usd: string;
            uzs: string;
            rub: string;
            yuan: string;
        }
    }>
}
export default function WishlistPage() {
    const { t, i18n } = useTranslation("common", {
        keyPrefix: "homepage",
    })

    const [wishlistItems, setWishlistItems] = useState<Product[]>([])

    const handleRemoveWishlist = (productId: string) => {
        const updatedWishlist = wishlistItems.filter(
            (item) => item._id !== productId
        )

        setWishlistItems(updatedWishlist)

        writeStoredArray(WISHLIST_STORAGE_KEY, updatedWishlist, "wishlist-update")
    }



    const currentLanguage = resolveLanguage(i18n.language)

    useEffect(() => {
        setWishlistItems(readStoredArray<Product>(WISHLIST_STORAGE_KEY))
    }, [])

    return (
        <div className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-[#0b1117] dark:text-white">
            <Header />
            <Navbar />

            <main className="px-0 ">
                <Wishlist
                    wishlistItems={wishlistItems}
                    currentLanguage={currentLanguage}
                    shopText={t("shop")}
                    titleText={t("footer.myAccount.wishlist")}
                    onRemoveWishlist={handleRemoveWishlist}
                />
            </main>
            <Footer />
        </div>
    )
}
