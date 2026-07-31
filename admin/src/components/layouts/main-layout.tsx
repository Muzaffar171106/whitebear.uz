import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "../shared/app-sidebar"
import { Outlet, useLocation } from "react-router-dom"
import { Navbar } from "../shared/navbar"
import { lazy, Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const AddAdmin = lazy(() => import("@/modules/AddAdmin").then((module) => ({ default: module.AddAdmin })))
const AddBlog = lazy(() => import("@/modules/AddBlog").then((module) => ({ default: module.AddBlog })))
const AddProduct = lazy(() => import("@/modules/AddProduct").then((module) => ({ default: module.AddProduct })))

export default function Layout() {

  const { pathname } = useLocation()
  const ActionComponent =
    pathname === "/blogs"
      ? AddBlog
      : pathname === "/products"
        ? AddProduct
        : pathname === "/admins"
          ? AddAdmin
          : null

  return (
    <SidebarProvider>
      <AppSidebar title="White Bear" />
      <main className="min-w-0 flex-1 bg-background">
        <Navbar
          component={
            ActionComponent ? (
              <Suspense fallback={<Skeleton className="h-9 w-24 rounded-lg" />}>
                <ActionComponent />
              </Suspense>
            ) : undefined
          }
        />
        <div className="admin-content mx-auto w-full max-w-[1680px] p-3 md:p-6">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
