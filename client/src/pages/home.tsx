import { Contact } from "@/components/mods/home/contact";
import { Engineered } from "@/components/mods/home/engineed";
import { Footer } from "@/components/mods/home/footer";
import { Header } from "@/components/mods/home/header";
import { Main } from "@/components/mods/home/main";
import { Navbar } from "@/components/mods/home/navbar";
import { Partners } from "@/components/mods/home/partners";
import { ScrollShowcase } from "@/components/mods/home/scroll-showcase";

export const metadata = {
    title: "Whitebear.uz eng yirik ishlab chiqaruvchi",
    description: "Premium PPR piping systems designed for durability, efficiency and modern infrastructure",
    keywords: "products, services, partners, engineering, solutions",
    viewport: "width=device-width, initial-scale=1.0",
    robots: "index, follow",
    openGraph: {
        title: "Whitebear.uz eng yirik ishlab chiqaruvchi",
        description: "Premium PPR piping systems designed for durability, efficiency and modern infrastructure",
        type: "website",
        url: "https://whitebear.com",
    },
};

export default function Home() {
    return (
        <div className="bg-[#f3f6f8] transition-colors dark:bg-[#0b1117]">
            <Header />
            <Navbar />
            <Main />
            <ScrollShowcase />
            <Engineered />
            <Contact />
            <Partners />
            <Footer />
        </div>
    );
}
