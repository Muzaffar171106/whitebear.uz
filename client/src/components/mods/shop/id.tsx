import { Heart, Minus, Plus, Share2, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Fetch } from "@/middlewares/Fetch";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { resolveLanguage } from "@/lib/locale";
import {
    CART_STORAGE_KEY,
    readStoredArray,
    WISHLIST_STORAGE_KEY,
    writeStoredArray,
} from "@/lib/storage";
import { getPreferredSize, getSizePrice } from "@/lib/product";
const getSizeKey = (item?: { size: string; package: string } | null) =>
    item ? `${item.size}-${item.package}` : "default";

interface Product {
    _id: string;
    image: string;
    images?: string[];
    category?: string;

    title: {
        en: string;
        uz: string;
        ru: string;
        ch: string;
    };

    number: number;
    sizes?: Array<{
        size: string;
        price: {
            usd: string;
            uzs: string;
            rub: string;
            yuan: string;
        }
        stock: boolean;
        package: string;
    }>;
}

interface CartItem extends Product {
    selectedSize: NonNullable<Product["sizes"]>[number] | null;
    quantity: number;
}

function ProductSkeleton() {


    return (
        <div className="container mx-auto px-4 py-10" role="status" aria-label="Loading product">
            <div className="grid lg:grid-cols-2 gap-10">
                <div>
                    <div className="premium-skeleton h-[450px] rounded-lg" />

                    <div className="flex gap-3 mt-5">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div
                                key={item}
                                className="premium-skeleton h-24 w-24 rounded-lg"
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <div className="premium-skeleton mb-4 h-6 w-32 rounded-md" />
                    <div className="premium-skeleton mb-6 h-12 w-72 max-w-full rounded-lg" />

                    <div className="space-y-3">
                        <div className="premium-skeleton h-5 w-48 rounded-md" />
                        <div className="premium-skeleton h-5 w-56 rounded-md" />
                        <div className="premium-skeleton h-5 w-44 rounded-md" />
                        <div className="premium-skeleton h-5 w-60 rounded-md" />
                    </div>

                    <div className="premium-skeleton mt-8 h-12 w-40 rounded-lg" />

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="premium-skeleton h-12 rounded-lg" />
                        <div className="premium-skeleton h-12 rounded-lg" />
                    </div>

                    <div className="flex gap-4 mt-8">
                        <div className="premium-skeleton h-12 w-32 rounded-lg" />
                        <div className="premium-skeleton h-12 w-40 rounded-lg" />
                        <div className="h-12 w-40 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export const Detail = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const { i18n, t } = useTranslation("common", {
        keyPrefix: "ProductDetail",
    });
    const currency = "USD"
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedSize, setSelectedSize] = useState<null | {
        size: string;
        package: string;
        price: {
            usd: string;
            uzs: string;
            rub: string;
            yuan: string;
        };
        stock: boolean;
    }>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<Product[]>([]);

    const fetcher = (url: string) =>
        Fetch.get(url).then((res) => res.data);

    const product = useSWR(`/product/${id}`, fetcher);

    const sameCategoryProducts = useSWR(
        product.data?.category
            ? `/product?page=1&limit=10&category=${encodeURIComponent(product.data.category)}`
            : null,
        fetcher
    );
    const data = product.data as Product;
    const relatedProducts = useMemo(
        () =>
            (sameCategoryProducts.data?.products ?? []).filter(
                (item: Product) => item._id !== data?._id
            ),
        [data?._id, sameCategoryProducts.data?.products]
    );

    const currentTitle = useMemo(() => {
        if (!data) return "";

        return data.title?.[resolveLanguage(i18n.language)] ?? data.title?.en;
    }, [data, i18n.language]);
    const currentLanguage = useMemo(
        () => resolveLanguage(i18n.language),
        [i18n.language]
    );

    useEffect(() => {
        setCart(readStoredArray(CART_STORAGE_KEY));
        setWishlist(readStoredArray<Product>(WISHLIST_STORAGE_KEY));
    }, []);

    useEffect(() => {
        setSelectedSize(getPreferredSize(data?.sizes));
        setSelectedImage(data?.image || "");
        setQuantity(1);
    }, [data?._id, data?.image, data?.sizes]);

    const isInWishlist = (productId: string) =>
        wishlist.some((item) => item._id === productId);

    const handleCart = () => {
        if (!data) return false;

        const fallbackSize = getPreferredSize(data.sizes);
        const selectedItemSize = selectedSize ?? fallbackSize;
        if (selectedItemSize?.stock === false) {
            toast.error(t("outOfStock", { defaultValue: "Out of stock" }));
            return false;
        }

        if (getSizePrice(selectedItemSize) === null) {
            toast.error(t("priceOnRequest"));
            return false;
        }

        const existingIndex = cart.findIndex(
            (item) =>
                item._id === data._id &&
                (!data.sizes || !data.sizes.length || getSizeKey(item.selectedSize) === getSizeKey(selectedItemSize))
        );

        const updatedCart = existingIndex >= 0
            ? cart.map((item) =>
                item._id === data._id &&
                    (!data.sizes || !data.sizes.length || getSizeKey(item.selectedSize) === getSizeKey(selectedItemSize))
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            )
            : [
                ...cart,
                {
                    ...data,
                    selectedSize: data.sizes && data.sizes.length > 0 ? selectedItemSize : null,
                    quantity,
                },
            ];

        setCart(updatedCart);
        writeStoredArray(CART_STORAGE_KEY, updatedCart, "cart-update");

        toast.success(t("addToCart"));
        setQuantity(1);
        return true;
    };

    const handleAddToWishlist = () => {
        if (!data) return;

        const isInWish = wishlist.some((item) => item._id === data._id);

        const updatedWishlist = isInWish
            ? wishlist.filter((item) => item._id !== data._id)
            : [...wishlist, data];

        setWishlist(updatedWishlist);
        writeStoredArray(WISHLIST_STORAGE_KEY, updatedWishlist, "wishlist-update");
        toast.success(
            isInWish
                ? t("removedFromWishlist", { defaultValue: "Removed from wishlist" })
                : t("addToWishlist")
        );
    };

    const shareProduct = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: currentTitle,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(
                    window.location.href
                );

                toast.success(t("linkCopied", { defaultValue: "Link copied" }));
            }
        } catch {
            toast.error(t("shareFailed", { defaultValue: "Unable to share product" }));
        }
    };

    if (product.isLoading) {
        return (<ProductSkeleton />);
    }

    if (product.error || !data) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-semibold text-red-500">
                    {t("productNotFound")}
                </h1>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-white px-4 py-10 text-[#1f1f1f] transition-colors dark:bg-[#0f171f] dark:text-white">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* IMAGE */}

                <div>
                    <div className="flex min-h-[360px] w-full justify-center overflow-hidden rounded-md border border-transparent bg-[#f4f7fa] p-5 dark:border-white/10 dark:bg-[#eaf0f4] sm:min-h-[460px]">
                        <img
                            src={selectedImage || data.image}
                            alt={currentTitle}
                            width={616}
                            height={464}
                            className="h-auto max-h-[560px] w-full object-contain object-center"
                        />
                    </div>

                    {data.images && data.images.length > 0 && (
                        <div className="flex gap-3 mt-5 flex-wrap">
                            {data.images.map((img: string, index: number) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedImage(img)}
                                    className={`h-20 w-20 cursor-pointer overflow-hidden rounded-md border bg-[#f4f7fa] p-1 dark:bg-[#eaf0f4] sm:h-24 sm:w-24 ${selectedImage === img ? "border-[#0B4C8C] dark:border-[#55c7ef]" : "border-gray-200 dark:border-white/15"}`}
                                >
                                    <img
                                        src={img}
                                        alt={`${currentTitle} ${index + 1}`}
                                        width={100}
                                        height={100}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CONTENT */}

                <div className="max-w-[700px]">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={16}
                                className="fill-orange-500 text-orange-500"
                            />
                        ))}

                        <span className="ml-2 text-[16px] text-gray-700 dark:text-slate-300">
                            4.7 {t("starRating")}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="mt-4 text-[36px] font-normal text-[#1F1F1F] dark:text-white">
                        {currentTitle}
                    </h1>

                    {/* Product Info */}
                    <div className="grid grid-cols-2 gap-y-4 mt-8 text-[16px]">
                        <p>
                            {t("number")}:
                            <span className="font-semibold ml-1">
                                {data.number}
                            </span>
                        </p>

                        <p>
                            {t("availability")}:
                            <span className={`ml-1 font-semibold ${data.sizes?.some((size) => size.stock !== false) ? "text-green-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                {data.sizes?.some((size) => size.stock !== false)
                                    ? t("inStock")
                                    : t("outOfStock", { defaultValue: "Out of stock" })}
                            </span>
                        </p>

                        <p>
                            {t("brand")}:
                            <span className="font-semibold ml-1">
                                WhiteBear
                            </span>
                        </p>

                        <p>
                            {t("category")}:
                            <span className="font-semibold ml-1 uppercase">
                                {data.category}
                            </span>
                        </p>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3 mt-8">
                        {getSizePrice(selectedSize ?? getPreferredSize(data.sizes)) !== null ? (
                            <p className="text-3xl font-semibold text-[#0B4C8C] dark:text-[#f78a32] sm:text-4xl">
                                {getSizePrice(selectedSize ?? getPreferredSize(data.sizes))?.toLocaleString()} {currency}
                            </p>
                        ) : (
                            <p className="text-lg font-semibold text-gray-600 dark:text-slate-300">{t("priceOnRequest")}</p>
                        )}
                    </div>

                    <hr className="my-8" />

                    {/* Selects */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                        {/* SIZE SELECT */}
                        <div>
                            <label className="block mb-3 text-[16px]">
                                {t("size")}
                            </label>

                            <select
                                value={data.sizes?.findIndex((item) => getSizeKey(item) === getSizeKey(selectedSize)) ?? ""}
                                className="h-14 w-full rounded-md border bg-white px-4 text-gray-700 outline-none focus:border-[#0B4C8C] dark:border-white/15 dark:bg-[#111a23] dark:text-white"
                                onChange={(e) => {
                                    const index = Number(e.target.value);

                                    if (!data?.sizes || isNaN(index)) return;

                                    const item = data.sizes[index];

                                    setSelectedSize(item || null);
                                }}
                            >
                                {data.sizes?.map((item, index) => (
                                    <option key={index} value={index} disabled={item.stock === false}>
                                        {item.size}{item.stock === false ? ` - ${t("outOfStock", { defaultValue: "Out of stock" })}` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {
                            selectedSize?.package && (
                                <div>
                                    <label className="block mb-3 text-[16px]">
                                        {t("numberOfPackages")}
                                    </label>

                                    <select className="h-14 w-full rounded-md border bg-gray-50 px-4 text-gray-700 dark:border-white/15 dark:bg-[#17232d] dark:text-slate-300" disabled>
                                        <option value="">{selectedSize?.package}</option>

                                    </select>
                                </div>
                            )
                        }
                        {
                            selectedSize?.price && (
                                <div>
                                    <label className="block mb-3 text-[16px]">
                                        {t("price", { defaultValue: "Price" })}
                                    </label>

                                    <select className="h-14 w-full rounded-md border bg-gray-50 px-4 text-gray-700 dark:border-white/15 dark:bg-[#17232d] dark:text-slate-300" disabled>
                                        <option value="">
                                            {selectedSize
                                                ? `${Number(
                                                    selectedSize.price?.[currency.toLowerCase() as keyof typeof selectedSize.price] ?? 0
                                                ).toLocaleString()} ${currency}`
                                                : "0"}
                                        </option>
                                    </select>
                                </div>
                            )
                        }
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex h-[50px] items-center rounded-md border">
                            <button
                                onClick={() =>
                                    setQuantity((prev) =>
                                        prev > 1 ? prev - 1 : 1
                                    )
                                }
                                className="w-[40px] flex justify-center"
                            >
                                <Minus size={18} />
                            </button>

                            <span className="w-[60px] text-center">
                                {quantity}
                            </span>

                            <button
                                onClick={() =>
                                    setQuantity((prev) => prev + 1)
                                }
                                className="w-[48px] flex justify-center"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <button
                            onClick={handleCart}
                            disabled={
                                selectedSize?.stock === false ||
                                getSizePrice(selectedSize ?? getPreferredSize(data.sizes)) === null
                            }
                            className="flex h-[50px] items-center gap-2 rounded-md bg-[#ED6D0E] px-6 font-semibold uppercase text-white shadow-[0_10px_24px_rgba(237,109,14,0.22)] hover:bg-[#d95e06] disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
                        >
                            {t("addToCart")}
                        </button>

                        <button
                            onClick={() => {
                                if (handleCart()) navigate("/cart");
                            }}
                            disabled={
                                selectedSize?.stock === false ||
                                getSizePrice(selectedSize ?? getPreferredSize(data.sizes)) === null
                            }
                            className="h-[50px] rounded-md border-2 border-[#ED6D0E] px-4 font-semibold uppercase text-[#ED6D0E] transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 dark:hover:bg-orange-400/10"
                        >
                            {t("buyNow")}
                        </button>
                    </div>

                    {/* Wishlist & Share */}
                    <div className="flex justify-between items-center mt-12">
                        <button
                            onClick={handleAddToWishlist}
                            className="flex items-center gap-2 text-gray-600 dark:text-slate-300"
                        >
                            <Heart
                                size={18}
                                className={
                                    isInWishlist(data._id)
                                        ? "fill-red-500 text-red-500"
                                        : ""
                                }
                            />

                            {isInWishlist(data._id)
                                ? t("inWishlist")
                                : t("addToWishlist")}
                        </button>

                        <button
                            onClick={shareProduct}
                            className="flex items-center gap-2 text-gray-600 dark:text-slate-300"
                        >
                            <Share2 size={18} />
                            {t("shareProduct")}
                        </button>
                    </div>
                </div>
            </div>

            {/* RELATED PRODUCTS */}

            <div className="mt-20">
                <h2 className="text-2xl font-semibold mb-8 uppercase">
                    {t("relatedProduct")}
                </h2>

                <div className="grid md:grid-cols-5 gap-5">
                    {
                        !sameCategoryProducts.isLoading ? (
                            relatedProducts?.slice(0, 10)
                                ?.map((item: Product) => (
                                    <Link
                                        key={item._id}
                                        to={`/shop/${item._id}`}
                                        className="block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_8px_26px_rgba(11,41,69,0.05)] transition hover:border-[#0B4C8C]/40 hover:shadow-lg dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/20"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.title.uz}
                                            width={200}
                                            height={200}
                                            className="h-64 w-full bg-[#f4f7fa] p-4 object-contain object-center dark:bg-[#eaf0f4]"
                                        />

                                        <h3 className="font-medium mt-4 line-clamp-2 pl-2">
                                            {item.title[currentLanguage].length > 18 ? (
                                                `${item.title[currentLanguage].slice(0, 18)}...`
                                            ) : (
                                                item.title[currentLanguage]
                                            )}
                                        </h3>

                                        <p className="text-sky-500 font-bold mt-2 pl-2 pb-2">
                                            {getSizePrice(getPreferredSize(item.sizes)) !== null ? (
                                                <span>
                                                    {getSizePrice(getPreferredSize(item.sizes))?.toLocaleString()} {currency}
                                                </span>
                                            ) : (
                                                <span>{t("priceOnRequest")}</span>
                                            )}
                                        </p>
                                    </Link>
                                ))
                        ) : (
                            <div className="col-span-5 grid md:grid-cols-5 gap-5">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/10"
                                    >
                                        <div className="premium-skeleton h-48 w-full" />
                                        <div className="mt-4 pl-2 space-y-2">
                                            <div className="premium-skeleton h-4 w-24 rounded-md" />
                                            <div className="premium-skeleton h-4 w-32 rounded-md" />
                                        </div>
                                        <div className="premium-skeleton mb-2 ml-2 mt-2 h-5 w-16 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div>
            </div>
          </div>
        </div>

    )
}
