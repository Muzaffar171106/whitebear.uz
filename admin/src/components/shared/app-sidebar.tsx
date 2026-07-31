import {
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RootState } from "@/store/RootStore";
import type { AdminTypes } from "@/types/RootTypes";

const primaryItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Buyurtmalar", url: "/orders", icon: ShoppingBag },
  { title: "Mahsulotlar", url: "/products", icon: Package },
  { title: "Murojaatlar", url: "/contacts", icon: Mail },
  { title: "Bloglar", url: "/blogs", icon: FileText },
];

const managementItems = [
  { title: "Adminlar", url: "/admins", icon: ShieldCheck, superadminOnly: true },
];

export function AppSidebar({ title = "White Bear" }: { title?: string }) {
  const { data, isPending } = useSelector((state: RootState) => state.user);
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();
  const user = data as AdminTypes;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const renderItems = (
    items: Array<{
      title: string;
      url: string;
      icon: typeof LayoutDashboard;
      superadminOnly?: boolean;
    }>,
  ) =>
    items
      .filter((item) => !item.superadminOnly || user?.role === "superadmin")
      .map((item) => {
        const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
        const Icon = item.icon;

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
              className="h-10 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 data-[active=true]:bg-[#143b63] data-[active=true]:text-white data-[active=true]:shadow-sm data-[active=true]:hover:bg-[#143b63] dark:hover:bg-[#172a3b] dark:hover:text-white dark:data-[active=true]:hover:bg-[#1b527f]"
            >
              <Link to={item.url} onClick={() => setOpenMobile(false)}>
                <Icon className="h-4.5 w-4.5" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      });

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-100 bg-white p-4 group-data-[collapsible=icon]:p-1.5">
        <Link
          to="/"
          className="flex h-11 items-center gap-3 overflow-hidden group-data-[collapsible=icon]:justify-center"
          onClick={() => setOpenMobile(false)}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#143b63] p-1.5 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:p-1">
            <img src="/logo.webp" alt="" className="h-full w-full object-contain brightness-0 invert" />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <strong className="block truncate text-sm font-semibold text-slate-950">{title}</strong>
            <small className="block truncate text-[11px] font-medium text-slate-500">
              Boshqaruv paneli
            </small>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-white px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">{renderItems(primaryItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === "superadmin" && (
          <SidebarGroup className="mt-4 p-0">
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase text-slate-400 group-data-[collapsible=icon]:hidden">
              Tizim
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderItems(managementItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 bg-white p-3 group-data-[collapsible=icon]:p-1.5">
        {isPending ? (
          <Skeleton className="h-12 w-full rounded-lg" />
        ) : (
          <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:justify-center">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-sm font-semibold uppercase text-cyan-800">
              {user?.firstName?.slice(0, 2) || "AD"}
            </span>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs font-semibold text-slate-900">{user?.firstName}</p>
              <p className="truncate text-[10px] text-slate-500">{user?.email}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Chiqish"
              className="h-9 w-9 shrink-0 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700 group-data-[collapsible=icon]:hidden"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
