"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, WashingMachine } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrors({ passwordMismatch: true });
      toast.error("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    if (!formData.termsAccepted) {
      toast.error("Anda harus menyetujui Syarat & Ketentuan.");
      return;
    }

    startTransition(async () => {
      try {
        // 1. Sign Up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            }
          }
        });

        if (authError) {
          toast.error(`Gagal mendaftar: ${authError.message}`);
          return;
        }

        const userId = authData.user?.id;
        if (!userId) {
          toast.error("Gagal mendapatkan data user setelah pendaftaran.");
          return;
        }

        // 2. Insert into users table
        const { error: userError } = await supabase
          .from("users")
          .insert({
            id: userId,
            name: formData.name,
            email: formData.email,
          });

        if (userError) {
          toast.error("Terjadi kesalahan saat menyimpan profil pengguna.");
          console.error("User insert error:", userError);
          return;
        }

        // 3. Get 'kasir' role id
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("id")
          .eq("role_name", "kasir")
          .single();

        if (roleError || !roleData) {
          toast.error("Gagal menemukan role kasir di sistem.");
          console.error("Role fetch error:", roleError);
          return;
        }

        // 4. Assign role in user_roles
        const { error: assignRoleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: userId,
            role_id: roleData.id,
          });

        if (assignRoleError) {
          toast.error("Gagal menetapkan role pada akun Anda.");
          console.error("Role assign error:", assignRoleError);
          return;
        }

        toast.success("Registrasi berhasil! Mengalihkan ke dashboard...");
        
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (err) {
        console.error("Registration error:", err);
        toast.error("Terjadi kesalahan sistem yang tidak terduga.");
      }
    });
  };

  return (
    <div className="w-full max-w-[540px]">
      {/* Mobile Logo (Hidden on Desktop) */}
      <div className="md:hidden flex items-center justify-center gap-2 mb-10">
        <WashingMachine className="text-[#485422] w-6 h-6" />
        <span className="text-2xl font-bold text-[#485422]">FreshPress</span>
      </div>

      {/* Form Card */}
      <div className="bg-white/95 backdrop-blur-[8px] p-10 rounded-xl border border-[#77786b]/15 shadow-sm">
        <div className="mb-10">
          <h2 className="text-[32px] font-semibold leading-[40px] tracking-[-0.01em] text-[#1d1c0d] mb-1">
            Registrasi Akun Staff
          </h2>
          <p className="text-[#46483c] text-base">
            Lengkapi data diri Anda untuk memulai workspace laundry.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold tracking-[0.01em] text-[#46483c] px-1">
              Nama Lengkap
            </label>
            <input
              name="name"
              type="text"
              required
              disabled={isPending}
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-6 py-[14px] bg-[#f8f4db] border border-[#77786b]/20 rounded-[10px] focus:ring-2 focus:ring-[#606c38] focus:border-[#606c38] outline-none transition-all placeholder:text-[#77786b]/60 text-[#1d1c0d] disabled:opacity-70"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold tracking-[0.01em] text-[#46483c] px-1">
              Email Bisnis
            </label>
            <input
              name="email"
              type="email"
              required
              disabled={isPending}
              value={formData.email}
              onChange={handleChange}
              placeholder="email@bisnisanda.com"
              className="w-full px-6 py-[14px] bg-[#f8f4db] border border-[#77786b]/20 rounded-[10px] focus:ring-2 focus:ring-[#606c38] focus:border-[#606c38] outline-none transition-all placeholder:text-[#77786b]/60 text-[#1d1c0d] disabled:opacity-70"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold tracking-[0.01em] text-[#46483c] px-1">
                Password Baru
              </label>
              <input
                name="password"
                type="password"
                required
                disabled={isPending}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={cn(
                  "w-full px-6 py-[14px] bg-[#f8f4db] border rounded-[10px] outline-none transition-all placeholder:text-[#77786b]/60 text-[#1d1c0d] disabled:opacity-70",
                  errors.passwordMismatch 
                    ? "border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]" 
                    : "border-[#77786b]/20 focus:ring-2 focus:ring-[#606c38] focus:border-[#606c38]"
                )}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold tracking-[0.01em] text-[#46483c] px-1">
                Konfirmasi Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                disabled={isPending}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={cn(
                  "w-full px-6 py-[14px] bg-[#f8f4db] border rounded-[10px] outline-none transition-all placeholder:text-[#77786b]/60 text-[#1d1c0d] disabled:opacity-70",
                  errors.passwordMismatch 
                    ? "border-[#ba1a1a] focus:ring-2 focus:ring-[#ba1a1a]" 
                    : "border-[#77786b]/20 focus:ring-2 focus:ring-[#606c38] focus:border-[#606c38]"
                )}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <div className="relative mt-1 flex items-center">
              <input
                id="terms"
                name="termsAccepted"
                type="checkbox"
                disabled={isPending}
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="peer h-4 w-4 shrink-0 rounded border-[#77786b] text-[#606c38] focus:ring-[#606c38] disabled:opacity-70 cursor-pointer"
              />
            </div>
            <label
              htmlFor="terms"
              className="text-xs font-medium leading-[16px] text-[#46483c] cursor-pointer select-none"
            >
              Saya menyetujui{" "}
              <Link href="#" className="text-[#485422] underline hover:text-[#606c38] transition-colors">
                Syarat &amp; Ketentuan
              </Link>{" "}
              serta Kebijakan Privasi FreshPress.
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-6 bg-[#606c38] text-white text-sm font-semibold py-6 rounded-[10px] hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Selesaikan Registrasi &amp; Masuk
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Text */}
      <div className="mt-10 text-center">
        <p className="text-base text-[#46483c]">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="text-[#485422] font-bold hover:underline underline-offset-4 transition-all"
          >
            Login di sini
          </Link>
        </p>
      </div>

      {/* Shared Component: Footer (Mobile version / below form) */}
      <footer className="mt-16 w-full py-6 border-t border-[#77786b]/10 flex flex-col items-center gap-4 text-center md:hidden">
        <span className="text-xs font-medium text-[#46483c] opacity-60">
          © 2026 Launderly Systems. All rights reserved.
        </span>
        <div className="flex gap-6">
          <Link href="#" className="text-xs font-medium text-[#46483c] hover:text-[#485422] transition-colors hover:underline underline-offset-4">
            Privacy Policy
          </Link>
          <Link href="#" className="text-xs font-medium text-[#46483c] hover:text-[#485422] transition-colors hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs font-medium text-[#46483c] hover:text-[#485422] transition-colors hover:underline underline-offset-4">
            Support
          </Link>
        </div>
      </footer>
    </div>
  );
}
