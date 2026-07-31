import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Fetch } from "../middlewares/Fetch";
import type { AdminTypes, ErrorTypes } from "@/types/RootTypes";
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface LoginResponse {
  token: string;
  user: AdminTypes;
}

export default function Login() {

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const validateForm = (formData: FormData) => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    const emailValue = formData.get("email") as string;
    const password = formData.get("password") as string;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue || !emailRegex.test(emailValue)) {
      newErrors.email = "Please enter a valid email.";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (password.length < 4) {
      newErrors.password = "Password must be at least 4 characters long.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };


  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) return;

    try {
      setLoading(true);

      const response = await Fetch.post<LoginResponse>("admin/login", {
        email: formData.get("email"),
        password: formData.get("password"),
      });


      localStorage.setItem("token", response.data.token);
      toast.success("Successfully logged in!");
      window.location.href = "/";
    } catch (error) {
      const err = error as ErrorTypes;
      setGlobalError("Error: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
      <ThemeToggle className="fixed right-4 top-4 z-20" />
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,42,68,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex min-h-[620px] flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
          <div className="mb-9 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#143b63] p-2">
              <img src="/logo.webp" alt="" className="h-full w-full object-contain brightness-0 invert" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950">White Bear</p>
              <p className="text-xs text-slate-500">Boshqaruv paneli</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
              Hisobingizga kiring
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Mahsulotlar, buyurtmalar va mijozlar bilan ishlashni davom ettiring.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleFormSubmit}>
            {globalError && (
              <Alert variant="default" className="rounded-lg border-rose-200 bg-rose-50 text-rose-700">
                <AlertDescription>{globalError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email manzil
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@whitebear.uz"
                autoComplete="email"
                className={`h-11 rounded-lg bg-slate-50 shadow-none ${
                  errors.email ? "border-rose-500" : "border-slate-200"
                }`}
              />
              {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Parol
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Parolingizni kiriting"
                  autoComplete="current-password"
                  className={`h-11 rounded-lg bg-slate-50 pr-11 shadow-none ${
                    errors.password ? "border-rose-500" : "border-slate-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700"
                  aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-[#143b63] text-white shadow-none hover:bg-[#0f2f4f]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kirilmoqda...
                </>
              ) : (
                <>
                  <LockKeyhole className="h-4 w-4" />
                  Panelga kirish
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Faqat ruxsat berilgan xodimlar uchun
          </p>
        </div>

        <aside className="hidden min-h-[620px] flex-col justify-between bg-[#143b63] p-12 text-white lg:flex">
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
              <ShieldCheck className="h-6 w-6 text-cyan-200" />
            </span>
            <h2 className="mt-8 max-w-sm text-3xl font-semibold leading-tight">
              Savdoni aniq raqamlar bilan boshqaring.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100">
              Buyurtmalar, ombor holati va mijozlar murojaatlari bitta xavfsiz ish maydonida.
            </p>
          </div>

          <div className="border-t border-white/15 pt-6">
            <div className="grid grid-cols-3 gap-5">
              <div>
                <strong className="block text-xl font-semibold">24/7</strong>
                <span className="mt-1 block text-xs text-blue-200">Nazorat</span>
              </div>
              <div>
                <strong className="block text-xl font-semibold">Real-time</strong>
                <span className="mt-1 block text-xs text-blue-200">Statistika</span>
              </div>
              <div>
                <strong className="block text-xl font-semibold">Secure</strong>
                <span className="mt-1 block text-xs text-blue-200">Kirish</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
