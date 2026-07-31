"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/mods/home/header"
import { Navbar } from "@/components/mods/home/navbar"
import { useTranslation } from "react-i18next"
import { Cart } from "@/components/mods/cart/cart"

interface Product {
    _id: string
    image: string
    title: {
        en: string
        uz: string
        ru: string
        ch: string
    }
    price?: number
    selectedSize?: {
        size: string
        package: string
        price: {
            usd: string
            uzs: string
            rub: string
            yuan: string
        }
        stock: boolean
    } | null
    quantity?: number
}

export default function CartPage() {
    const { t, i18n } = useTranslation("common", {
        keyPrefix: "homepage"
    })

    const [cartItems, setCartItems] = useState<Product[]>([])

    const currentLanguage = i18n.language === "ru" ? "ru" : i18n.language === "uz" ? "uz" : i18n.language === "ch" ? "ch" : "en"

    const readCart = () => {
        if (typeof window === "undefined") return

        try {
            const stored = window.localStorage.getItem("cart")
            const nextItems = stored ? (JSON.parse(stored) as Product[]) : []
            setCartItems(Array.isArray(nextItems) ? nextItems : [])
        } catch {
            setCartItems([])
        }
    }

    useEffect(() => {
        readCart()

        const handleCartUpdate = () => {
            readCart()
        }

        window.addEventListener("cart-update", handleCartUpdate)

        return () => {
            window.removeEventListener("cart-update", handleCartUpdate)
        }
    }, [])

    return (
        <div className="min-h-screen bg-[#f3f6f8] text-[#0b2945] transition-colors dark:bg-[#0b1117] dark:text-white">
            <Header />
            <Navbar />
            <Cart
                cartItems={cartItems}
                currentLanguage={currentLanguage}
                t={t}
            />
        </div>
    )
}
