"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuth } from "@/hooks/useAuth";
import { getStoredRefreshToken } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { silentRefresh } = useAuth();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Tunggu Zustand rehydrate dari sessionStorage
      // (Pada praktiknya, jika accessToken sudah ada, kita bisa lanjut)
      
      const refreshToken = getStoredRefreshToken();

      // Jika tidak ada access token dan refresh token, langsung lempar ke login
      if (!accessToken && !refreshToken) {
        router.push("/login");
        return;
      }

      // Jika tidak ada access token tapi ada refresh token, coba refresh
      if (!accessToken && refreshToken) {
        const refreshed = await silentRefresh();
        if (!refreshed) {
          router.push("/login");
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [accessToken, router, silentRefresh]);

  // Tampilkan layar kosong/loading saat mengecek sesi
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-9 h-9 text-primary animate-spin" />
          <p className="text-on-surface-variant font-label-md">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
