"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, WashingMachine } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { registerUser } from "@/service/register";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    passwordMismatch?: boolean;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, passwordMismatch: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrors({ passwordMismatch: true });
      toast.error("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Registrasi berhasil! Silakan login untuk melanjutkan.");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(err.message || "Terjadi kesalahan sistem yang tidak terduga.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[540px]">
      {/* Mobile Logo (Hidden on Desktop) */}
      <div className="md:hidden flex items-center justify-center gap-2 mb-10">
        <WashingMachine className="text-primary w-8 h-8" />
        <span className="font-display text-3xl font-bold text-primary">Mari Laundry</span>
      </div>

      {/* Form Card */}
      <div className="bg-surface-container-lowest p-8 md:p-10 rounded-2xl border border-outline-variant/30 shadow-md">
        <div className="mb-10 text-center md:text-left">
          <h2 className="font-display text-2xl md:text-[32px] font-bold leading-tight tracking-tight text-on-surface mb-2">
            Registrasi Akun Staf
          </h2>
          <p className="text-on-surface-variant font-body-md">
            Lengkapi data diri Anda untuk memulai sistem kasir laundry.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="font-label-md font-bold text-on-surface px-1 block">
              Nama Lengkap
            </label>
            <input
              name="name"
              type="text"
              required
              disabled={isLoading}
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-5 py-3.5 bg-surface-container border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/50 text-on-surface disabled:opacity-70 font-body text-base"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md font-bold text-on-surface px-1 block">
              Alamat Email
            </label>
            <input
              name="email"
              type="email"
              required
              disabled={isLoading}
              value={formData.email}
              onChange={handleChange}
              placeholder="email@marilaundry.com"
              className="w-full px-5 py-3.5 bg-surface-container border border-outline-variant/40 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/50 text-on-surface disabled:opacity-70 font-body text-base"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="font-label-md font-bold text-on-surface px-1 block">
                Kata Sandi Baru
              </label>
              <input
                name="password"
                type="password"
                required
                disabled={isLoading}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={cn(
                  "w-full px-5 py-3.5 bg-surface-container border rounded-xl outline-none transition-all placeholder:text-on-surface-variant/50 text-on-surface disabled:opacity-70 font-body text-base",
                  errors.passwordMismatch
                    ? "border-error focus:ring-2 focus:ring-error/20"
                    : "border-outline-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-label-md font-bold text-on-surface px-1 block">
                Konfirmasi Kata Sandi
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                disabled={isLoading}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={cn(
                  "w-full px-5 py-3.5 bg-surface-container border rounded-xl outline-none transition-all placeholder:text-on-surface-variant/50 text-on-surface disabled:opacity-70 font-body text-base",
                  errors.passwordMismatch
                    ? "border-error focus:ring-2 focus:ring-error/20"
                    : "border-outline-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-primary text-on-primary font-label-lg font-bold py-4 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Daftar
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Text */}
      <div className="mt-10 text-center">
        <p className="font-body-md text-on-surface-variant">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline underline-offset-4 transition-all"
          >
            Masuk di sini
          </Link>
        </p>
      </div>

      {/* Shared Component: Footer (Mobile version / below form) */}
      <footer className="mt-16 w-full py-6 border-t border-outline-variant/20 flex flex-col items-center gap-4 text-center md:hidden">
        <span className="font-label-sm font-medium text-on-surface-variant">
          © 2026 Mari Laundry Systems. Seluruh hak cipta dilindungi.
        </span>
      </footer>
    </div>
  );
}
