"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WashingMachine, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const router = useRouter();
  const { loginMutation } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if remember me was set previously
    const savedEmail = localStorage.getItem("marilaundry_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Silakan isi email dan kata sandi Anda.");
      return;
    }

    setIsLoading(true);

    try {
      await loginMutation.mutateAsync({ email, password });

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("marilaundry_remember_email", email);
      } else {
        localStorage.removeItem("marilaundry_remember_email");
      }

      toast.success("Login berhasil! Mengalihkan ke dasbor...");

      // Wait briefly for the toast to be seen before redirecting
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan pada sistem.");
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center p-8 md:p-16 order-2 md:order-1 h-full w-full bg-surface-container-lowest">
      <div className="flex flex-col items-center justify-center w-full max-w-[420px] mx-auto overflow-y-auto pb-8 md:pb-0 hide-scrollbar">
        {/* Brand Identity */}
        <div className="bg-primary/10 text-primary p-3 rounded-2xl mb-6 shadow-sm border border-primary/20">
          <WashingMachine className="w-10 h-10" />
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-on-surface text-center mb-2">
          Selamat Datang Kembali
        </h1>
        <p className="font-body text-base text-on-surface-variant text-center mb-10">
          Silakan masuk untuk mengelola operasional Mari Laundry
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-1.5">
            <label className="font-label-md font-bold text-on-surface ml-1 block" htmlFor="email">
              Alamat Email
            </label>
            <div className="relative group">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staf@marilaundry.com"
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container border border-outline-variant/40 rounded-xl font-body text-base placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-70 text-on-surface"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="font-label-md font-bold text-on-surface" htmlFor="password">
                Kata Sandi
              </label>
              <button
                type="button"
                className="font-label-sm font-bold text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Lupa Kata Sandi?
              </button>
            </div>
            <div className="relative group">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full pl-12 pr-12 py-3.5 bg-surface-container border border-outline-variant/40 rounded-xl font-body text-base placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-70 text-on-surface"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-70"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none px-1 py-1 group">
            <div className="relative w-5 h-5 border-2 border-outline-variant rounded-[4px] flex items-center justify-center group-hover:border-primary transition-colors bg-surface-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="peer absolute opacity-0 w-full h-full cursor-pointer"
              />
              <svg
                className={cn(
                  "w-3.5 h-3.5 text-primary transition-transform",
                  rememberMe ? "scale-100" : "scale-0"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={4}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-label-md font-medium text-on-surface">Ingat sesi ini</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-on-primary font-label-lg font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Validasi...
              </>
            ) : (
              <>
                Masuk
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="w-full mt-10 pt-6 border-t border-outline-variant/20 text-center">
          <p className="font-body-sm text-on-surface-variant mb-3">Belum punya akun?</p>
          <Link href="/register" className="inline-block px-6 py-2.5 border-2 border-outline-variant/30 text-on-surface hover:border-primary hover:text-primary rounded-xl font-label-md font-bold transition-all">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
