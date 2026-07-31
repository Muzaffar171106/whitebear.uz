"use client"
import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import {
    ArrowUpRight,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Send,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { Fetch } from "@/middlewares/Fetch"
import { Link } from "react-router-dom"

export const Contact = () => {
    const { t } = useTranslation("common", { keyPrefix: "homepage.contacts" })
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        website: "",
        message: "",
    })
    const [statusMessage, setStatusMessage] = useState("")
    const [statusType, setStatusType] = useState<"idle" | "success" | "error">("idle")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!formData.name.trim()) {
            setStatusType("error")
            setStatusMessage(t("form.enterName"))
            return
        }

        if (!formData.email.trim()) {
            setStatusType("error")
            setStatusMessage(t("form.enterEmail"))
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(formData.email)) {
            setStatusType("error")
            setStatusMessage(t("form.invalidEmail"))
            return
        }

        if (formData.message.trim().length < 10) {
            setStatusType("error")
            setStatusMessage(t("form.messageMinLength"))
            return
        }

        setIsSubmitting(true)
        setStatusType("idle")
        setStatusMessage("")

        try {
            await Fetch.post("/contact", formData)

            setFormData({
                name: "",
                email: "",
                website: "",
                message: "",
            })

            setStatusType("success")
            setStatusMessage(
                t("form.success")
            )
        } catch (error) {
            setStatusType("error")
            setStatusMessage(
                t("form.error")
            )
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const fieldClassName =
        "mt-2 h-12 rounded-none border-0 border-b border-[#0b2945]/25 bg-transparent px-0 text-base text-[#0b2945] shadow-none placeholder:text-slate-400 focus-visible:border-[#ed6d0e] focus-visible:ring-0 dark:border-white/20 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:border-[#f78a32]"

    return (
        <section
            id="contact"
            className="relative scroll-mt-24 overflow-hidden bg-[#071d31]"
        >
            <div className="mx-auto grid min-h-[800px] max-w-[1800px] lg:grid-cols-[minmax(0,1.16fr)_minmax(440px,0.84fr)]">
                <div className="relative min-h-[680px] overflow-hidden text-white lg:min-h-[800px]">
                    <img
                        src="/contact-factory.webp"
                        alt="WhiteBear factory in Tashkent"
                        width={786}
                        height={458}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,29,49,0.42)_0%,rgba(7,29,49,0.66)_42%,rgba(7,29,49,0.98)_100%)]" />

                    <div className="relative z-10 flex min-h-[680px] flex-col px-4 py-10 sm:min-h-[720px] sm:px-8 sm:py-14 lg:min-h-[800px] lg:px-12 lg:py-16 xl:px-16">
                        <div>
                            <p className="flex items-center gap-3 text-xs font-bold uppercase text-[#ff9a4f]">
                                <span className="h-0.5 w-10 bg-current" />
                                {t("eyebrow")}
                            </p>
                            <h2 className="mt-5 max-w-3xl text-4xl font-extrabold uppercase leading-[1.02] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                                {t("title")}
                            </h2>
                            <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
                                {t("subtitle")}
                            </p>
                        </div>

                        <div className="mt-auto pt-16">
                            <Button
                                asChild
                                variant="outline"
                                className="mb-8 h-11 rounded-md border-white/30 bg-white/8 px-5 text-xs font-bold uppercase text-white backdrop-blur-sm hover:border-white/55 hover:bg-white/15 hover:text-white"
                            >
                                <Link to="/about">
                                    {t("explore")}
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>

                            <div className="border-y border-white/20">
                                <ContactItem
                                    icon={Mail}
                                    label={t("emailLabel")}
                                    href="mailto:info@whitebear.uz"
                                >
                                    info@whitebear.uz
                                </ContactItem>
                                <ContactItem
                                    icon={MapPin}
                                    label={t("locationLabel")}
                                >
                                    Tashkent, Uzbekistan
                                </ContactItem>
                                <ContactItem
                                    icon={Phone}
                                    label={t("phoneLabel")}
                                    href="tel:+998331101777"
                                >
                                    +998 33 110 17 77
                                </ContactItem>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center bg-[#f6f8f9] px-4 py-14 text-[#0b2945] transition-colors dark:bg-[#0f171f] dark:text-white sm:px-8 lg:px-10 lg:py-16 xl:px-14">
                    <div className="w-full">
                        <div className="mb-10 flex items-start justify-between gap-5 border-b border-[#0b2945]/15 pb-7 dark:border-white/12">
                            <div>
                                <p className="text-xs font-bold uppercase text-[#d95e06] dark:text-[#f78a32]">
                                    01 / {t("enquiry")}
                                </p>
                                <h3 className="mt-3 text-3xl font-bold text-[#0b2945] dark:text-white sm:text-4xl">
                                    {t("title")}
                                </h3>
                            </div>
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#0b2945]/15 text-[#0b4c8c] dark:border-white/15 dark:text-[#f78a32]">
                                <Send className="h-5 w-5" />
                            </span>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="text-[#0b2945] dark:text-white"
                        >
                            <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
                                <FormField label={t("form.name")} htmlFor="contact-name">
                                    <Input
                                        id="contact-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        type="text"
                                        autoComplete="name"
                                        className={fieldClassName}
                                    />
                                </FormField>

                                <FormField label={t("form.email")} htmlFor="contact-email">
                                    <Input
                                        id="contact-email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        autoComplete="email"
                                        className={fieldClassName}
                                    />
                                </FormField>
                            </div>

                            <FormField
                                label={t("form.website")}
                                htmlFor="contact-website"
                                className="mt-7"
                            >
                                <Input
                                    id="contact-website"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    type="text"
                                    autoComplete="organization"
                                    className={fieldClassName}
                                />
                            </FormField>

                            <FormField
                                label={t("form.message")}
                                htmlFor="contact-message"
                                className="mt-7"
                            >
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={`${fieldClassName} min-h-32 w-full resize-y py-3 outline-none`}
                                />
                            </FormField>

                            {statusMessage && (
                                <p
                                    role={statusType === "error" ? "alert" : "status"}
                                    className={`mt-5 rounded-md px-4 py-3 text-sm ${
                                        statusType === "success"
                                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                            : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                                    }`}
                                >
                                    {statusMessage}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-8 h-13 w-full justify-between rounded-md bg-[#ed6d0e] px-5 text-sm font-bold uppercase text-white shadow-[0_12px_28px_rgba(237,109,14,0.2)] hover:bg-[#d95e06] disabled:opacity-70"
                            >
                                {isSubmitting
                                    ? t("form.sending", "Sending...")
                                    : t("form.submit")}
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </form>

                        <p className="mt-7 hidden border-t border-[#0b2945]/12 pt-5 text-xs leading-6 text-slate-500 dark:border-white/10 dark:text-slate-400 sm:block">
                            {t("description")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

const ContactItem = ({
    icon: Icon,
    label,
    href,
    children,
}: {
    icon: typeof Mail
    label: string
    href?: string
    children: React.ReactNode
}) => {
    const content = (
        <span className="text-sm font-semibold leading-6 text-white transition-colors group-hover:text-[#ffb47c]">
            {children}
        </span>
    )

    return (
        <div className="group grid grid-cols-[40px_1fr] gap-4 border-b border-white/15 py-4 last:border-b-0 sm:grid-cols-[44px_1fr]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/8 text-[#ff9a4f] backdrop-blur-sm sm:h-11 sm:w-11">
                <Icon className="h-4 w-4" />
            </span>
            <span>
                <span className="mb-1 block text-[10px] font-bold uppercase text-white/52">
                    {label}
                </span>
                {href ? <a href={href}>{content}</a> : content}
            </span>
        </div>
    )
}

const FormField = ({
    label,
    htmlFor,
    className = "",
    children,
}: {
    label: string
    htmlFor: string
    className?: string
    children: React.ReactNode
}) => (
    <label htmlFor={htmlFor} className={`block ${className}`}>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {label}
        </span>
        {children}
    </label>
)
