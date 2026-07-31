import { Button } from "@/components/ui/button"
import { TriangleAlert } from "lucide-react"
import { Link } from "react-router-dom"

export const Error = () => {
    return (
        <div className="min-h-[calc(100vh-70px)] p-4 bg-white rounded-md shadow-lg">
            <div className="w-full h-[80vh] flex flex-col gap-2 items-center justify-center text-3xl">
                <div className="flex flex-col items-center gap-2">
                    <TriangleAlert size={64} />
                    Sahifa topilmadi
                </div>
                <Link to={"/"}>
                    <Button className="bg-[#163555] hover:bg-[#163555]/80 text-white">
                        Asosiy sahifaga qaytish
                    </Button>
                </Link>
            </div>
        </div>
    )
}
