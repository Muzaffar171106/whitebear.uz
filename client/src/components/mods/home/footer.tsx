"use client";
import { FaFacebookF, FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export const Footer = () => {
    const { t } = useTranslation("common", {
        keyPrefix: "homepage",
    });

    return (
        <div>
            <div className="bg-[#071d31] text-white px-[5%] pt-8 md:pt-14 pb-12">
                <img src="/footer/logo.webp" alt="Whitebear" width={420} height={168} loading="lazy" decoding="async" className="mb-6 w-50" />
                <div className="flex flex-wrap justify-between gap-8 pr-8">

                    <div>
                        <div className="flex flex-col items-center gap-1 font-medium tabular-nums">
                            <p className="font-medium underline decoration-[#ed6d0e] underline-offset-6">
                                <a href="tel:+9983311017777" className="hover:text-[#f78a32]">
                                    +998 33 110 17 77
                                </a> <br />
                                <a href="tel:+9983398511111" className="hover:text-[#f78a32]">
                                    +998 33 985 11 11
                                </a>
                                <br />
                                <a href="tel:+9983398533333" className="hover:text-[#f78a32]">
                                    +998 33 985 33 33
                                </a>
                            </p>

                            <p className="text-gray-400 text-center no-underline">
                                or
                            </p>

                            <p className="font-medium underline decoration-[#ed6d0e] underline-offset-6">
                                <a
                                    href="mailto:info@whitebear.uz"
                                    className="hover:text-[#f78a32]"
                                >
                                    info@whitebear.uz
                                </a>
                            </p>
                        </div>
                    </div>

                    <div>
                        <h6 className="text-lg font-semibold mb-4">{t("footer.myAccount.title")}</h6>
                        <div className="flex flex-col gap-2 text-sm text-gray-400">
                            <a
                                href="/profile"
                                className="hover:text-white cursor-pointer"
                            >
                                {t("footer.myAccount.profile")}
                            </a>

                            <a
                                href="/profile"
                                className="hover:text-white cursor-pointer"
                            >
                                {t("footer.myAccount.orderHistory")}
                            </a>

                            <a
                                href="/cart"
                                className="hover:text-white cursor-pointer font-normal"
                            >
                                {t("footer.myAccount.shoppingCart")}
                            </a>

                            <a
                                href="/wishlist"
                                className="hover:text-white cursor-pointer"
                            >
                                {t("footer.myAccount.wishlist")}
                            </a>
                        </div>
                    </div>

                    <div className="pr-12 md:pr-0">
                        <h6 className="text-lg font-semibold mb-4">{t("footer.company.title")}</h6>
                        <div className="flex flex-col gap-2 text-sm text-gray-400">
                            <a
                                href="/about"
                                className="hover:text-white cursor-pointer"
                            >
                                {t("footer.company.about")}
                            </a>

                            <a
                                href="/shop"
                                className="hover:text-white cursor-pointer"
                            >
                                {t("footer.company.shop")}
                            </a>

                            <a
                                href="/blog"
                                className="hover:text-white cursor-pointer"
                            >
                                {t("blog")}
                            </a>

                            <a
                                href="/contact"
                                className="hover:text-white cursor-pointer"
                            >
                                {t("footer.help.contact")}
                            </a>
                        </div>
                    </div>

                    <div>
                        <p className="font-bold">{t("footer.download.title")}</p>
                        <div className="flex items-center gap-3 mt-4">
                            <img src="/footer/App Store.svg" alt="App Store" loading="lazy" decoding="async" className="w-30" />
                            <img src="/footer/Google Play.png" alt="Google Play" loading="lazy" decoding="async" className="w-30" />
                        </div>
                    </div>

                </div>

                <div className="border-t border-white/30 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-400">

                    <div className="flex text-xl text-gray-300">
                        <a
                            href="https://www.facebook.com/share/1DSwkcmKjQ"
                            target="_blank"
                            className="w-10 h-10 flex items-center bg-orange-500 justify-center rounded-full text-white "
                        >
                            <FaFacebookF />
                        </a>
                        <a href="https://www.instagram.com/whitebear.uz?igsh=enR6ZG53NWEyZTl2" target="_blank" className="w-10 h-10 flex items-center justify-center rounded-full text-white ">
                            <FaInstagram />
                        </a>
                        <a
                            href="https://t.me/whitebear_uz"
                            target="_blank"
                            className="w-10 h-10 flex items-center justify-center rounded-full text-grey "
                        >
                            <FaTelegramPlane />
                        </a>

                    </div>

                    <p className="text-center">
                        {t("footer.copyright")}
                    </p>

                    <div className="flex items-center justify-center flex-wrap gap-2">
                        <img className="h-10 brightness-0 invert" src="/footer/uzcard.png" alt="Uzcard" loading="lazy" decoding="async" />
                        <img className="h-8" src="/footer/Method=ApplePay.svg" alt="Apple Pay" loading="lazy" decoding="async" />
                        <img className="h-8" src="/footer/Method=Visa.svg" alt="Visa" loading="lazy" decoding="async" />
                        <img className="h-8" src="/footer/Method=Mastercard.svg" alt="Mastercard" loading="lazy" decoding="async" />
                        <img className="h-8" src="/footer/Cart.svg" alt="Payment card" loading="lazy" decoding="async" />
                    </div>

                </div>

            </div>
        </div>
    )
}
