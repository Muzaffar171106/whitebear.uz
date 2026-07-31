import { Bell, CalendarDays } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { SidebarTrigger } from "@/components/ui/sidebar";
import type { RootState } from "@/store/RootStore";
import type { AdminTypes } from "@/types/RootTypes";
import { ThemeToggle } from "./theme-toggle";

interface NavbarProps {
  component?: React.ReactNode;
}

const pageDetails: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Dashboard",
    description: "Asosiy ko'rsatkichlar va jarayonlar",
  },
  "/orders": {
    title: "Buyurtmalar",
    description: "Buyurtma va to'lov holatini boshqarish",
  },
  "/products": {
    title: "Mahsulotlar",
    description: "Katalog, narx va ombor nazorati",
  },
  "/contacts": {
    title: "Murojaatlar",
    description: "Mijozlardan kelgan so'rovlar",
  },
  "/blogs": {
    title: "Bloglar",
    description: "Yangiliklar va foydali materiallar",
  },
  "/admins": {
    title: "Adminlar",
    description: "Jamoa huquqlari va kirish nazorati",
  },
};

const weekdays = [
  "Yakshanba",
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
];
const months = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

const formatDate = (date: Date) =>
  `${weekdays[date.getDay()]}, ${date.getDate()}-${months[date.getMonth()]}`;

export const Navbar = ({ component }: NavbarProps) => {
  const { pathname } = useLocation();
  const user = useSelector((state: RootState) => state.user.data) as AdminTypes;
  const contacts = useSelector((state: RootState) => state.contact.data);
  const details = pageDetails[pathname] || {
    title: "White Bear",
    description: "Boshqaruv paneli",
  };
  const contactCount = Array.isArray(contacts) ? contacts.length : 0;

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-slate-200 bg-background/95 px-3 backdrop-blur md:px-6">
      <SidebarTrigger className="h-9 w-9 shrink-0 rounded-lg text-slate-600 hover:bg-slate-100" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-slate-950 md:text-base">
          {details.title}
        </h1>
        <p className="hidden truncate text-xs text-slate-500 sm:block">{details.description}</p>
      </div>

      <div className="hidden items-center gap-2 border-r border-slate-200 pr-4 text-xs text-slate-500 lg:flex">
        <CalendarDays className="h-4 w-4" />
        <span>{formatDate(new Date())}</span>
      </div>

      {component && <div className="shrink-0">{component}</div>}

      <ThemeToggle />

      <Link
        to="/contacts"
        aria-label="Murojaatlarni ko'rish"
        title="Murojaatlar"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      >
        <Bell className="h-4 w-4" />
        {contactCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
            {contactCount > 9 ? "9+" : contactCount}
          </span>
        )}
      </Link>

      <div className="hidden min-w-0 items-center gap-2 sm:flex">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#143b63] text-xs font-semibold uppercase text-white">
          {user?.firstName?.slice(0, 2) || "AD"}
        </span>
        <div className="hidden min-w-0 xl:block">
          <p className="max-w-32 truncate text-xs font-semibold text-slate-900">{user?.firstName}</p>
          <p className="text-[10px] capitalize text-slate-500">{user?.role || "admin"}</p>
        </div>
      </div>
    </header>
  );
};
