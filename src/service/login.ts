import { AuthResponse, LoginPayload } from "@/types/auth";

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Gagal masuk: Email atau password salah.");
  }

  return data;
}

export async function refreshUserToken(refreshToken: string): Promise<AuthResponse> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Session expired");
  }

  return data;
}
