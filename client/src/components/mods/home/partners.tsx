"use client"


export const Partners = () => {
    const partners = [
        "/partners/1.webp",
        "/partners/2.webp",
        "/partners/3.webp",
        "/partners/4.webp",
        "/partners/5.webp",
        "/partners/6.webp",
        "/partners/7.webp",
        "/partners/8.webp",
        "/partners/9.webp",
        "/partners/10.webp",
    ]

    return (
        <div className="bg-[#0b2945] py-8 dark:bg-[#071018]">
            <section className="overflow-hidden bg-[#f7fafc] py-8 transition-colors dark:bg-[#0d1d29]">
                <div className="w-full overflow-hidden">
                    <div className="flex w-max items-center gap-20 animate-marquee">
                        {[...partners, ...partners].map((partner, index) => (
                            <div
                                key={index}
                                className="relative flex h-20 w-40 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-[#f4f7f9]"
                            >
                                <img
                                    src={partner}
                                    alt={`Partner ${index + 1}`}
                                    width={400}
                                    height={160}
                                    loading="lazy"
                                    decoding="async"
                                    className="object-contain w-full h-full"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <style>{`
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }

                @keyframes marquee {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
            </section>
        </div>
    )
}
