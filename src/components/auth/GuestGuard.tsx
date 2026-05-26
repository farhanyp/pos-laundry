"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getStoredRefreshToken } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { silentRefresh } = useAuth();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkGuest = async () => {
      const refreshToken = getStoredRefreshToken();

      // Jika user sudah login dan punya akses token aktif
      if (accessToken) {
        router.push("/");
        return;
      }

      // Jika tidak punya akses token tapi punya refresh token, cek validitasnya
      if (refreshToken) {
        const refreshed = await silentRefresh();
        if (refreshed) {
          router.push("/");
          return;
        }
      }

      // Jika memang tamu (guest), boleh mengakses halaman ini
      setIsChecking(false);
    };

    checkGuest();
  }, [accessToken, router, silentRefresh]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fefae0]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-[#485422] animate-spin" data-icon="progress_activity">
            progress_activity
          </span>
          <p className="text-[#46483c] font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
