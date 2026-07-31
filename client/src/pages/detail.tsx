"use client";

import { Header } from "@/components/mods/home/header";
import { Footer } from "@/components/mods/home/footer";
import { Navbar } from "@/components/mods/home/navbar";
import { Detail } from "@/components/mods/shop/id";

export default function ProductDetailPage() {


    return (
        <>
            <Header />
            <Navbar />
            <Detail />
            <Footer />
        </>
    );
}
