import { Footer } from "@/components/mods/home/footer";
import { Blog } from "@/components/mods/blog/page";
import { Header } from "@/components/mods/home/header";
import { Navbar } from "@/components/mods/home/navbar";

export default function BlogPage() {
    return (
        <div>
            <Header />
            <Navbar />
            <Blog />
            <Footer />
        </div>
    )
}