import { Header } from "@/components/mods/home/header";
import { Navbar } from "@/components/mods/home/navbar";
import { AllProducts } from "@/components/mods/shop/products";

export default function ShopPage() {
    return (
        <div>
            <Header />
            <Navbar />
            <AllProducts />
        </div>
    )
}