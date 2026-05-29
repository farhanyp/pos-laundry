"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { logoutUser } from "@/service/logout";
import { getStoredRefreshToken, removeStoredRefreshToken } from "@/lib/utils";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    },
    onSuccess: () => {
      removeStoredRefreshToken();
      clearAuth();
      queryClient.clear();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth-storage");
        localStorage.removeItem("auth-storage");
      }
      toast.success("Logout berhasil.");
      router.push("/login");
    },
    onError: (error: any) => {
      removeStoredRefreshToken();
      clearAuth();
      queryClient.clear();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth-storage");
        localStorage.removeItem("auth-storage");
      }
      toast.error(error.message || "Gagal melakukan logout dari server, sesi lokal dihapus.");
      router.push("/login");
    }
  });

  return {
    logoutMutation,
  };
};
