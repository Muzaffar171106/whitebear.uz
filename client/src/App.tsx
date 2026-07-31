import { Route, Routes } from "react-router-dom"
import Home from "./pages/home"
import { lazy, Suspense } from "react"

const ShopPage = lazy(() => import("./pages/shop"))
const BlogPage = lazy(() => import("./pages/blog"))
const AboutPage = lazy(() => import("./pages/about"))
const ContactPage = lazy(() => import("./pages/contact"))
const NotFound = lazy(() => import("./components/mods/not-found"))
const WishlistPage = lazy(() => import("./pages/wishlist"))
const CartPage = lazy(() => import("./pages/cart"))
const SignInPage = lazy(() => import("./pages/sign-in"))
const SignUpPage = lazy(() => import("./pages/sign-up"))
const ProfilePage = lazy(() => import("./pages/profile"))
const ProductDetailPage = lazy(() => import("./pages/detail"))

function App() {

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:id" element={<ProductDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

function PageLoader() {
  return (
    <div className="min-h-[55vh] bg-[#f3f6f8] px-4 py-14 dark:bg-[#0b1117]" role="status" aria-label="Loading page">
      <div className="mx-auto max-w-[1600px]">
        <div className="premium-skeleton h-3 w-32 rounded-md" />
        <div className="premium-skeleton mt-4 h-10 w-full max-w-md rounded-lg" />
        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_28px_rgba(11,41,69,0.06)] dark:border-white/10 dark:bg-[#111a23] dark:shadow-black/20"
            >
              <div className="premium-skeleton h-40 sm:h-56" />
              <div className="space-y-3 p-4">
                <div className="premium-skeleton h-3 w-20 rounded-md" />
                <div className="premium-skeleton h-5 w-4/5 rounded-md" />
                <div className="premium-skeleton mt-6 h-10 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  )
}

export default App
