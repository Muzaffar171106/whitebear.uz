import { Contact } from "@/components/mods/about/contact";
import { Main } from "@/components/mods/about/main";
import { Partners } from "@/components/mods/home/partners";
import { Footer } from "@/components/mods/home/footer";
import { Header } from "@/components/mods/home/header";
import { Navbar } from "@/components/mods/home/navbar";

export default function AboutPage() {
    return (
        <div className="bg-[#f3f6f8] transition-colors dark:bg-[#0b1117]">
            <Header />
            <Navbar />
            <Main />
            <Contact />
            <Partners />
            <Footer />
        </div>
    )
}
