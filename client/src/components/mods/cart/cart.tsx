"use client"

import { Input } from "@/components/ui/input"
import { Fetch } from "@/middlewares/Fetch"
import {
    CART_STORAGE_KEY,
    writeStoredArray,
} from "@/lib/storage"
import { useUser } from "@clerk/react"
import { isAxiosError } from "axios"
import {
    Banknote,
    CheckCircle2,
    ChevronLeft,
    CreditCard,
    MapPin,
    Minus,
    PackageCheck,
    Plus,
    ShieldCheck,
    Store,
    Trash2,
    Truck,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { TFunction } from "i18next"
import { Link } from "react-router-dom"
import { toast } from "sonner"

interface SelectedSize {
    size: string
    package: string
    price: {
        usd: string
        uzs: string
        rub: string
        yuan: string
    }
    stock: boolean
}

interface Product {
    _id: string
    image: string
    number?: number
    title: {
        en: string
        uz: string
        ru: string
        ch: string
    }
    price?: number
    stock?: boolean
    selectedSize?: SelectedSize | null
    quantity?: number
}

interface CartContentProps {
    cartItems: Product[]
    currentLanguage: "en" | "uz" | "ru" | "ch"
    t: TFunction
}

interface OrderConfirmation {
    orderId: string
    total: number
}

const getCartItemKey = (item: Product) => {
    const sizeKey = item.selectedSize
        ? `${item.selectedSize.size}-${item.selectedSize.package}`
        : "default"

    return `${item._id}-${sizeKey}`
}

const getItemPrice = (item: Product, currency: string) => {
    const currencyKey = currency.toLowerCase() as keyof SelectedSize["price"]
    const rawPrice = item.selectedSize?.price?.[currencyKey] ?? item.price
    const price = Number(rawPrice)

    return Number.isFinite(price) && price > 0 ? price : null
}

const getItemStock = (item: Product) =>
    item.selectedSize?.stock ?? item.stock ?? true

const normalizeQuantity = (value: number) =>
    Number.isFinite(value) ? Math.min(999, Math.max(1, Math.floor(value))) : 1

export const Cart = ({
    cartItems,
    currentLanguage,
    t,
}: CartContentProps) => {
    const { user, isSignedIn } = useUser()
    const currency = "USD"
    const [paymentType, setPaymentType] = useState<"cash" | "card">("cash")
    const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup")
    const [customerName, setCustomerName] = useState("")
    const [customerEmail, setCustomerEmail] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [customerLocation, setCustomerLocation] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null)
    const [quantities, setQuantities] = useState<Record<string, number>>({})
    const [localCartItems, setLocalCartItems] = useState<Product[]>(cartItems)

    useEffect(() => {
        setLocalCartItems(cartItems)
    }, [cartItems])

    useEffect(() => {
        const signedInEmail = user?.emailAddresses?.[0]?.emailAddress
        if (signedInEmail && !customerEmail) setCustomerEmail(signedInEmail)
    }, [customerEmail, user])

    useEffect(() => {
        setQuantities((current) => {
            const next: Record<string, number> = {}
            localCartItems.forEach((item) => {
                const key = getCartItemKey(item)
                next[key] = current[key] ?? normalizeQuantity(item.quantity ?? 1)
            })
            return next
        })
    }, [localCartItems])

    const totalPrice = useMemo(
        () =>
            localCartItems.reduce((sum, item) => {
                const key = getCartItemKey(item)
                const price = getItemPrice(item, currency) ?? 0
                return sum + price * (quantities[key] ?? item.quantity ?? 1)
            }, 0),
        [localCartItems, quantities]
    )

    const hasOutOfStock = useMemo(
        () => localCartItems.some((item) => getItemStock(item) === false),
        [localCartItems]
    )

    const hasInvalidPrice = useMemo(
        () => localCartItems.some((item) => getItemPrice(item, currency) === null),
        [localCartItems]
    )

    const persistCart = (updatedItems: Product[]) => {
        setLocalCartItems(updatedItems)
        writeStoredArray(CART_STORAGE_KEY, updatedItems, "cart-update")
    }

    const updateQuantity = (product: Product, nextQuantity: number) => {
        const key = getCartItemKey(product)
        const safeQuantity = normalizeQuantity(nextQuantity)

        setQuantities((previous) => ({
            ...previous,
            [key]: safeQuantity,
        }))
        persistCart(
            localCartItems.map((item) =>
                getCartItemKey(item) === key
                    ? { ...item, quantity: safeQuantity }
                    : item
            )
        )
    }

    const removeCartItem = (product: Product) => {
        persistCart(
            localCartItems.filter(
                (item) => getCartItemKey(item) !== getCartItemKey(product)
            )
        )
    }

    const validateCheckout = () => {
        const nextErrors: Record<string, string> = {}
        const digits = customerPhone.replace(/\D/g, "")

        if (!customerName.trim()) nextErrors.name = t("cart.nameRequired")
        if (digits.length < 9) nextErrors.phone = t("cart.phoneInvalid")
        if (
            customerEmail.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
        ) {
            nextErrors.email = t("cart.emailInvalid")
        }
        if (deliveryType === "delivery" && !customerLocation.trim()) {
            nextErrors.location = t("cart.addressRequired")
        }

        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const createOrder = async () => {
        if (
            localCartItems.length === 0 ||
            hasOutOfStock ||
            hasInvalidPrice ||
            !validateCheckout()
        ) {
            return
        }

        try {
            setIsLoading(true)
            const phoneDigits = customerPhone.replace(/\D/g, "")
            const submittedEmail =
                customerEmail.trim() ||
                `guest-${phoneDigits}@guest.whitebear.local`

            const response = await Fetch.post("/order", {
                products: localCartItems.map((product) => ({
                    _id: product._id,
                    product_id: product._id,
                    quantity:
                        quantities[getCartItemKey(product)] ??
                        normalizeQuantity(product.quantity ?? 1),
                    price: getItemPrice(product, currency),
                    size: product.selectedSize?.size ?? "",
                    package: product.selectedSize?.package ?? "",
                    number: String(product.number ?? ""),
                })),
                total_price: Number(totalPrice.toFixed(2)),
                customer: {
                    name: customerName.trim(),
                    email: submittedEmail,
                    phone: customerPhone.trim(),
                    address:
                        deliveryType === "delivery"
                            ? customerLocation.trim()
                            : "Pickup",
                },
                payment: paymentType,
                driver: deliveryType === "delivery",
            })

            const order = response.data?.order ?? response.data
            setOrderConfirmation({
                orderId: order?.order_id || "",
                total: Number(order?.total_price ?? totalPrice),
            })
            persistCart([])
            setCustomerName("")
            setCustomerPhone("")
            setCustomerLocation("")
            setErrors({})
            toast.success(t("cart.orderSuccess"))
        } catch (error) {
            const message = isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message
                : null
            toast.error(message || t("cart.orderFailed"))
        } finally {
            setIsLoading(false)
        }
    }

    if (localCartItems.length === 0) {
        return (
            <main className="min-h-[calc(100vh-116px)] bg-[#f3f6f8] px-4 py-16 transition-colors dark:bg-[#0f171f] sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_12px_34px_rgba(11,41,69,0.08)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/25 sm:px-12">
                    {orderConfirmation ? (
                        <>
                            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
                            <p className="mt-6 text-xs font-bold uppercase text-[#ed6d0e]">
                                {t("cart.orderNumber")}
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-[#0b2945] dark:text-white sm:text-4xl">
                                {orderConfirmation.orderId}
                            </h1>
                            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">
                                {t("cart.orderConfirmation")}
                            </p>
                            <p className="mt-5 text-lg font-bold text-[#0b4c8c] dark:text-[#f78a32]">
                                {orderConfirmation.total.toLocaleString("uz-UZ")} {currency}
                            </p>
                        </>
                    ) : (
                        <>
                            <PackageCheck className="mx-auto h-14 w-14 text-[#0b4c8c] dark:text-[#f78a32]" />
                            <h1 className="mt-6 text-3xl font-bold text-[#0b2945] dark:text-white">
                                {t("cart.empty")}
                            </h1>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                                {t("cart.emptyDescription")}
                            </p>
                        </>
                    )}

                    <Link
                        to="/shop"
                        className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-[#ed6d0e] px-6 text-sm font-bold uppercase text-white shadow-[0_10px_24px_rgba(237,109,14,0.22)] transition hover:bg-[#d95e06]"
                    >
                        {t("cart.continueShopping")}
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-[calc(100vh-116px)] bg-[#f3f6f8] px-4 py-10 transition-colors dark:bg-[#0f171f] sm:px-6 lg:px-8 lg:py-14">
            <div className="mx-auto max-w-[1440px]">
                <div className="mb-8 flex flex-col gap-3 border-b border-slate-300 pb-6 dark:border-white/15 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase text-[#ed6d0e]">
                            WhiteBear Checkout
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-[#0b2945] dark:text-white sm:text-4xl">
                            {t("cart.shoppingCart")}
                        </h1>
                    </div>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b4c8c] hover:text-[#ed6d0e] dark:text-[#f78a32]"
                    >
                        <ChevronLeft size={18} />
                        {t("cart.returnToShop")}
                    </Link>
                </div>

                <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
                    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_10px_30px_rgba(11,41,69,0.07)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/20">
                        <div className="hidden grid-cols-[minmax(280px,1fr)_120px_150px_140px] gap-5 border-b bg-[#0b2945] px-6 py-4 text-xs font-bold uppercase text-white lg:grid">
                            <span>{t("cart.products")}</span>
                            <span>{t("cart.price")}</span>
                            <span>{t("cart.quantity")}</span>
                            <span>{t("cart.subTotal")}</span>
                        </div>

                        {localCartItems.map((product) => {
                            const key = getCartItemKey(product)
                            const itemQuantity =
                                quantities[key] ?? normalizeQuantity(product.quantity ?? 1)
                            const itemPrice = getItemPrice(product, currency)
                            const itemStock = getItemStock(product)

                            return (
                                <article
                                    key={key}
                                    className="grid gap-5 border-b border-slate-200 p-5 last:border-b-0 dark:border-white/10 lg:grid-cols-[minmax(280px,1fr)_120px_150px_140px] lg:items-center lg:px-6"
                                >
                                    <div className="flex min-w-0 gap-4">
                                        <Link
                                            to={`/shop/${product._id}`}
                                            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md bg-[#f3f6f8] p-2"
                                        >
                                            <img
                                                src={product.image}
                                                alt={product.title[currentLanguage]}
                                                width={96}
                                                height={96}
                                                className="h-full w-full object-contain"
                                            />
                                        </Link>
                                        <div className="min-w-0 py-1">
                                            <Link
                                                to={`/shop/${product._id}`}
                                                className="line-clamp-2 font-semibold text-[#0b2945] hover:text-[#0b4c8c] dark:text-white dark:hover:text-[#f78a32]"
                                            >
                                                {product.title[currentLanguage]}
                                            </Link>
                                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                {product.selectedSize?.size || t("cart.defaultSize")}
                                                {product.selectedSize?.package
                                                    ? ` / ${product.selectedSize.package}`
                                                    : ""}
                                            </p>
                                            <p
                                                className={`mt-2 text-xs font-bold ${
                                                    itemStock === false
                                                        ? "text-red-600"
                                                        : "text-emerald-700"
                                                }`}
                                            >
                                                {itemStock === false
                                                    ? t("cart.outOfStock")
                                                    : t("cart.inStock")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between lg:block">
                                        <span className="text-xs font-bold uppercase text-slate-400 lg:hidden">
                                            {t("cart.price")}
                                        </span>
                                        <span className="font-bold text-[#0b2945] dark:text-white">
                                            {itemPrice === null
                                                ? t("priceOnRequest")
                                                : `${itemPrice.toLocaleString("uz-UZ")} ${currency}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between lg:block">
                                        <span className="text-xs font-bold uppercase text-slate-400 lg:hidden">
                                            {t("cart.quantity")}
                                        </span>
                                        <div className="grid h-11 w-32 grid-cols-[40px_1fr_40px] overflow-hidden rounded-md border border-slate-300 dark:border-white/15">
                                            <button
                                                type="button"
                                                aria-label="Decrease quantity"
                                                onClick={() =>
                                                    updateQuantity(product, itemQuantity - 1)
                                                }
                                                disabled={itemStock === false || itemQuantity <= 1}
                                                className="flex items-center justify-center text-[#0b2945] disabled:opacity-30 dark:text-white"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <input
                                                type="number"
                                                min={1}
                                                max={999}
                                                value={itemQuantity}
                                                onChange={(event) =>
                                                    updateQuantity(
                                                        product,
                                                        Number(event.target.value)
                                                    )
                                                }
                                                disabled={itemStock === false}
                                                className="min-w-0 border-x border-y-0 border-slate-300 bg-white text-center text-sm font-semibold text-[#0b2945] outline-none dark:border-white/15 dark:bg-[#111a23] dark:text-white"
                                            />
                                            <button
                                                type="button"
                                                aria-label="Increase quantity"
                                                onClick={() =>
                                                    updateQuantity(product, itemQuantity + 1)
                                                }
                                                disabled={itemStock === false || itemQuantity >= 999}
                                                className="flex items-center justify-center text-[#0b2945] disabled:opacity-30 dark:text-white"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <span className="text-xs font-bold uppercase text-slate-400 lg:hidden">
                                                {t("cart.subTotal")}
                                            </span>
                                            <p className="font-bold text-[#0b4c8c] dark:text-[#f78a32]">
                                                {itemPrice === null
                                                    ? "-"
                                                    : `${(
                                                        itemPrice * itemQuantity
                                                    ).toLocaleString("uz-UZ")} ${currency}`}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeCartItem(product)}
                                            aria-label="Remove product"
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:text-slate-400 dark:hover:bg-red-500/10"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </article>
                            )
                        })}
                    </section>

                    <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_10px_30px_rgba(11,41,69,0.07)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/20 xl:sticky xl:top-5">
                        <div className="border-b border-slate-200 px-6 py-5 dark:border-white/10">
                            <h2 className="text-xl font-bold text-[#0b2945] dark:text-white">
                                {t("cart.checkoutDetails")}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {t("cart.guestCheckout")}
                            </p>
                        </div>

                        <div className="space-y-5 p-6">
                            <Field
                                label={t("cart.name")}
                                error={errors.name}
                            >
                                <Input
                                    type="text"
                                    value={customerName}
                                    onChange={(event) => setCustomerName(event.target.value)}
                                    autoComplete="name"
                                    className="mt-2 h-11 rounded-md border-slate-300 dark:border-white/15"
                                />
                            </Field>

                            <Field
                                label={t("cart.phone")}
                                error={errors.phone}
                            >
                                <Input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(event) => setCustomerPhone(event.target.value)}
                                    placeholder="+998 90 123 45 67"
                                    autoComplete="tel"
                                    className="mt-2 h-11 rounded-md border-slate-300 dark:border-white/15"
                                />
                            </Field>

                            <Field
                                label={`${t("cart.email")} (${t("cart.optional")})`}
                                error={errors.email}
                            >
                                <Input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(event) => setCustomerEmail(event.target.value)}
                                    autoComplete="email"
                                    className="mt-2 h-11 rounded-md border-slate-300 dark:border-white/15"
                                />
                            </Field>

                            <div>
                                <p className="text-sm font-semibold text-[#0b2945] dark:text-white">
                                    {t("cart.deliveryMethod")}
                                </p>
                                <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-md border border-slate-300 dark:border-white/15">
                                    <ModeButton
                                        active={deliveryType === "pickup"}
                                        onClick={() => setDeliveryType("pickup")}
                                        icon={<Store size={17} />}
                                    >
                                        {t("cart.pickup")}
                                    </ModeButton>
                                    <ModeButton
                                        active={deliveryType === "delivery"}
                                        onClick={() => setDeliveryType("delivery")}
                                        icon={<Truck size={17} />}
                                    >
                                        {t("cart.delivery")}
                                    </ModeButton>
                                </div>
                            </div>

                            {deliveryType === "delivery" && (
                                <Field
                                    label={t("cart.location")}
                                    error={errors.location}
                                >
                                    <div className="relative mt-2">
                                        <MapPin
                                            size={17}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <Input
                                            type="text"
                                            value={customerLocation}
                                            onChange={(event) =>
                                                setCustomerLocation(event.target.value)
                                            }
                                            autoComplete="street-address"
                                            className="h-11 rounded-md border-slate-300 pl-10 dark:border-white/15"
                                        />
                                    </div>
                                </Field>
                            )}

                            <div>
                                <p className="text-sm font-semibold text-[#0b2945] dark:text-white">
                                    {t("cart.paymentMethod")}
                                </p>
                                <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-md border border-slate-300 dark:border-white/15">
                                    <ModeButton
                                        active={paymentType === "cash"}
                                        onClick={() => setPaymentType("cash")}
                                        icon={<Banknote size={17} />}
                                    >
                                        {t("cart.cash")}
                                    </ModeButton>
                                    <ModeButton
                                        active={paymentType === "card"}
                                        onClick={() => setPaymentType("card")}
                                        icon={<CreditCard size={17} />}
                                    >
                                        {t("cart.card")}
                                    </ModeButton>
                                </div>
                            </div>

                            {isSignedIn && customerEmail && (
                                <p className="text-xs text-emerald-700">
                                    {t("cart.signedInAs")} {customerEmail}
                                </p>
                            )}
                        </div>

                        <div className="border-t border-slate-200 bg-[#f7f9fa] p-6 dark:border-white/10 dark:bg-[#0f171f]">
                            <h2 className="font-bold text-[#0b2945] dark:text-white">
                                {t("cart.orderSummary")}
                            </h2>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>{t("cart.subTotal")}</span>
                                    <span>{totalPrice.toLocaleString("uz-UZ")} {currency}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>{t("cart.shipping")}</span>
                                    <span>{t("cart.free")}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-300 pt-4 text-lg font-bold text-[#0b2945] dark:border-white/15 dark:text-white">
                                    <span>{t("cart.total")}</span>
                                    <span>{totalPrice.toLocaleString("uz-UZ")} {currency}</span>
                                </div>
                            </div>

                            {(hasOutOfStock || hasInvalidPrice) && (
                                <p className="mt-4 border-l-4 border-red-500 bg-red-50 p-3 text-xs font-semibold text-red-700">
                                    {hasOutOfStock
                                        ? t("cart.removeOutOfStock")
                                        : t("cart.invalidPrice")}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={createOrder}
                                disabled={isLoading || hasOutOfStock || hasInvalidPrice}
                                className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-md bg-[#ed6d0e] px-5 text-sm font-bold uppercase text-white shadow-[0_10px_24px_rgba(237,109,14,0.22)] transition hover:bg-[#d95e06] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
                            >
                                <ShieldCheck size={19} />
                                {isLoading
                                    ? t("cart.creatingOrder")
                                    : t("cart.proceedToCheckout")}
                            </button>
                            <p className="mt-3 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                                {t("cart.securePricing")}
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    )
}

const Field = ({
    label,
    error,
    children,
}: {
    label: string
    error?: string
    children: ReactNode
}) => (
    <label className="block">
        <span className="text-sm font-semibold text-[#0b2945] dark:text-white">{label}</span>
        {children}
        {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
)

const ModeButton = ({
    active,
    onClick,
    icon,
    children,
}: {
    active: boolean
    onClick: () => void
    icon: ReactNode
    children: ReactNode
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex min-h-11 items-center justify-center gap-2 px-3 text-sm font-semibold transition ${
            active
                ? "bg-[#0b4c8c] text-white dark:bg-[#1595c8]"
                : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-[#111a23] dark:text-slate-300 dark:hover:bg-white/10"
        }`}
    >
        {icon}
        {children}
    </button>
)
