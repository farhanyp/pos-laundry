import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser, refreshUserToken } from "@/service/login";
import { useAuthStore } from "@/store/useAuthStore";
import { LoginPayload } from "@/types/auth";
import { getStoredRefreshToken, removeStoredRefreshToken } from "@/lib/utils";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: (data) => {
      // data.refreshToken is usually HttpOnly cookie or saved to localStorage securely.
      // For this implementation, the backend returns it in the payload. We save it in localStorage.
      if (data.refreshToken) {
        localStorage.setItem("refresh_token", data.refreshToken);
      }
      setAuth(data.user, data.accessToken);
    },
  });

  const logout = () => {
    removeStoredRefreshToken();
    clearAuth();
    queryClient.clear();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("auth-storage");
      localStorage.removeItem("auth-storage");
    }
  };

  const silentRefresh = async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const data = await refreshUserToken(refreshToken);
      if (data.refreshToken) {
        if (typeof window !== "undefined") {
          localStorage.setItem("refresh_token", data.refreshToken);
        }
      }
      setAuth(data.user, data.accessToken);
      return data;
    } catch (error) {
      logout();
      return null;
    }
  };

  return {
    loginMutation,
    logout,
    silentRefresh,
  };
};
