"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WashingMachine, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
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
    const savedEmail = localStorage.getItem("freshpress_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Silakan isi email dan password Anda.");
      return;
    }

    setIsLoading(true);

    try {
      await loginMutation.mutateAsync({ email, password });

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("freshpress_remember_email", email);
      } else {
        localStorage.removeItem("freshpress_remember_email");
      }

      toast.success("Login berhasil! Mengalihkan ke dashboard...");

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
    <div className="flex flex-col justify-between p-10 md:p-16 order-2 md:order-1 h-full w-full">
      <div className="flex flex-col items-center justify-center h-full max-w-[450px] mx-auto w-full">
        {/* Brand Identity */}
        <div className="bg-[#606c38] text-[#dfedac] p-2 rounded-lg mb-6 shadow-sm">
          <WashingMachine className="w-8 h-8" />
        </div>

        <h1 className="font-sans text-2xl md:text-3xl font-semibold tracking-tight text-[#485422] text-center mb-1">
          Selamat Datang Kembali
        </h1>
        <p className="font-sans text-base text-[#46483c] text-center mb-10">
          Silakan masuk untuk mengelola operasional laundry Anda
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-1">
            <label className="font-sans text-sm font-semibold tracking-[0.01em] text-[#46483c] ml-1 block" htmlFor="email">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#46483c] group-focus-within:text-[#485422] transition-colors" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@freshpress.com"
                disabled={isLoading}
                className="w-full pl-11 pr-3 py-3 bg-[#f8f4db] border border-[#77786b]/15 rounded-[10px] font-sans text-base placeholder:text-[#77786b]/60 focus:outline-none focus:ring-2 focus:ring-[#606c38] focus:border-transparent transition-all disabled:opacity-70 text-[#1d1c0d]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="font-sans text-sm font-semibold tracking-[0.01em] text-[#46483c]" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                className="font-sans text-sm font-semibold text-[#485422] hover:underline"
              >
                Lupa Password?
              </button>
            </div>
            <div className="relative group">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#46483c] group-focus-within:text-[#485422] transition-colors" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full pl-11 pr-11 py-3 bg-[#f8f4db] border border-[#77786b]/15 rounded-[10px] font-sans text-base placeholder:text-[#77786b]/60 focus:outline-none focus:ring-2 focus:ring-[#606c38] focus:border-transparent transition-all disabled:opacity-70 text-[#1d1c0d]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#46483c] hover:text-[#485422] transition-colors disabled:opacity-70"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none px-1 py-1 group">
            <div className="relative w-5 h-5 border-2 border-[#121f05] rounded-[4px] flex items-center justify-center group-hover:border-[#606c38] transition-colors bg-[#f8f4db]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="peer absolute opacity-0 w-full h-full cursor-pointer"
              />
              <svg
                className={cn(
                  "w-3.5 h-3.5 text-[#606c38] transition-transform",
                  rememberMe ? "scale-100" : "scale-0"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-sans text-sm font-semibold text-[#46483c]">Ingat stasiun ini</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#606c38] hover:bg-[#485422] text-[#dfedac] font-sans text-base font-semibold py-3 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
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

        <div className="w-full mt-16 pt-6 border-t border-[#77786b]/15 text-center">
          <p className="font-sans text-sm text-[#46483c] mb-3">Belum punya akun?</p>
          <Link href="/register" className="inline-block px-6 py-2 border border-[#77786b]/30 text-[#46483c] hover:border-[#606c38] hover:text-[#606c38] rounded-[10px] font-sans text-sm font-semibold transition-all">
            Daftar Sekarang
          </Link>
        </div>
      </div>

      {/* Operational Status Footer */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#d7e9bd]/30 rounded-full">
          <span className="w-2 h-2 bg-[#546341] rounded-full animate-pulse"></span>
          <p className="font-sans text-xs font-medium text-[#3d4b2b]">Station #104: All systems operational</p>
        </div>
      </div>
    </div>
  );
}
