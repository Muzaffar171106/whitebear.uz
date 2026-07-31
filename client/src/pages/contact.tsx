import { Footer } from "@/components/mods/home/footer";
import { Contact } from "@/components/mods/contact/page";
import { Header } from "@/components/mods/home/header";
import { Navbar } from "@/components/mods/home/navbar";

export default function ContactPage() {
    return (
        <div>
            <Header />
            <Navbar />
            <Contact />
            <Footer />
        </div>
    )
}