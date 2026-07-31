"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Fetch } from "@/middlewares/Fetch";
import { useDispatch } from "react-redux";
import {
  setAdmins,
  setAdminsLoading,
  setAdminsError,
} from "@/toolkit/adminsSlicer";
import { isAxiosError } from "axios";

interface FormData {
  firstName: string;
  email: string;
  password: string;
  role: "admin" | "superadmin";
}

export function AddAdmin() {
  const dispatch = useDispatch();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    email: "",
    password: "",
    role: "admin",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Ism majburiy";
    if (!formData.email.trim()) newErrors.email = "Email majburiy";
    if (!formData.password.trim()) newErrors.password = "Parol majburiy";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAdmins = async () => {
    try {
      dispatch(setAdminsLoading());
      const response = (await Fetch.get("admin")).data;
      dispatch(setAdmins(response));
    } catch {
      dispatch(setAdminsError("Adminlarni yuklashda xatolik"));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await Fetch.post(
        "admin/register",
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Admin muvaffaqiyatli yaratildi ✅");
      getAdmins();
      setFormData({ firstName: "", email: "", password: "", role: "admin" });
      setIsSheetOpen(false);
    } catch (err: unknown) {
      console.error(err);
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : null;
      toast.error(message || "Admin yaratishda xatolik ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button className="bg-[#163555] text-white hover:bg-[#163555]/80">
          Admin qo‘shish
        </Button>
      </SheetTrigger>

      <SheetContent className="border-l border-slate-200 bg-white text-slate-950 dark:border-slate-700 dark:bg-[#101f2e] dark:text-white sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl text-slate-950 dark:text-white">Yangi Admin</SheetTitle>
          <SheetDescription>Barcha maydonlarni to‘ldiring</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 mt-4">
          <div>
            <Label>Ism *</Label>
            <Input
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName}</p>
            )}
          </div>

          <div>
            <Label>Email *</Label>
            <Input
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              type="email"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div>
            <Label>Parol *</Label>
            <Input
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              type="password"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          <div>
            <Label>Rol *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value as "admin" | "superadmin" })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Rol tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="mt-4 w-full bg-[#163555] text-white hover:bg-[#163555]/80"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Saqlanmoqda..." : "Admin yaratish"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
