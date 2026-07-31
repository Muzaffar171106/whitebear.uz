"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowRight, Gauge, ShieldCheck, Wrench } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLayoutEffect, useRef } from "react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export const Main = () => {
    const { t } = useTranslation("common")
    const sectionRef = useRef<HTMLElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const productRef = useRef<HTMLDivElement>(null)
    const wordRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger)

        const context = gsap.context(() => {
            gsap.from("[data-hero-reveal]", {
                y: 34,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
            })

            const media = gsap.matchMedia()
            media.add(
                "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
                () => {
                    gsap.to(productRef.current, {
                        yPercent: 18,
                        scale: 1.12,
                        rotate: 3,
                        ease: "none",
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top top",
                            end: "bottom top",
                            scrub: 0.7,
                        },
                    })
                    gsap.to(titleRef.current, {
                        xPercent: -7,
                        opacity: 0.35,
                        ease: "none",
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top top",
                            end: "bottom top",
                            scrub: 0.7,
                        },
                    })
                    gsap.to(wordRef.current, {
                        xPercent: -9,
                        ease: "none",
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top top",
                            end: "bottom top",
                            scrub: 0.7,
                        },
                    })
                }
            )
        }, sectionRef)

        return () => context.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            id="top"
            className="relative min-h-[780px] overflow-hidden bg-[#071d31] text-white md:min-h-[calc(100svh-36px)]"
        >
            <picture className="absolute inset-0 opacity-30">
                <source media="(max-width: 767px)" srcSet="/main-mobile.webp" />
                <img
                    src="/main.webp"
                    alt=""
                    width={1920}
                    height={1081}
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover object-center"
                />
            </picture>
            <div className="absolute inset-0 bg-[#061724]/82" />

            <div
                ref={wordRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[44%] w-max -translate-x-1/2 -translate-y-1/2 text-[clamp(5rem,15vw,15rem)] font-black uppercase leading-none text-white/[0.055]"
            >
                White Bear
            </div>

            <div className="relative z-10 mx-auto grid min-h-[780px] max-w-[1600px] grid-rows-[auto_1fr] px-4 pb-24 pt-28 sm:px-6 md:min-h-[calc(100svh-36px)] md:pb-20 lg:grid-cols-[0.92fr_1.08fr] lg:grid-rows-1 lg:items-center lg:px-8 lg:pt-16">
                <div className="relative z-20 max-w-3xl pt-4 lg:pt-0">
                    <div data-hero-reveal className="mb-5 flex items-center gap-3">
                        <span className="h-0.5 w-10 bg-[#ff8b38]" />
                        <span className="text-xs font-bold uppercase text-white/72 sm:text-sm">
                            WhiteBear Professional Systems
                        </span>
                    </div>

                    <h1
                        ref={titleRef}
                        data-hero-reveal
                        className="max-w-3xl whitespace-pre-line text-4xl font-black leading-[1.02] text-white sm:text-5xl md:text-6xl lg:text-7xl"
                    >
                        {t("homepage.main.title")}
                    </h1>

                    <p
                        data-hero-reveal
                        className="mt-6 max-w-xl text-base font-medium leading-7 text-white/76 sm:text-lg"
                    >
                        {t("homepage.main.description")}
                    </p>

                    <div data-hero-reveal className="mt-8 flex flex-wrap items-center gap-3">
                        <Button
                            asChild
                            className="h-12 rounded-md bg-[#ed6d0e] px-6 text-sm font-bold uppercase text-white shadow-[0_12px_30px_rgba(237,109,14,0.28)] hover:bg-[#d95e06]"
                        >
                            <Link to="/shop">
                                {t("homepage.main.showAll")}
                                <ArrowRight size={18} />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className="h-12 rounded-md border border-white/45 bg-white/[0.06] px-6 text-sm font-bold uppercase text-white backdrop-blur-sm hover:bg-white hover:text-[#0b2945]"
                        >
                            <Link to="/contact">{t("homepage.main.contactUs")}</Link>
                        </Button>
                    </div>
                </div>

                <div
                    ref={productRef}
                    className="relative flex min-h-[330px] items-end justify-center self-end lg:min-h-[620px] lg:items-center lg:self-center"
                >
                    <div className="absolute bottom-[7%] left-1/2 h-[54%] w-[72%] -translate-x-1/2 rounded-lg border border-white/10 bg-white/[0.035] backdrop-blur-[2px] lg:bottom-[16%]" />
                    <img
                        src="/hero-ppr-system.webp"
                        alt="WhiteBear PPR pipes, fittings and valves"
                        width={1200}
                        height={675}
                        decoding="async"
                        className="hero-product-float relative z-10 max-h-[330px] w-full max-w-[98%] object-contain opacity-95 mix-blend-screen drop-shadow-[0_34px_30px_rgba(0,0,0,0.35)] [mask-image:radial-gradient(ellipse_at_center,black_58%,transparent_94%)] sm:max-h-[420px] lg:max-h-[540px]"
                    />
                </div>
            </div>

            <a
                href="#featured-products"
                className="absolute bottom-20 left-8 z-20 hidden items-center gap-3 text-xs font-bold uppercase text-white/60 transition hover:text-white md:flex"
            >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25">
                    <ArrowDown size={16} />
                </span>
                {t("homepage.showcase.scroll")}
            </a>

            <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/15 bg-[#071d31]/92 backdrop-blur-md">
                <div className="mx-auto grid max-w-[1600px] grid-cols-3 divide-x divide-white/15 px-4 sm:px-6 lg:px-8">
                    <HeroFeature icon={<Gauge size={20} />} label="PPR systems" />
                    <HeroFeature icon={<ShieldCheck size={20} />} label="Brass fittings" />
                    <HeroFeature icon={<Wrench size={20} />} label="Heating solutions" />
                </div>
            </div>
        </section>
    )
}

const HeroFeature = ({
    icon,
    label,
}: {
    icon: ReactNode
    label: string
}) => (
    <div className="flex min-h-16 items-center justify-center gap-2 px-2 text-center text-[10px] font-semibold uppercase text-white/78 sm:justify-start sm:px-5 sm:text-sm">
        <span className="text-[#ff8b38]">{icon}</span>
        <span>{label}</span>
    </div>
)
