import { useUser } from "@clerk/react"
import {
    House,
    Heart,
    LayoutGrid,
    Menu,
    Search,
    ShoppingBag,
    User,
    X,
} from "lucide-react"
import { useEffect, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import {
    getStoredCartCount,
    readStoredArray,
    WISHLIST_STORAGE_KEY,
} from "@/lib/storage"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export const Navbar = () => {
    const { pathname, search } = useLocation()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [query, setQuery] = useState("")
    const [cartLength, setCartLength] = useState(0)
    const [wishlistLength, setWishlistLength] = useState(0)
    const { t } = useTranslation("common", { keyPrefix: "homepage" })
    const { isSignedIn, user, isLoaded } = useUser()
    const overlaysHero = pathname === "/" || pathname === "/about"

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 28)
        handleScroll()
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        setOpen(false)
        const params = new URLSearchParams(search)
        setQuery(pathname === "/shop" ? params.get("q") ?? "" : "")
    }, [pathname, search])

    useEffect(() => {
        const updateCartLength = () => setCartLength(getStoredCartCount())
        const updateWishlistLength = () =>
            setWishlistLength(readStoredArray(WISHLIST_STORAGE_KEY).length)
        const handleStorage = (event: StorageEvent) => {
            if (event.key === "cart") updateCartLength()
            if (event.key === WISHLIST_STORAGE_KEY) updateWishlistLength()
        }

        updateCartLength()
        updateWishlistLength()
        window.addEventListener("cart-update", updateCartLength)
        window.addEventListener("wishlist-update", updateWishlistLength)
        window.addEventListener("storage", handleStorage)

        return () => {
            window.removeEventListener("cart-update", updateCartLength)
            window.removeEventListener("wishlist-update", updateWishlistLength)
            window.removeEventListener("storage", handleStorage)
        }
    }, [])

    const handleSearch = (event: FormEvent) => {
        event.preventDefault()
        const nextQuery = query.trim()
        navigate(nextQuery ? `/shop?q=${encodeURIComponent(nextQuery)}` : "/shop")
        setOpen(false)
    }

    const items = [
        { name: t("home"), href: "/" },
        { name: t("shop"), href: "/shop" },
        { name: t("catalog"), href: "#", download: true },
        { name: t("blog"), href: "/blog" },
        { name: t("about"), href: "/about" },
        { name: t("contact"), href: "/contact" },
    ]

    const SearchForm = ({ mobile = false }: { mobile?: boolean }) => (
        <form
            onSubmit={handleSearch}
            className={`flex items-center overflow-hidden rounded-md border border-white/15 bg-white/[0.06] transition focus-within:border-[#ff8b38]/80 focus-within:bg-white/[0.09] ${mobile ? "w-full" : "w-[310px]"}`}
        >
            <Search className="ml-3 shrink-0 text-white/70" size={18} />
            <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                aria-label={t("search")}
                placeholder={t("search")}
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/55"
            />
            <button
                type="submit"
                className="h-11 bg-[#ED6D0E] px-4 text-sm font-semibold transition-colors hover:bg-[#d95e06]"
            >
                {t("search")}
            </button>
        </form>
    )

    return (
        <>
        <header
            className={`relative z-50 text-white transition-all duration-300 md:sticky md:top-0 ${
                overlaysHero ? "-mb-[72px]" : ""
            } ${
                overlaysHero && !scrolled
                    ? "border-b border-transparent bg-transparent shadow-none"
                    : "border-b border-white/10 bg-[#0b2945]/96 shadow-[0_8px_28px_rgba(2,14,24,0.16)] backdrop-blur-md"
            }`}
        >
            <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
                <Link to="/" className="shrink-0" aria-label="Whitebear">
                    <img src="/logo.webp" alt="Whitebear" width={420} height={168} decoding="async" className="h-auto w-32 lg:w-36" />
                </Link>

                <nav className="hidden xl:block" aria-label="Main navigation">
                    <ul className="flex items-center gap-5">
                        {items.map((item) => (
                            <li key={item.name}>
                                {item.download ? (
                                    <a
                                        href="/catalog/whitebear-lite.pdf"
                                        download="whitebear-catalog.pdf"
                                        className="flex h-[72px] items-center gap-1.5 border-b-2 border-transparent text-sm font-medium text-white/70 transition hover:text-[#F78A32]"
                                    >
                                        {item.name}
                                    </a>
                                ) : (
                                    <NavLink
                                        to={item.href}
                                        className={({ isActive }) =>
                                            `flex h-[72px] items-center border-b-2 text-sm font-medium transition hover:text-[#F78A32] ${
                                                isActive
                                                    ? "border-[#ff8b38] text-white"
                                                    : "border-transparent text-white/70"
                                            }`
                                        }
                                    >
                                        {item.name}
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="hidden items-center gap-2.5 xl:flex">
                    <SearchForm />
                    <ThemeToggle />
                    <IconLink to="/wishlist" label={t("footer.myAccount.wishlist")} count={wishlistLength}>
                        <Heart size={21} />
                    </IconLink>
                    <IconLink to="/cart" label={t("footer.myAccount.shoppingCart")} count={cartLength}>
                        <ShoppingBag size={21} />
                    </IconLink>
                    <Link
                        to={isSignedIn ? "/profile" : "/sign-in"}
                        aria-label={t("account")}
                        className="flex items-center gap-2 border-l border-white/15 pl-3"
                    >
                        {!isLoaded ? (
                            <span className="h-9 w-9 animate-pulse rounded-full bg-white/20" />
                        ) : isSignedIn ? (
                            <img
                                src={user?.imageUrl || "/logo.webp"}
                                alt=""
                                className="h-9 w-9 rounded-full border border-white/25 object-cover"
                            />
                        ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0B4C8C]">
                                <User size={20} />
                            </span>
                        )}
                        <span className="max-w-24 truncate text-sm font-semibold">
                            {isSignedIn ? user?.firstName || t("account") : t("account")}
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-2 xl:hidden">
                    <ThemeToggle />
                    <IconLink to="/cart" label={t("footer.myAccount.shoppingCart")} count={cartLength}>
                        <ShoppingBag size={22} />
                    </IconLink>
                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/5 transition hover:bg-white/10"
                    >
                        {open ? <X size={27} /> : <Menu size={27} />}
                    </button>
                </div>
            </div>

            {open && (
                <div className="absolute left-0 top-full w-full border-t border-white/10 bg-[#0b2945]/98 px-4 py-5 shadow-2xl backdrop-blur-md xl:hidden">
                    <div className="mx-auto max-w-[1600px]">
                        <SearchForm mobile />
                        <nav className="mt-5" aria-label="Mobile navigation">
                            <ul className="grid gap-1 sm:grid-cols-2">
                                {items.map((item) => (
                                    <li key={item.name}>
                                        {item.download ? (
                                            <a
                                                href="/catalog/whitebear-lite.pdf"
                                                download="whitebear-catalog.pdf"
                                                className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-left font-medium text-white/80 transition hover:bg-white/5"
                                            >
                                                {item.name}
                                            </a>
                                        ) : (
                                            <NavLink
                                                to={item.href}
                                                className={({ isActive }) =>
                                                    `block rounded-md px-3 py-3 font-medium transition ${
                                                        isActive
                                                            ? "bg-white/[0.07] text-[#F78A32]"
                                                            : "text-white/80 hover:bg-white/5"
                                                    }`
                                                }
                                            >
                                                {item.name}
                                            </NavLink>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <div className="mt-4 flex items-center gap-6 border-t border-white/15 pt-5">
                            <IconLink to="/wishlist" label={t("footer.myAccount.wishlist")} count={wishlistLength}>
                                <Heart size={21} />
                            </IconLink>
                            <Link
                                to={isSignedIn ? "/profile" : "/sign-in"}
                                className="flex items-center gap-2 font-semibold"
                            >
                                <User size={21} />
                                {isSignedIn ? user?.firstName || t("account") : t("account")}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
        <MobileDock
            cartLength={cartLength}
            wishlistLength={wishlistLength}
            isSignedIn={Boolean(isSignedIn)}
            labels={{
                home: t("home"),
                shop: t("shop"),
                wishlist: t("footer.myAccount.wishlist"),
                cart: t("footer.myAccount.shoppingCart"),
                account: t("account"),
            }}
        />
        </>
    )
}

function MobileDock({
    cartLength,
    wishlistLength,
    isSignedIn,
    labels,
}: {
    cartLength: number
    wishlistLength: number
    isSignedIn: boolean
    labels: {
        home: string
        shop: string
        wishlist: string
        cart: string
        account: string
    }
}) {
    const items = [
        { to: "/", label: labels.home, icon: House, count: 0 },
        { to: "/shop", label: labels.shop, icon: LayoutGrid, count: 0 },
        { to: "/wishlist", label: labels.wishlist, icon: Heart, count: wishlistLength },
        { to: "/cart", label: labels.cart, icon: ShoppingBag, count: cartLength },
        { to: isSignedIn ? "/profile" : "/sign-in", label: labels.account, icon: User, count: 0 },
    ]

    return (
        <nav
            aria-label="Mobile navigation"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/96 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-10px_28px_rgba(11,41,69,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-[#0d1720]/96 md:hidden"
        >
            <div className="mx-auto grid max-w-lg grid-cols-5">
                {items.map(({ to, label, icon: Icon, count }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/"}
                        aria-label={`${label}${count ? `: ${count}` : ""}`}
                        className={({ isActive }) =>
                            `relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] font-semibold transition ${
                                isActive
                                    ? "bg-[#e8f1f6] text-[#0b4c8c] dark:bg-white/[0.08] dark:text-[#ff8b38]"
                                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
                            }`
                        }
                    >
                        <Icon size={20} />
                        <span className="max-w-full truncate">{label}</span>
                        {count > 0 && (
                            <span className="absolute right-[18%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ed6d0e] px-1 text-[9px] font-bold text-white">
                                {count > 99 ? "99+" : count}
                            </span>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}

function IconLink({
    to,
    label,
    count,
    children,
}: {
    to: string
    label: string
    count: number
    children: ReactNode
}) {
    return (
        <Link
            to={to}
            aria-label={`${label}: ${count}`}
            className="relative flex h-10 w-10 items-center justify-center transition hover:text-[#F78A32]"
        >
            {children}
            {count > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ED6D0E] px-1 text-[10px] font-bold text-white">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    )
}
