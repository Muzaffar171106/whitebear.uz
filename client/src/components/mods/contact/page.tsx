"use client"

import { useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import {
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Send,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Fetch } from "@/middlewares/Fetch"

export const Contact = () => {
    const { t } = useTranslation("common", { keyPrefix: "contactus" })
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        website: "",
        message: "",
    })
    const [statusMessage, setStatusMessage] = useState("")
    const [statusType, setStatusType] = useState<"idle" | "success" | "error">("idle")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isMapLoaded, setIsMapLoaded] = useState(false)

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!formData.name.trim()) {
            setStatusType("error")
            setStatusMessage(t("form.enterName", "Please enter your name."))
            return
        }

        if (!formData.email.trim()) {
            setStatusType("error")
            setStatusMessage(t("form.enterEmail", "Please enter your email."))
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            setStatusType("error")
            setStatusMessage(t("form.enterValidEmail", "Please enter a valid email."))
            return
        }

        if (!formData.website.trim()) {
            setStatusType("error")
            setStatusMessage(t("form.enterWebsite", "Please enter your website or request."))
            return
        }

        if (formData.message.trim().length < 10) {
            setStatusType("error")
            setStatusMessage(
                t("form.messageMinLength", "Message must be at least 10 characters.")
            )
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
            setStatusMessage(t("form.success", "Your message has been sent."))
        } catch (error) {
            setStatusType("error")
            setStatusMessage(t("form.error", "Something went wrong. Please try again."))
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const fieldClassName =
        "h-12 rounded-lg border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-[#102a43] shadow-none placeholder:text-slate-400 focus-visible:border-[#178fc7] focus-visible:ring-2 focus-visible:ring-[#178fc7]/15 dark:border-white/10 dark:bg-[#101f2c] dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:border-[#55c7ef]"

    const contactDetails = [
        {
            icon: Phone,
            label: t("hotline", "Hotline"),
            content: (
                <div className="flex flex-col gap-1">
                    {[
                        ["+998331101777", t("phone1", "+998 33 110 17 77")],
                        ["+998339851111", t("phone2", "+998 33 985 11 11")],
                        ["+998339853333", t("phone3", "+998 33 985 33 33")],
                    ].map(([number, label]) => (
                        <a
                            key={number}
                            href={`tel:${number}`}
                            className="w-fit text-[15px] font-medium text-white transition-colors hover:text-[#8bdcf5]"
                        >
                            {label}
                        </a>
                    ))}
                </div>
            ),
        },
        {
            icon: Mail,
            label: t("email", "Email"),
            content: (
                <a
                    href={`mailto:${t("email1", "info@whitebear.uz")}`}
                    className="w-fit text-[15px] font-medium text-white transition-colors hover:text-[#8bdcf5]"
                >
                    {t("email1", "info@whitebear.uz")}
                </a>
            ),
        },
        {
            icon: MapPin,
            label: t("address", "Address"),
            content: (
                <p className="max-w-[280px] text-[15px] leading-6 text-white">
                    {t("address1", "Tashkent, Uzbekistan")}
                    <br />
                    {t("address2", "")}
                </p>
            ),
        },
        {
            icon: Clock3,
            label: t("workingHours", "Working hours"),
            content: (
                <p className="text-[15px] font-medium text-white">
                    {t("workTime", "Monday - Friday 08:00 - 17:00")}
                </p>
            ),
        },
    ]

    return (
        <main className="min-h-screen bg-[#f2f7fa] text-[#102a43] transition-colors dark:bg-[#07131e] dark:text-white">
            <section className="border-b border-[#dce8ef] bg-white/70 dark:border-white/10 dark:bg-[#0a1925]">
                <div className="mx-auto grid max-w-[1320px] gap-7 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:py-16">
                    <div className="max-w-[760px]">
                        <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase text-[#167ca8] dark:text-[#72d2f3]">
                            <span className="h-px w-8 bg-[#21a6d8]" />
                            White Bear
                        </div>
                        <h1 className="text-[36px] font-semibold leading-[1.08] text-[#0b2945] sm:text-[44px] md:text-[52px] dark:text-white">
                            {t("contactUsTitle", "Contact us")}
                        </h1>
                        <p className="mt-5 max-w-[660px] text-[15px] leading-7 text-slate-600 sm:text-base dark:text-slate-300">
                            {t(
                                "contactUsSubtitle",
                                "Tell us what your project needs. Our team will help you choose a reliable solution and answer your questions."
                            )}
                        </p>
                    </div>

                    <div className="flex w-fit items-center gap-3 rounded-lg border border-[#cfe2eb] bg-white px-4 py-3 text-sm text-[#27455f] shadow-[0_8px_24px_rgba(16,42,67,0.05)] dark:border-white/10 dark:bg-[#102230] dark:text-slate-200">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-[#e9f7fb] text-[#137fae] dark:bg-[#143b4c] dark:text-[#7bd8f5]">
                            <CheckCircle2 size={18} />
                        </span>
                        <span>
                            <span className="block font-semibold">
                                {t("responseTitle", "Quick response")}
                            </span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">
                                {t("responseText", "Within one business day")}
                            </span>
                        </span>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-[1320px] gap-6 px-4 py-8 sm:px-6 md:py-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-8">
                <aside className="overflow-hidden rounded-lg bg-[#103a5f] text-white shadow-[0_18px_46px_rgba(11,41,69,0.14)] dark:border dark:border-white/10 dark:bg-[#0d2537]">
                    <div className="border-b border-white/12 px-6 py-7 sm:px-8">
                        <p className="text-xs font-semibold uppercase text-[#8bdcf5]">
                            {t("directContact", "Direct contact")}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold">
                            {t("talkToTeam", "Talk to our team")}
                        </h2>
                        <p className="mt-3 max-w-[430px] text-sm leading-6 text-[#c4d6e4]">
                            {t(
                                "talkToTeamText",
                                "Call, write or visit our office. We will connect you with the right specialist."
                            )}
                        </p>
                    </div>

                    <div className="divide-y divide-white/10 px-6 sm:px-8">
                        {contactDetails.map(({ icon: Icon, label, content }) => (
                            <div
                                key={label}
                                className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 py-5"
                            >
                                <span className="flex size-11 items-center justify-center rounded-lg bg-white/8 text-[#8bdcf5]">
                                    <Icon size={20} />
                                </span>
                                <div className="min-w-0">
                                    <p className="mb-1.5 text-xs font-semibold uppercase text-[#91aabd]">
                                        {label}
                                    </p>
                                    {content}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                <div className="rounded-lg border border-[#dbe6ed] bg-white p-5 shadow-[0_18px_46px_rgba(16,42,67,0.07)] sm:p-7 md:p-8 dark:border-white/10 dark:bg-[#0d1d29] dark:shadow-black/20">
                    <div className="mb-7">
                        <p className="text-xs font-semibold uppercase text-[#167ca8] dark:text-[#72d2f3]">
                            {t("requestEyebrow", "Send a request")}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-[#0b2945] sm:text-[28px] dark:text-white">
                            {t("formTitle", "How can we help?")}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {t(
                                "formSubtitle",
                                "Complete the form and our specialists will contact you shortly."
                            )}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="space-y-2 text-sm font-medium text-[#27455f] dark:text-slate-200">
                                <span>{t("namePlaceholder", "Your name")}</span>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    type="text"
                                    autoComplete="name"
                                    placeholder={t("namePlaceholder", "Your name")}
                                    className={fieldClassName}
                                />
                            </label>

                            <label className="space-y-2 text-sm font-medium text-[#27455f] dark:text-slate-200">
                                <span>{t("emailPlaceholder", "Email")}</span>
                                <Input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@company.com"
                                    className={fieldClassName}
                                />
                            </label>
                        </div>

                        <label className="block space-y-2 text-sm font-medium text-[#27455f] dark:text-slate-200">
                            <span>{t("requestPlaceholder", "Website or request")}</span>
                            <Input
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                type="text"
                                placeholder={t("requestPlaceholder", "Website or request")}
                                className={fieldClassName}
                            />
                        </label>

                        <label className="block space-y-2 text-sm font-medium text-[#27455f] dark:text-slate-200">
                            <span>{t("descPlaceholder", "Message")}</span>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder={t("descPlaceholder", "Message")}
                                rows={6}
                                className="min-h-[148px] w-full resize-y rounded-lg border border-slate-200 bg-[#f8fafc] px-4 py-3 text-[15px] leading-6 text-[#102a43] outline-none transition placeholder:text-slate-400 focus:border-[#178fc7] focus:ring-2 focus:ring-[#178fc7]/15 dark:border-white/10 dark:bg-[#101f2c] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#55c7ef]"
                            />
                        </label>

                        {statusMessage && (
                            <div
                                role="status"
                                className={`rounded-lg border px-4 py-3 text-sm ${
                                    statusType === "success"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                                        : "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300"
                                }`}
                            >
                                {statusMessage}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-1 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                            <p className="max-w-[340px] text-xs leading-5 text-slate-500 dark:text-slate-400">
                                {t(
                                    "privacyNote",
                                    "Your contact information is used only to respond to this request."
                                )}
                            </p>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-12 rounded-lg bg-[#0f79a8] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,121,168,0.2)] transition hover:bg-[#0b6790] disabled:opacity-70 dark:bg-[#1595c8] dark:hover:bg-[#1ca4d8]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 size-4" />
                                )}
                                {isSubmitting
                                    ? t("form.sending", "Sending...")
                                    : t("sendButton", "Send request")}
                            </Button>
                        </div>
                    </form>
                </div>
            </section>

            <section className="mx-auto max-w-[1320px] px-4 pb-14 sm:px-6 md:pb-20">
                <div className="overflow-hidden rounded-lg border border-[#dbe6ed] bg-white shadow-[0_18px_46px_rgba(16,42,67,0.06)] dark:border-white/10 dark:bg-[#0d1d29] dark:shadow-black/20">
                    <div className="flex flex-col gap-4 border-b border-[#dbe6ed] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:border-white/10">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#e9f7fb] text-[#137fae] dark:bg-[#143b4c] dark:text-[#7bd8f5]">
                                <MapPin size={19} />
                            </span>
                            <div>
                                <h2 className="font-semibold text-[#0b2945] dark:text-white">
                                    {t("findUs", "Find our office")}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {t("address1", "Tashkent, Uzbekistan")}{" "}
                                    {t("address2", "")}
                                </p>
                            </div>
                        </div>
                        <a
                            href="https://www.google.com/maps?q=41.372389,69.189706"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#0f79a8] transition hover:text-[#0b5f83] dark:text-[#72d2f3] dark:hover:text-[#a3e6fb]"
                        >
                            {t("openMap", "Open in Google Maps")}
                            <ArrowUpRight size={16} />
                        </a>
                    </div>
                    <div className="relative h-[300px] overflow-hidden bg-[#dce7ed] sm:h-[380px] lg:h-[430px] dark:bg-[#102230]">
                        {!isMapLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#527086] dark:text-slate-400">
                                <span className="flex size-12 items-center justify-center rounded-lg bg-white/70 text-[#178fc7] shadow-sm dark:bg-white/5 dark:text-[#72d2f3]">
                                    <Loader2 className="size-5 animate-spin" />
                                </span>
                                <span className="text-sm font-medium">
                                    {t("loadingMap", "Loading map...")}
                                </span>
                            </div>
                        )}
                        <iframe
                            src="https://maps.google.com/maps?q=41.372389,69.189706&z=16&output=embed"
                            title={t("mapTitle", "White Bear office location")}
                            className={`relative h-full w-full border-0 transition-opacity duration-500 ${
                                isMapLoaded ? "opacity-100" : "opacity-0"
                            }`}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            onLoad={() => setIsMapLoaded(true)}
                        />
                    </div>
                </div>
            </section>
        </main>
    )
}
