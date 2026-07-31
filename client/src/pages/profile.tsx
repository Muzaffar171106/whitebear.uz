import { Footer } from "@/components/mods/home/footer";
import { Header } from "@/components/mods/home/header";
import { Navbar } from "@/components/mods/home/navbar";
import AccountSettings from "@/components/mods/profile/profile";

export default function ProfilePage() {
    return (
        <div>
            <Header />
            <Navbar />
            <AccountSettings />
            <Footer />
        </div>
    )
}